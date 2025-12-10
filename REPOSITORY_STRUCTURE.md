# Syntheverse Repository Structure

## Overview

This document describes the organized structure of the Syntheverse repository.

---

## Root Directory

```
Syntheverse-/
├── README.md                    # Main project overview and entry point
├── LICENSE                      # MIT License
├── package.json                 # Node.js dependencies and scripts
├── hardhat.config.js           # Hardhat blockchain configuration
├── .gitignore                  # Git ignore patterns
├── .env.example                # Environment variables template
└── REPOSITORY_STRUCTURE.md     # This file
```

**Clean root:** Only essential configuration and entry point files.

---

## Core Directories

### 📚 `docs/` - Documentation

All documentation is organized into subdirectories:

```
docs/
├── README.md                    # Documentation index
├── research/                    # Research papers (8 papers)
│   ├── HHF-AI_Paper.md
│   ├── PoD_Protocol_Paper.md
│   ├── Awarenessverse_Paper.md
│   ├── Octave_Harmonics_Paper.md
│   ├── RSI_HHFS_Paper.md
│   ├── HFG_Paper.md
│   ├── FCC_Paper.md
│   └── HHF_Validation_Suite.md
│
└── guides/                      # User guides and documentation
    ├── QUICKSTART.md
    ├── TEST_ENVIRONMENT_GUIDE.md
    ├── HHF_AI_INTEGRATION.md
    ├── PERSISTENCE_GUIDE.md
    ├── SEPOLIA_DEPLOYMENT.md
    ├── TEST_PAPERS.md
    └── USAGE_EXAMPLES.md
```

### ⛓️ `blockchain/` - Blockchain Implementation

```
blockchain/
├── smart_contracts/             # Solidity contracts
│   ├── SyntheverseToken.sol
│   ├── ProofOfDiscovery.sol
│   └── AIIntegration.sol
│
├── scripts/                     # Deployment and utility scripts
│   ├── deploy.js
│   ├── check_balance.js
│   ├── check_persistence.js
│   ├── get_discovery_summary.js
│   ├── test_multiple_papers.js
│   ├── test_with_papers.js
│   ├── test_with_papers_ai.py
│   └── example_usage.js
│
├── tests/                       # Contract tests
│   └── ProofOfDiscovery.test.js
│
├── deployments/                 # Deployment addresses
│   └── deployment-localhost.json
│
├── artifacts/                   # Compiled contracts (generated)
├── cache/                       # Build cache (generated)
└── README.md                    # Blockchain documentation
```

### 🤖 `hhf-ai/` - AI Integration

```
hhf-ai/
└── integration/                 # Python AI-blockchain bridge
    ├── blockchain_bridge.py
    ├── hhf_ai_evaluator.py
    ├── requirements.txt
    └── README.md
```

### 🎓 `onboarding/` - Cadet Welcome Package

```
onboarding/
├── README.md                    # Welcome message
├── LICENSE.md                   # License for onboarding materials
├── onboarding_guide.md         # Complete onboarding guide
├── first_steps.md              # Quick start checklist
│
├── cadet_resources/             # Visual resources
│   ├── README.md
│   └── [diagram placeholders]
│
├── papers/                      # Paper references
│   ├── README.md
│   └── [paper links]
│
├── tutorials/                   # Step-by-step tutorials
│   ├── local_test_environment_setup.md
│   ├── first_discovery_submission.md
│   └── reward_tracking.md
│
└── community/                   # Community resources
    ├── forum_links.md
    └── collaboration_guidelines.md
```

### 🛠️ `scripts/` - Utility Scripts

```
scripts/
├── setup.sh                     # Initial setup script
├── run_paper_test.sh           # Paper testing script
└── verify_setup.js             # Setup verification
```

### 📊 `test_outputs/` - Test Reports

```
test_outputs/
├── README.md                    # Test outputs guide
├── PAPER_DISCOVERY_SUMMARY.md  # Comprehensive test summary
├── discovery_summary.json      # Discovery data
├── persistence_snapshot.json   # State snapshot
└── [test report files...]      # Generated test reports
```

---

## File Organization Principles

### 1. **Separation of Concerns**
- Documentation separate from code
- Research papers separate from guides
- Scripts organized by purpose

### 2. **Logical Grouping**
- Related files grouped together
- Clear directory names
- Consistent structure

### 3. **Scalability**
- Easy to add new content
- Clear where files belong
- Maintainable structure

### 4. **Discoverability**
- README files in each major directory
- Clear navigation paths
- Logical file naming

---

## Navigation Guide

### For New Cadets
1. Start: `README.md` (root)
2. Onboarding: `onboarding/README.md`
3. First Steps: `onboarding/first_steps.md`
4. Tutorials: `onboarding/tutorials/`

### For Developers
1. Quick Start: `docs/guides/QUICKSTART.md`
2. Test Environment: `docs/guides/TEST_ENVIRONMENT_GUIDE.md`
3. Blockchain: `blockchain/README.md`
4. AI Integration: `hhf-ai/integration/README.md`

### For Researchers
1. Research Papers: `docs/research/`
2. Validation: `docs/research/HHF_Validation_Suite.md`
3. Test Results: `test_outputs/PAPER_DISCOVERY_SUMMARY.md`

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Main Overview | `README.md` |
| Quick Start | `docs/guides/QUICKSTART.md` |
| Test Guide | `docs/guides/TEST_ENVIRONMENT_GUIDE.md` |
| AI Integration | `docs/guides/HHF_AI_INTEGRATION.md` |
| Research Papers | `docs/research/` |
| Onboarding | `onboarding/README.md` |
| Blockchain Docs | `blockchain/README.md` |
| Test Results | `test_outputs/PAPER_DISCOVERY_SUMMARY.md` |

---

## Maintenance

### Adding New Content

- **Research Papers:** Add to `docs/research/`
- **User Guides:** Add to `docs/guides/`
- **Scripts:** Add to `scripts/` or `blockchain/scripts/`
- **Tests:** Add to `blockchain/tests/`
- **Onboarding:** Add to `onboarding/` subdirectories

### Updating Links

When moving files, update:
- README.md references
- Cross-references in markdown files
- Script paths in code
- Package.json scripts (if needed)

---

**This structure ensures the repository remains organized, navigable, and maintainable as it grows.**

