#!/usr/bin/env python3
"""
Initialize Syntheverse RAG System
Loads all research papers into the vector database
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from rag_system import create_rag_system

def main():
    print("=" * 60)
    print("Syntheverse RAG System Initialization")
    print("=" * 60)
    print()
    
    # Determine papers directory
    workspace_root = Path(__file__).parent.parent.parent
    papers_dir = workspace_root / "docs" / "research"
    
    if not papers_dir.exists():
        print(f"❌ Error: Papers directory not found: {papers_dir}")
        return 1
    
    print(f"Papers directory: {papers_dir}")
    print()
    
    # Check for papers
    paper_files = []
    for ext in ['.md', '.txt', '.pdf', '.pdF']:
        paper_files.extend(papers_dir.glob(f"*{ext}"))
    
    if not paper_files:
        print(f"❌ No paper files found in {papers_dir}")
        return 1
    
    print(f"Found {len(paper_files)} paper files:")
    for paper_file in sorted(paper_files):
        print(f"  - {paper_file.name}")
    print()
    
    # Initialize RAG system
    print("Initializing RAG system...")
    try:
        rag = create_rag_system(papers_dir=str(papers_dir))
        print("✓ RAG system initialized")
        print()
    except Exception as e:
        print(f"❌ Error initializing RAG system: {e}")
        print("\nMake sure dependencies are installed:")
        print("  pip install chromadb sentence-transformers PyPDF2 pdfplumber")
        return 1
    
    # Load all papers
    print("Loading papers into vector database...")
    print()
    try:
        loaded_count = rag.load_all_papers(force_reload=True)
        
        if loaded_count == 0:
            print("❌ No papers were loaded")
            return 1
        
        print()
        print("=" * 60)
        print("✓ RAG System Initialized Successfully")
        print("=" * 60)
        print()
        
        # Get summary
        summary = rag.get_paper_summary()
        print(f"Vector Database Summary:")
        print(f"  Total papers: {summary['total_papers']}")
        print(f"  Total chunks: {summary['total_chunks']}")
        print()
        print("Papers loaded:")
        for paper in sorted(summary['papers'], key=lambda x: x['filename']):
            print(f"  ✓ {paper['filename']}: {paper['chunks']} chunks")
        print()
        
        # Verify all papers are included
        loaded_paper_names = {p['filename'] for p in summary['papers']}
        expected_paper_names = {f.name for f in paper_files}
        
        if loaded_paper_names == expected_paper_names:
            print("✓ All papers are loaded in the vector database")
        else:
            missing = expected_paper_names - loaded_paper_names
            if missing:
                print(f"⚠ Warning: Some papers are missing from vector database:")
                for name in missing:
                    print(f"  - {name}")
            extra = loaded_paper_names - expected_paper_names
            if extra:
                print(f"⚠ Note: Extra papers in vector database:")
                for name in extra:
                    print(f"  - {name}")
        print()
        
        # Test retrieval
        print("Testing retrieval...")
        test_queries = [
            "hydrogen holographic fractal",
            "proof of discovery protocol",
            "fractal grammar",
            "octave harmonics"
        ]
        
        for query in test_queries:
            results = rag.retrieve_context(query, n_results=2)
            if results:
                print(f"  Query: '{query}' → Retrieved {len(results)} results")
                for result in results:
                    print(f"    - {result['metadata'].get('paper_filename', 'unknown')}")
            else:
                print(f"  Query: '{query}' → No results")
        print()
        
        print("=" * 60)
        print("RAG system is ready to use!")
        print("=" * 60)
        print()
        print("The HHF-AI evaluator will now automatically use these vectorized papers")
        print("for context retrieval when evaluating discoveries.")
        print()
        
        return 0
        
    except Exception as e:
        print(f"❌ Error loading papers: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
