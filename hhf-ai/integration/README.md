# HHF-AI Integration

This directory contains the integration between the Syntheverse Whole Brain AI system and the blockchain Proof-of-Discovery protocol.

## Components

### `hhf_ai_evaluator.py`
The core HHF-AI evaluation module that uses the Syntheverse Whole Brain AI system prompt to evaluate discoveries.

**Features:**
- Integrates Gina × Leo × Pru Life-Narrative Engine
- Uses Hydrogen-Holographic Fractal framework for evaluation
- Applies Fractal Grammar (HFG) analysis
- Returns coherence, density, and novelty scores (0-10000)

**Usage:**
```python
from hhf_ai_evaluator import get_evaluator

# Get evaluator (uses API key from environment or mock)
evaluator = get_evaluator(use_mock=False)

# Evaluate a discovery
coherence, density, novelty, analysis = evaluator.evaluate_discovery(
    content="Your discovery content here",
    fractal_embedding={"coherence": 0.85, "density": 0.72}
)

print(f"Scores: C={coherence}, D={density}, N={novelty}")
print(f"Analysis: {analysis}")
```

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

### 2. Set Environment Variables

Create a `.env` file:

```env
# OpenAI API Key (for real HHF-AI evaluation)
OPENAI_API_KEY=your_openai_api_key_here

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=http://127.0.0.1:8545
```

### 3. Use Mock Evaluator (No API Key)

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

1. **Content Analysis**: Discovery content is analyzed through the Hydrogen-Holographic Fractal lens
2. **Coherence Scoring**: Structural consistency, symbolic alignment, HFG closure
3. **Density Scoring**: Structural + informational richness per fractal unit
4. **Novelty Scoring**: Uniqueness relative to existing FractiEmbedding archive
5. **Score Return**: All scores on 0-10000 scale with analysis

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

