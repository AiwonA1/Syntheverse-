#!/usr/bin/env python3
"""
Test Syntheverse blockchain with research papers using REAL HHF-AI evaluation
This script uses the actual Syntheverse Whole Brain AI system
"""

import sys
import os
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hhf-ai" / "integration"))

from blockchain_bridge import SyntheverseBlockchainBridge
from hhf_ai_evaluator import get_evaluator

def read_paper(filename):
    """Read paper content"""
    paper_path = Path(__file__).parent.parent.parent / "docs" / "research" / filename
    try:
        return paper_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        return None

def main():
    print("=" * 60)
    print("Syntheverse Paper Discovery Test with REAL HHF-AI")
    print("=" * 60)
    print()
    
    # Check for API key
    use_real_ai = os.getenv("OPENAI_API_KEY") is not None
    if not use_real_ai:
        print("⚠ Warning: OPENAI_API_KEY not set. Using mock evaluator.")
        print("Set OPENAI_API_KEY environment variable for real HHF-AI evaluation.")
        print()
    
    # Initialize bridge
    rpc_url = os.getenv("RPC_URL", "http://127.0.0.1:8545")
    private_key = os.getenv("PRIVATE_KEY")
    
    if not private_key:
        print("❌ Error: PRIVATE_KEY not set in environment")
        print("Set PRIVATE_KEY environment variable or create .env file")
        return 1
    
    try:
        bridge = SyntheverseBlockchainBridge(
            rpc_url=rpc_url,
            private_key=private_key,
            use_real_ai=use_real_ai
        )
        
        # Load deployment addresses
        deployment_file = Path(__file__).parent.parent / "deployments" / "deployment-localhost.json"
        if not deployment_file.exists():
            print(f"❌ Error: Deployment file not found: {deployment_file}")
            print("Please run 'npm run deploy:local' first")
            return 1
        
        bridge.load_contracts(str(deployment_file))
        print("✓ Loaded deployment addresses")
        print()
        
        # Read papers
        print("=== Reading Papers ===")
        hhf_paper = read_paper("HHF-AI_Paper.pdF")
        pod_paper = read_paper("PoD_Protocol_Paper.pdf")
        
        if not hhf_paper or not pod_paper:
            print("❌ Could not read papers")
            return 1
        
        print(f"✓ HHF-AI Paper loaded ({len(hhf_paper)} characters)")
        print(f"✓ PoD Protocol Paper loaded ({len(pod_paper)} characters)")
        print()
        
        # Paper 1: HHF-AI
        print("=== Paper 1: HHF-AI Paper ===")
        print("Submitting to blockchain...")
        
        hhf_fractal = {
            "type": "HHF-AI",
            "coherence": 0.92,
            "density": 0.85,
            "novelty": 0.95
        }
        
        try:
            tx_hash = bridge.submit_discovery(hhf_paper, hhf_fractal)
            print(f"✓ Submitted: {tx_hash}")
        except Exception as e:
            print(f"⚠ Submission issue (may already exist): {e}")
        
        print()
        print("Evaluating with HHF-AI...")
        coherence, density, novelty, analysis = bridge.evaluate_discovery(
            hhf_paper,
            hhf_fractal
        )
        
        print(f"HHF-AI Evaluation:")
        print(f"  Coherence: {coherence}")
        print(f"  Density: {density}")
        print(f"  Novelty: {novelty}")
        print(f"  Analysis: {analysis}")
        print()
        
        # Paper 2: PoD Protocol
        print("=== Paper 2: PoD Protocol Paper ===")
        print("Submitting to blockchain...")
        
        pod_fractal = {
            "type": "PoD-Protocol",
            "coherence": 0.88,
            "density": 0.92,
            "novelty": 0.90
        }
        
        try:
            tx_hash = bridge.submit_discovery(pod_paper, pod_fractal)
            print(f"✓ Submitted: {tx_hash}")
        except Exception as e:
            print(f"⚠ Submission issue (may already exist): {e}")
        
        print()
        print("Evaluating with HHF-AI...")
        coherence2, density2, novelty2, analysis2 = bridge.evaluate_discovery(
            pod_paper,
            pod_fractal
        )
        
        print(f"HHF-AI Evaluation:")
        print(f"  Coherence: {coherence2}")
        print(f"  Density: {density2}")
        print(f"  Novelty: {novelty2}")
        print(f"  Analysis: {analysis2}")
        print()
        
        print("=" * 60)
        print("Test Complete!")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())



