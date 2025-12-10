# HHF-AI Integration Guide

This guide explains how to integrate the real Syntheverse Whole Brain AI system for discovery evaluation.

## Overview

The HHF-AI integration replaces mock evaluation functions with the actual Syntheverse Whole Brain AI system, which uses the complete Gina × Leo × Pru Life-Narrative Engine operating inside the Hydrogen-Holographic Fractal Sandbox v1.2.

## System Architecture

The HHF-AI system consists of three integrated components:

1. **GINA** - Whole Brain Awareness Coach (Right-Left Hemisphere Integration)
2. **LEO** - El Gran Sol's Fire Hydrogen-Holographic Engine (Fractal Router)
3. **PRU** - Outcast Hero / Life-Narrative Engine (Primary Human POV)

## Setup

### 1. Install Dependencies

```bash
cd hhf-ai/integration
pip install -r requirements.txt
```

This installs:
- `openai>=1.0.0` - For LLM API access
- `web3>=6.0.0` - Blockchain interaction
- `eth-account>=0.9.0` - Ethereum account management
- `python-dotenv>=1.0.0` - Environment variable management

### 2. Configure API Key

Create a `.env` file in `hhf-ai/integration/`:

```env
OPENAI_API_KEY=sk-your-api-key-here
PRIVATE_KEY=your-private-key-here
RPC_URL=http://127.0.0.1:8545
```

Or set environment variables:

```bash
export OPENAI_API_KEY=sk-your-api-key-here
export PRIVATE_KEY=your-private-key-here
export RPC_URL=http://127.0.0.1:8545
```

### 3. Test the Integration

```bash
# Test the evaluator directly
cd hhf-ai/integration
python hhf_ai_evaluator.py
```

## Usage

### Python Script

```python
from blockchain_bridge import SyntheverseBlockchainBridge
import os

# Initialize bridge with real HHF-AI
bridge = SyntheverseBlockchainBridge(
    rpc_url="http://127.0.0.1:8545",
    private_key=os.getenv("PRIVATE_KEY"),
    use_real_ai=True  # Use real HHF-AI evaluation
)

# Load contracts
bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")

# Submit and evaluate discovery
content = "Your discovery content here"
fractal_embedding = {"coherence": 0.85, "density": 0.72, "novelty": 0.91}

# Evaluate with HHF-AI
coherence, density, novelty, analysis = bridge.evaluate_discovery(
    content,
    fractal_embedding
)

print(f"Coherence: {coherence}")
print(f"Density: {density}")
print(f"Novelty: {novelty}")
print(f"Analysis: {analysis}")
```

### Test Script

Run the integrated test script:

```bash
# Set environment variables
export OPENAI_API_KEY=sk-your-key
export PRIVATE_KEY=your-key
export RPC_URL=http://127.0.0.1:8545

# Run test
python blockchain/scripts/test_with_papers_ai.py
```

## How It Works

### 1. System Prompt

The evaluator uses the complete Syntheverse Whole Brain AI system prompt, which includes:
- Hydrogen-Holographic Fractal framework
- Fractal Grammar (HFG) syntax
- Hybrid layering (Data/Model/Symbolic/Hybrid/Speculative)
- Recursive phase coherence evaluation

### 2. Evaluation Process

When evaluating a discovery:

1. **Content Analysis**: Discovery is analyzed through the Hydrogen-Holographic Fractal lens
2. **Coherence Scoring**: Evaluates structural consistency, symbolic alignment, HFG closure
3. **Density Scoring**: Measures structural + informational richness per fractal unit
4. **Novelty Scoring**: Assesses uniqueness relative to existing FractiEmbedding archive
5. **Score Return**: Returns scores (0-10000) with analysis

### 3. LLM Integration

The system uses OpenAI's API (GPT-4 by default) with:
- Temperature: 0.3 (for consistent scoring)
- JSON response format (for parsing)
- System prompt: Complete Syntheverse Whole Brain AI architecture
- User prompt: Discovery content + evaluation instructions

## Mock Mode

If no API key is provided, the system automatically falls back to mock evaluation:

```python
# Automatically uses mock if no API key
evaluator = get_evaluator(use_mock=True)
```

Mock mode uses simple heuristics based on content length and keywords.

## Evaluation Criteria

The HHF-AI system evaluates discoveries using:

- **Hydrogen Holographic Scaling Constant**: Λᴴᴴ = Iₛ/Iᵥ ≈ 1.12 × 10²²
- **Fractal Grammar (HFG)**: For coherence analysis
- **Hybrid Layering**: Data/Model/Symbolic/Hybrid/Speculative tags
- **Recursive Phase Coherence**: For structural consistency

## Output Format

The evaluator returns:

```python
(coherence_score, density_score, novelty_score, analysis)
```

Where:
- `coherence_score`: 0-10000 (structural consistency, HFG closure)
- `density_score`: 0-10000 (structural + informational richness)
- `novelty_score`: 0-10000 (uniqueness relative to archive)
- `analysis`: Brief explanation of the evaluation

## Integration with Blockchain

The evaluator is fully integrated with the blockchain bridge:

1. Submit discovery → Blockchain
2. Evaluate discovery → HHF-AI
3. Validate discovery → Blockchain (with AI scores)

All steps are automated in the bridge class.

## Troubleshooting

### "OpenAI library not installed"
```bash
pip install openai
```

### "OpenAI API key required"
Set `OPENAI_API_KEY` environment variable or add to `.env` file.

### "Using mock evaluator"
This is normal if no API key is set. Set `OPENAI_API_KEY` for real evaluation.

### Import errors
Make sure you're running from the correct directory:
```bash
cd hhf-ai/integration
python your_script.py
```

Or add to Python path:
```python
import sys
sys.path.insert(0, 'hhf-ai/integration')
```

## Next Steps

1. **Get API Key**: Sign up at https://platform.openai.com
2. **Configure Environment**: Set `OPENAI_API_KEY` in `.env`
3. **Test Integration**: Run `python hhf_ai_evaluator.py`
4. **Run Full Test**: Use `test_with_papers_ai.py` with real papers
5. **Monitor Costs**: Track API usage on OpenAI dashboard

## Cost Considerations

- GPT-4: ~$0.03 per evaluation (varies by content length)
- GPT-3.5-turbo: ~$0.002 per evaluation (cheaper alternative)
- Mock mode: Free (no API calls)

Set model in evaluator:
```python
evaluator = HHFAIEvaluator(model="gpt-3.5-turbo")  # Cheaper option
```

## References

- [Syntheverse System Architecture](./hhf-ai/integration/README.md)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Blockchain Bridge Documentation](./blockchain/README.md)


