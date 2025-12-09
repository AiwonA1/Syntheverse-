"""
Syntheverse AI - Blockchain Integration Bridge
Connects HHF-AI validation system to on-chain Proof-of-Discovery protocol
"""

import hashlib
import json
from typing import Dict, Tuple, Optional
from web3 import Web3
from eth_account import Account
import os
from dotenv import load_dotenv

# Import HHF-AI evaluator (with fallback)
try:
    from .hhf_ai_evaluator import get_evaluator
    HHF_AI_AVAILABLE = True
except ImportError:
    try:
        from hhf_ai_evaluator import get_evaluator
        HHF_AI_AVAILABLE = True
    except ImportError:
        HHF_AI_AVAILABLE = False
        print("Warning: HHF-AI evaluator not available. Install dependencies: pip install -r requirements.txt")

load_dotenv()


class SyntheverseBlockchainBridge:
    """
    Bridge between Syntheverse HHF-AI and blockchain Proof-of-Discovery protocol
    """
    
    def __init__(self, rpc_url: str, private_key: Optional[str] = None, use_real_ai: bool = True):
        """
        Initialize blockchain bridge
        
        Args:
            rpc_url: Ethereum RPC endpoint (local or testnet)
            private_key: Private key for signing transactions (optional for read-only)
            use_real_ai: If True, use real HHF-AI evaluator (requires API key)
        """
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if private_key:
            self.account = Account.from_key(private_key)
            self.w3.eth.default_account = self.account.address
        else:
            self.account = None
        
        # Contract addresses (will be set after deployment)
        self.pod_address = None
        self.ai_integration_address = None
        self.token_address = None
        
        # Contract ABIs (simplified - should load from artifacts)
        self.pod_abi = []  # Load from compiled contract
        self.ai_integration_abi = []  # Load from compiled contract
        
        # Initialize HHF-AI evaluator
        if HHF_AI_AVAILABLE:
            self.evaluator = get_evaluator(use_mock=not use_real_ai)
        else:
            print("Warning: Using fallback mock evaluator (HHF-AI not available)")
            self.evaluator = None
        
    def load_contracts(self, deployment_file: str):
        """
        Load contract addresses from deployment file
        
        Args:
            deployment_file: Path to deployment JSON file
        """
        with open(deployment_file, 'r') as f:
            deployment = json.load(f)
            self.pod_address = deployment['contracts']['ProofOfDiscovery']
            self.ai_integration_address = deployment['contracts']['AIIntegration']
            self.token_address = deployment['contracts']['SyntheverseToken']
    
    def compute_content_hash(self, content: str) -> str:
        """
        Compute semantic hash of content for blockchain submission
        
        Args:
            content: The discovery content to hash
            
        Returns:
            Hex string of content hash
        """
        # Use SHA-256 for content hashing
        # In production, this could use more sophisticated semantic hashing
        content_bytes = content.encode('utf-8')
        hash_obj = hashlib.sha256(content_bytes)
        return '0x' + hash_obj.hexdigest()
    
    def compute_fractal_hash(self, fractal_embedding: Dict) -> str:
        """
        Compute hash of fractal embedding
        
        Args:
            fractal_embedding: Dictionary containing fractal embedding data
            
        Returns:
            Hex string of fractal hash
        """
        # Serialize fractal embedding and hash
        embedding_json = json.dumps(fractal_embedding, sort_keys=True)
        hash_obj = hashlib.sha256(embedding_json.encode('utf-8'))
        return '0x' + hash_obj.hexdigest()
    
    def evaluate_discovery(
        self,
        content: str,
        fractal_embedding: Optional[Dict] = None,
        context: Optional[str] = None
    ) -> Tuple[int, int, int, str]:
        """
        Evaluate discovery using HHF-AI system
        Returns coherence, density, and novelty scores
        
        Args:
            content: Discovery content
            fractal_embedding: Optional fractal embedding data
            context: Optional context about existing discoveries
            
        Returns:
            Tuple of (coherence_score, density_score, novelty_score, analysis)
            Each score is 0-10000
        """
        # Use real HHF-AI evaluator
        if self.evaluator:
            coherence, density, novelty, analysis = self.evaluator.evaluate_discovery(
                content=content,
                fractal_embedding=fractal_embedding,
                context=context
            )
            return (coherence, density, novelty, analysis)
        else:
            # Fallback to simple mock
            coherence = min(10000, len(content) // 10 + 5000)
            density = min(10000, len(content) // 8 + 5000)
            novelty = min(10000, len(content) // 12 + 5000)
            analysis = "Fallback evaluation (HHF-AI not available)"
            return (coherence, density, novelty, analysis)
    
    def submit_discovery(self, content: str, fractal_embedding: Dict) -> str:
        """
        Submit discovery to blockchain
        
        Args:
            content: Discovery content
            fractal_embedding: Fractal embedding
            
        Returns:
            Transaction hash
        """
        if not self.account:
            raise ValueError("Private key required for submitting discoveries")
        
        content_hash = self.compute_content_hash(content)
        fractal_hash = self.compute_fractal_hash(fractal_embedding)
        
        # Get contract instance
        pod_contract = self.w3.eth.contract(
            address=self.pod_address,
            abi=self.pod_abi
        )
        
        # Submit discovery
        tx = pod_contract.functions.submitDiscovery(
            content_hash,
            fractal_hash
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return tx_hash.hex()
    
    def validate_discovery(
        self,
        discovery_id: str,
        coherence: int,
        density: int,
        novelty: int,
        analysis: Optional[str] = None
    ) -> str:
        """
        Validate discovery with AI scores
        
        Args:
            discovery_id: Discovery ID from blockchain
            coherence: Coherence score (0-10000)
            density: Density score (0-10000)
            novelty: Novelty score (0-10000)
            
        Returns:
            Transaction hash
        """
        if not self.account:
            raise ValueError("Private key required for validation")
        
        # Get AI Integration contract
        ai_contract = self.w3.eth.contract(
            address=self.ai_integration_address,
            abi=self.ai_integration_abi
        )
        
        # Process validation
        tx = ai_contract.functions.processValidation(
            discovery_id,
            coherence,
            density,
            novelty
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return tx_hash.hex()
    
    def get_pending_validations(self, limit: int = 10) -> list:
        """
        Get pending validation requests from blockchain
        
        Args:
            limit: Maximum number of requests to fetch
            
        Returns:
            List of discovery IDs pending validation
        """
        ai_contract = self.w3.eth.contract(
            address=self.ai_integration_address,
            abi=self.ai_integration_abi
        )
        
        count = ai_contract.functions.getPendingRequestCount().call()
        actual_limit = min(limit, count)
        
        if actual_limit == 0:
            return []
        
        requests = ai_contract.functions.getPendingRequests(0, actual_limit).call()
        return requests


def main():
    """Example usage of blockchain bridge"""
    # For local Hardhat network
    bridge = SyntheverseBlockchainBridge(
        rpc_url="http://127.0.0.1:8545",
        private_key=os.getenv("PRIVATE_KEY")
    )
    
    # Load deployment addresses
    bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")
    
    # Example: Submit a discovery
    content = "A novel insight about hydrogen-holographic fractal structures"
    fractal_embedding = {
        "coherence": 0.85,
        "density": 0.72,
        "novelty": 0.91
    }
    
    # Evaluate with HHF-AI
    coherence, density, novelty, analysis = bridge.evaluate_discovery(content, fractal_embedding)
    print(f"HHF-AI Evaluation: Coherence={coherence}, Density={density}, Novelty={novelty}")
    print(f"Analysis: {analysis}")
    
    # Submit to blockchain
    tx_hash = bridge.submit_discovery(content, fractal_embedding)
    print(f"Discovery submitted: {tx_hash}")


if __name__ == "__main__":
    main()


