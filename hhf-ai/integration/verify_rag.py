#!/usr/bin/env python3
"""
Verify RAG System Configuration
Confirms that RAG is using all vectorized papers
"""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from rag_system import create_rag_system

def main():
    print("=" * 60)
    print("Syntheverse RAG System Verification")
    print("=" * 60)
    print()
    
    # Determine papers directory
    workspace_root = Path(__file__).parent.parent.parent
    papers_dir = workspace_root / "docs" / "research"
    
    # Check for papers
    paper_files = []
    for ext in ['.md', '.txt', '.pdf', '.pdF']:
        paper_files.extend(papers_dir.glob(f"*{ext}"))
    
    expected_papers = {f.name for f in paper_files}
    
    print(f"Expected papers ({len(expected_papers)}):")
    for name in sorted(expected_papers):
        print(f"  - {name}")
    print()
    
    # Initialize RAG system
    try:
        rag = create_rag_system(papers_dir=str(papers_dir))
    except Exception as e:
        print(f"❌ Error: Could not initialize RAG system: {e}")
        print("\nRun initialize_rag.py first to set up the vector database.")
        return 1
    
    # Get summary
    summary = rag.get_paper_summary()
    loaded_papers = {p['filename'] for p in summary['papers']}
    
    print(f"Loaded papers in vector database ({len(loaded_papers)}):")
    for paper in sorted(summary['papers'], key=lambda x: x['filename']):
        print(f"  ✓ {paper['filename']}: {paper['chunks']} chunks")
    print()
    
    # Verify
    print("Verification:")
    print(f"  Total papers expected: {len(expected_papers)}")
    print(f"  Total papers loaded: {len(loaded_papers)}")
    print(f"  Total chunks: {summary['total_chunks']}")
    print()
    
    if loaded_papers == expected_papers:
        print("✓ SUCCESS: All papers are loaded in the vector database!")
        print()
        print("The RAG system is configured correctly and will use all vectorized papers")
        print("for context retrieval when the HHF-AI evaluator processes discoveries.")
        return 0
    else:
        missing = expected_papers - loaded_papers
        if missing:
            print(f"❌ ERROR: {len(missing)} paper(s) are missing from vector database:")
            for name in sorted(missing):
                print(f"  - {name}")
            print()
            print("Run initialize_rag.py to load missing papers.")
            return 1
        
        extra = loaded_papers - expected_papers
        if extra:
            print(f"⚠ Note: {len(extra)} extra paper(s) in vector database:")
            for name in sorted(extra):
                print(f"  - {name}")
            print()
        
        return 0

if __name__ == "__main__":
    sys.exit(main())
