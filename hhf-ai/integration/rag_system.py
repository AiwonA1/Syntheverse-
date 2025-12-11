"""
Syntheverse RAG System
Retrieval-Augmented Generation system for using vectorized research papers
"""

import os
import json
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import hashlib

# Try to import vector database libraries
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    print("Warning: ChromaDB not installed. Install with: pip install chromadb")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: sentence-transformers not installed. Install with: pip install sentence-transformers")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class SyntheverseRAG:
    """
    RAG system for Syntheverse research papers
    Vectorizes and retrieves context from all research papers
    """
    
    def __init__(
        self,
        papers_dir: Optional[str] = None,
        vector_db_path: Optional[str] = None,
        embedding_model: str = "all-MiniLM-L6-v2",
        use_openai_embeddings: bool = False,
        openai_api_key: Optional[str] = None
    ):
        """
        Initialize RAG system
        
        Args:
            papers_dir: Directory containing research papers (default: docs/research)
            vector_db_path: Path to store vector database (default: .rag_db)
            embedding_model: Sentence transformer model name
            use_openai_embeddings: If True, use OpenAI embeddings instead of sentence transformers
            openai_api_key: OpenAI API key (required if use_openai_embeddings=True)
        """
        # Set up paths
        if papers_dir is None:
            # Default to docs/research relative to workspace root
            workspace_root = Path(__file__).parent.parent.parent
            papers_dir = str(workspace_root / "docs" / "research")
        
        self.papers_dir = Path(papers_dir)
        self.vector_db_path = vector_db_path or ".rag_db"
        
        # Initialize embedding model
        self.use_openai_embeddings = use_openai_embeddings
        if use_openai_embeddings:
            if not OPENAI_AVAILABLE:
                raise ImportError("OpenAI library required for OpenAI embeddings")
            if not openai_api_key:
                openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                raise ValueError("OpenAI API key required for OpenAI embeddings")
            self.openai_client = OpenAI(api_key=openai_api_key)
            self.embedding_model = None
        else:
            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                raise ImportError("sentence-transformers required. Install with: pip install sentence-transformers")
            self.embedding_model = SentenceTransformer(embedding_model)
            self.openai_client = None
        
        # Initialize vector database
        if not CHROMADB_AVAILABLE:
            raise ImportError("ChromaDB required. Install with: pip install chromadb")
        
        self.client = chromadb.PersistentClient(
            path=self.vector_db_path,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="syntheverse_papers",
            metadata={"description": "Syntheverse research papers vector database"}
        )
        
        # Track loaded papers
        self.loaded_papers = set()
    
    def _get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if self.use_openai_embeddings:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        else:
            return self.embedding_model.encode(text).tolist()
    
    def _chunk_text(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
        """
        Split text into chunks for vectorization
        
        Args:
            text: Text to chunk
            chunk_size: Size of each chunk
            chunk_overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        words = text.split()
        
        if len(words) <= chunk_size:
            return [text]
        
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = ' '.join(words[start:end])
            chunks.append(chunk)
            start = end - chunk_overlap
        
        return chunks
    
    def _load_paper(self, file_path: Path) -> Optional[str]:
        """
        Load paper content from file
        
        Args:
            file_path: Path to paper file
            
        Returns:
            Paper content or None if error
        """
        try:
            if file_path.suffix.lower() in ['.md', '.txt']:
                return file_path.read_text(encoding='utf-8')
            elif file_path.suffix.lower() == '.pdf':
                # Try to use PyPDF2 or pdfplumber if available
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() + "\n"
                        return text
                except ImportError:
                    try:
                        import pdfplumber
                        with pdfplumber.open(file_path) as pdf:
                            text = ""
                            for page in pdf.pages:
                                text += page.extract_text() + "\n"
                            return text
                    except ImportError:
                        print(f"Warning: PDF parsing libraries not available. Install PyPDF2 or pdfplumber to process {file_path.name}")
                        return None
            else:
                print(f"Warning: Unsupported file type: {file_path.suffix}")
                return None
        except Exception as e:
            print(f"Error loading {file_path.name}: {e}")
            return None
    
    def load_all_papers(self, force_reload: bool = False) -> int:
        """
        Load all papers from papers directory into vector database
        
        Args:
            force_reload: If True, reload papers even if already loaded
            
        Returns:
            Number of papers loaded
        """
        if not self.papers_dir.exists():
            print(f"Warning: Papers directory not found: {self.papers_dir}")
            return 0
        
        # Find all paper files
        paper_files = []
        for ext in ['.md', '.txt', '.pdf', '.pdF']:
            paper_files.extend(self.papers_dir.glob(f"*{ext}"))
        
        if not paper_files:
            print(f"No paper files found in {self.papers_dir}")
            return 0
        
        loaded_count = 0
        
        for paper_file in paper_files:
            paper_id = paper_file.stem
            
            # Check if already loaded
            if not force_reload and paper_id in self.loaded_papers:
                continue
            
            print(f"Loading paper: {paper_file.name}")
            content = self._load_paper(paper_file)
            
            if not content:
                continue
            
            # Chunk the paper
            chunks = self._chunk_text(content)
            
            # Generate embeddings and store
            chunk_ids = []
            chunk_texts = []
            chunk_embeddings = []
            chunk_metadatas = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{paper_id}_chunk_{i}"
                chunk_ids.append(chunk_id)
                chunk_texts.append(chunk)
                chunk_embeddings.append(self._get_embedding(chunk))
                chunk_metadatas.append({
                    "paper_id": paper_id,
                    "paper_filename": paper_file.name,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                })
            
            # Add to collection
            self.collection.add(
                ids=chunk_ids,
                documents=chunk_texts,
                embeddings=chunk_embeddings,
                metadatas=chunk_metadatas
            )
            
            self.loaded_papers.add(paper_id)
            loaded_count += 1
            print(f"  ✓ Loaded {len(chunks)} chunks from {paper_file.name}")
        
        print(f"\n✓ Loaded {loaded_count} papers into vector database")
        print(f"  Total chunks: {self.collection.count()}")
        return loaded_count
    
    def retrieve_context(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Retrieve relevant context from vector database
        
        Args:
            query: Query text
            n_results: Number of results to retrieve
            filter_metadata: Optional metadata filters
            
        Returns:
            List of retrieved documents with metadata
        """
        if self.collection.count() == 0:
            print("Warning: Vector database is empty. Run load_all_papers() first.")
            return []
        
        # Get query embedding
        query_embedding = self._get_embedding(query)
        
        # Query collection
        where = filter_metadata if filter_metadata else None
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where
        )
        
        # Format results
        retrieved = []
        if results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                retrieved.append({
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else None
                })
        
        return retrieved
    
    def get_paper_summary(self) -> Dict[str, int]:
        """
        Get summary of loaded papers
        
        Returns:
            Dictionary with paper counts and total chunks
        """
        if self.collection.count() == 0:
            return {
                'total_papers': 0,
                'total_chunks': 0,
                'papers': []
            }
        
        # Get all unique papers
        all_results = self.collection.get()
        papers = {}
        
        if all_results['metadatas']:
            for metadata in all_results['metadatas']:
                paper_id = metadata.get('paper_id', 'unknown')
                if paper_id not in papers:
                    papers[paper_id] = {
                        'paper_id': paper_id,
                        'filename': metadata.get('paper_filename', 'unknown'),
                        'chunks': 0
                    }
                papers[paper_id]['chunks'] += 1
        
        return {
            'total_papers': len(papers),
            'total_chunks': self.collection.count(),
            'papers': list(papers.values())
        }


def create_rag_system(
    papers_dir: Optional[str] = None,
    use_openai_embeddings: bool = False,
    openai_api_key: Optional[str] = None
) -> SyntheverseRAG:
    """
    Factory function to create RAG system
    
    Args:
        papers_dir: Directory containing research papers
        use_openai_embeddings: Use OpenAI embeddings
        openai_api_key: OpenAI API key
        
    Returns:
        SyntheverseRAG instance
    """
    return SyntheverseRAG(
        papers_dir=papers_dir,
        use_openai_embeddings=use_openai_embeddings,
        openai_api_key=openai_api_key
    )


if __name__ == "__main__":
    # Test RAG system
    print("Initializing Syntheverse RAG System...")
    
    rag = create_rag_system()
    
    print("\nLoading all papers...")
    loaded = rag.load_all_papers()
    
    if loaded > 0:
        print(f"\n✓ Successfully loaded {loaded} papers")
        
        # Get summary
        summary = rag.get_paper_summary()
        print(f"\nVector Database Summary:")
        print(f"  Total papers: {summary['total_papers']}")
        print(f"  Total chunks: {summary['total_chunks']}")
        print(f"\nPapers loaded:")
        for paper in summary['papers']:
            print(f"  - {paper['filename']}: {paper['chunks']} chunks")
        
        # Test retrieval
        print("\n\nTesting retrieval...")
        test_query = "hydrogen holographic fractal"
        results = rag.retrieve_context(test_query, n_results=3)
        
        print(f"\nQuery: '{test_query}'")
        print(f"Retrieved {len(results)} results:")
        for i, result in enumerate(results, 1):
            print(f"\n  Result {i}:")
            print(f"    Paper: {result['metadata'].get('paper_filename', 'unknown')}")
            print(f"    Distance: {result['distance']:.4f}" if result['distance'] else "    Distance: N/A")
            print(f"    Text preview: {result['text'][:200]}...")
    else:
        print("No papers loaded. Check papers directory path.")
