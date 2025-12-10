# HHF Validation Suite

Empirical validation framework for the Hydrogen-Holographic Fractal Whole Brain AI (HHF-WB) hypothesis.

## Overview

This package provides automated validation pipelines testing HHF predictions across four independent domains:

| Validation | Domain | Key Metric |
|------------|--------|------------|
| Biological Proxy | Environmental time series | PFD: 1.024, HFD: 0.871 |
| Isotopologue Scaling | Hydrogen isotopes (H₂, D₂, T₂) | Λᴴᴴ deviation: <2.4% |
| Molecular/Photonic | HHF constants vs CODATA | Spectral consistency: PASS |
| PEFF Seismic/EEG | Geophysical + neural | Cross-domain PFD: ~1.02 |

## Installation

### Using uv (Recommended)

```bash
# Create virtual environment and install all dependencies
uv venv --python 3.12
uv pip install -e ".[all]"

# Run commands via uv
uv run pytest tests/ -v
uv run python examples/run_all.py
```

### Using pip

```bash
# Install from source
pip install -e .

# With EEG analysis support
pip install -e ".[eeg]"

# With development tools
pip install -e ".[dev]"
```

## Quick Start

```python
from hhf_validation.validations import (
    run_biological_validation,
    run_isotopologue_validation,
    run_molecular_photonic_validation,
    run_peff_validation
)

# Run individual validations
result = run_biological_validation(output_dir="outputs/biological")
result = run_isotopologue_validation(output_dir="outputs/isotopologue")
result = run_molecular_photonic_validation(output_dir="outputs/molecular_photonic")
result = run_peff_validation(output_dir="outputs/peff")

# Run all validations
from hhf_validation.runner import run_all_validations
results = run_all_validations(output_base_dir="outputs/")
```

## Validation Domains

### 1. Biological Proxy Validation

Tests HHF predictions against environmental time series data:
- **PFD (Phase Fractal Dimension)**: Expected ~1.024
- **HFD (Hydrogen Fractal Dimension)**: Expected ~0.871
- Validates fractal scaling in biological systems

### 2. Isotopologue Scaling Validation

Validates hydrogen isotope scaling relationships:
- Tests H₂, D₂, T₂ isotopologue ratios
- **Λᴴᴴ (Hydrogen Holographic Constant)**: Deviation <2.4%
- Confirms hydrogen-holographic scaling predictions

### 3. Molecular/Photonic Validation

Compares HHF constants against CODATA physical constants:
- Spectral line consistency checks
- Molecular transition validations
- Photonic coherence measurements

### 4. PEFF Seismic/EEG Validation

Cross-domain validation using geophysical and neural data:
- Seismic pattern analysis
- EEG coherence measurements
- **Cross-domain PFD**: Expected ~1.02
- Validates HHF predictions across physical scales

## Output Format

Each validation returns a structured result:

```python
{
    "validation_name": "biological_proxy",
    "status": "PASS" | "FAIL" | "PARTIAL",
    "metrics": {
        "pfd": 1.024,
        "hfd": 0.871,
        "deviation": 0.012
    },
    "output_dir": "outputs/biological/",
    "timestamp": "2025-01-09T12:00:00Z"
}
```

## Advanced Usage

### Custom Validation Parameters

```python
result = run_biological_validation(
    output_dir="outputs/biological",
    time_series_file="data/environmental.csv",
    window_size=1000,
    fractal_dimension_method="higuchi"
)
```

### Batch Processing

```python
from hhf_validation.runner import run_batch_validation

configs = [
    {"validation": "biological", "params": {"window_size": 500}},
    {"validation": "isotopologue", "params": {"precision": "high"}},
]

results = run_batch_validation(configs, output_base_dir="outputs/batch/")
```

## Integration with Syntheverse

This validation suite can be integrated with the Syntheverse Proof-of-Discovery protocol:

1. **Submit validation results as discoveries**
2. **Use validation metrics as coherence/density scores**
3. **Track validation status on-chain**
4. **Reward successful validations**

See `blockchain/scripts/test_with_papers_ai.py` for integration examples.

## References

- HHF-AI Paper: `docs/HHF-AI_Paper.pdF`
- PoD Protocol Paper: `docs/PoD_Protocol_Paper.pdf`
- Validation Suite Repository: (to be added)

## License

MIT License - See LICENSE file for details.


