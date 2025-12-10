# Repository Reorganization Plan

## Current Issues

1. **Root-level documentation clutter:** Many markdown files in root
2. **Scattered guides:** Documentation spread across root, docs/, and onboarding/
3. **Scripts in root:** Utility scripts mixed with config files
4. **Unclear structure:** Hard to navigate for new contributors

## Proposed Structure

```
Syntheverse-/
├── README.md                    # Main entry point
├── LICENSE                      # License file
├── package.json                 # Dependencies
├── hardhat.config.js           # Hardhat config
├── .gitignore                  # Git ignore
├── .env.example                # Environment template
│
├── docs/                       # All documentation
│   ├── research/               # Research papers
│   │   ├── HHF-AI_Paper.md
│   │   ├── PoD_Protocol_Paper.md
│   │   ├── Awarenessverse_Paper.md
│   │   ├── Octave_Harmonics_Paper.md
│   │   ├── RSI_HHFS_Paper.md
│   │   ├── HFG_Paper.md
│   │   ├── FCC_Paper.md
│   │   └── HHF_Validation_Suite.md
│   │
│   ├── guides/                 # User guides
│   │   ├── QUICKSTART.md
│   │   ├── TEST_ENVIRONMENT_GUIDE.md
│   │   ├── HHF_AI_INTEGRATION.md
│   │   ├── PERSISTENCE_GUIDE.md
│   │   ├── SEPOLIA_DEPLOYMENT.md
│   │   ├── TEST_PAPERS.md
│   │   └── USAGE_EXAMPLES.md
│   │
│   └── architecture/           # Architecture docs (future)
│
├── blockchain/                 # Blockchain implementation
│   ├── smart_contracts/        # Solidity contracts
│   ├── scripts/                # Deployment & utility scripts
│   ├── tests/                  # Contract tests
│   ├── deployments/            # Deployment addresses
│   ├── artifacts/              # Compiled contracts
│   ├── cache/                 # Build cache
│   └── README.md              # Blockchain docs
│
├── hhf-ai/                     # AI integration
│   └── integration/            # Python bridge
│       ├── blockchain_bridge.py
│       ├── hhf_ai_evaluator.py
│       ├── requirements.txt
│       └── README.md
│
├── onboarding/                 # Cadet welcome package
│   ├── README.md
│   ├── LICENSE.md
│   ├── onboarding_guide.md
│   ├── first_steps.md
│   ├── cadet_resources/
│   ├── papers/
│   ├── tutorials/
│   └── community/
│
├── scripts/                    # Root-level utility scripts
│   ├── setup.sh
│   ├── run_paper_test.sh
│   └── verify_setup.js
│
├── test_outputs/               # Test reports and outputs
│   ├── README.md
│   └── [test reports...]
│
└── node_modules/               # Dependencies (gitignored)
```

## Benefits

1. **Clear separation:** Documentation, code, and scripts organized
2. **Easy navigation:** Logical grouping of related files
3. **Scalable:** Easy to add new content in appropriate locations
4. **Professional:** Standard repository structure

## Migration Steps

1. Create `docs/guides/` directory
2. Move root-level guide files to `docs/guides/`
3. Move research papers to `docs/research/`
4. Create `scripts/` directory for root-level scripts
5. Update all internal links/references
6. Update README.md with new structure

