# HHF-AI Integration

This directory contains the integration between the Syntheverse Whole Brain AI system and the blockchain Proof-of-Discovery protocol.

## Components

### `rag_system.py`
**Retrieval-Augmented Generation (RAG) System** for vectorizing and retrieving context from all research papers.

**Features:**
- Vectorizes all research papers (PDF and Markdown) from `docs/research/`
- Uses ChromaDB for persistent vector storage
- Supports sentence transformers or OpenAI embeddings
- Automatic chunking and indexing
- Semantic search for relevant context retrieval

**Usage:**
```python
from rag_system import create_rag_system

# Initialize RAG system
rag = create_rag_system()

# Load all papers into vector database
rag.load_all_papers()

# Retrieve relevant context
results = rag.retrieve_context("hydrogen holographic fractal", n_results=5)
```

**Initialization:**
```bash
# Initialize vector database with all papers
python initialize_rag.py

# Verify all papers are loaded
python verify_rag.py
```

### `hhf_ai_evaluator.py`
The core HHF-AI evaluation module that uses the Syntheverse Whole Brain AI system prompt to evaluate discoveries. **Now includes RAG integration for automatic context retrieval from vectorized papers.**

**Features:**
- Integrates Gina × Leo × Pru Life-Narrative Engine
- Uses Hydrogen-Holographic Fractal framework for evaluation
- Applies Fractal Grammar (HFG) analysis
- Returns coherence, density, and novelty scores (0-10000)

**Usage:**
```python
from hhf_ai_evaluator import get_evaluator

# Get evaluator with RAG enabled (default)
# RAG automatically retrieves context from vectorized papers
evaluator = get_evaluator(use_mock=False, use_rag=True)

# Evaluate a discovery
# The evaluator will automatically retrieve relevant context from research papers
coherence, density, novelty, analysis = evaluator.evaluate_discovery(
    content="Your discovery content here",
    fractal_embedding={"coherence": 0.85, "density": 0.72}
)

print(f"Scores: C={coherence}, D={density}, N={novelty}")
print(f"Analysis: {analysis}")
```

**RAG Integration:**
- By default, the evaluator uses RAG to retrieve relevant context from all vectorized research papers
- Context is automatically included in the evaluation prompt
- Set `use_rag=False` to disable RAG and use only the provided context

### `blockchain_bridge.py`
Bridge between HHF-AI evaluation and blockchain contracts.

**Features:**
- Submits discoveries to blockchain
- Evaluates discoveries using HHF-AI
- Validates discoveries with AI scores
- Manages validation queue

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `chromadb` - Vector database for storing paper embeddings
- `sentence-transformers` - Embedding model for vectorization
- `PyPDF2` / `pdfplumber` - PDF parsing (if PDF papers are added)
- `openai` - For LLM evaluation and optional OpenAI embeddings
- `web3`, `eth-account` - Blockchain integration

### 2. Initialize RAG System

Before using the evaluator, initialize the vector database with all research papers:

```bash
cd hhf-ai/integration
python initialize_rag.py
```

This will:
- Load all papers from `docs/research/` (supports `.md`, `.txt`, `.pdf`)
- Chunk and vectorize each paper
- Store embeddings in ChromaDB (`.rag_db` directory)
- Verify all papers are loaded

**Verify RAG is using all papers:**
```bash
python verify_rag.py
```

### 3. Set Environment Variables

Create a `.env` file:

```env
# OpenAI API Key (for real HHF-AI evaluation)
OPENAI_API_KEY=your_openai_api_key_here

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=http://127.0.0.1:8545
```

### 4. Use Mock Evaluator (No API Key)

If you don't have an OpenAI API key, the system will automatically use a mock evaluator:

```python
from hhf_ai_evaluator import get_evaluator

# Force mock mode
evaluator = get_evaluator(use_mock=True)
```

## HHF-AI System

The evaluator uses the complete Syntheverse Whole Brain AI system prompt, which includes:

- **GINA**: Whole Brain Awareness Coach (hemispheric integration)
- **LEO**: Hydrogen-Holographic Fractal Engine (fractal routing)
- **PRU**: Outcast Hero / Life-Narrative Engine (narrative advancement)

The system applies:
- Hydrogen Holographic Scaling Constant: Λᴴᴴ ≈ 1.12 × 10²²
- Fractal Grammar (HFG) for coherence analysis
- Hybrid layering (Data/Model/Symbolic/Hybrid/Speculative)
- Recursive phase coherence evaluation

## Evaluation Process

1. **RAG Context Retrieval** (if enabled): Automatically retrieves relevant context from all vectorized research papers based on discovery content
2. **Content Analysis**: Discovery content is analyzed through the Hydrogen-Holographic Fractal lens
3. **Coherence Scoring**: Structural consistency, symbolic alignment, HFG closure
4. **Density Scoring**: Structural + informational richness per fractal unit
5. **Novelty Scoring**: Uniqueness relative to existing FractiEmbedding archive and retrieved context
6. **Score Return**: All scores on 0-10000 scale with analysis

**RAG Context:**
- The evaluator uses semantic search to find the most relevant chunks from all research papers
- Retrieved context is automatically included in the evaluation prompt
- This ensures evaluations are informed by the full corpus of Syntheverse research

## Integration with Blockchain

The evaluator is integrated with the blockchain bridge:

```python
from blockchain_bridge import SyntheverseBlockchainBridge

bridge = SyntheverseBlockchainBridge(
    rpc_url="http://127.0.0.1:8545",
    private_key=os.getenv("PRIVATE_KEY"),
    use_real_ai=True  # Use real HHF-AI evaluation
)

# Submit and evaluate
content = "Your discovery"
fractal_embedding = {"coherence": 0.85, "density": 0.72}

# Submit to blockchain
tx_hash = bridge.submit_discovery(content, fractal_embedding)

# Evaluate with HHF-AI
coherence, density, novelty, analysis = bridge.evaluate_discovery(content, fractal_embedding)

# Validate on blockchain
bridge.validate_discovery(discovery_id, coherence, density, novelty)
```

## Testing

Run the test script:

```bash
python hhf_ai_evaluator.py
```

This will test the evaluator with a sample discovery.

## Notes

- The system requires an OpenAI API key for real evaluation
- Mock evaluator is available for testing without API access
- Evaluation uses GPT-4 by default (configurable)
- Temperature is set to 0.3 for consistent scoring
- All responses are JSON-formatted for parsing



