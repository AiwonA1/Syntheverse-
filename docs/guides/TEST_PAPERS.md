# Testing Syntheverse with Research Papers

This guide shows how to test the Syntheverse blockchain using the actual research papers from the `docs/` folder.

## Quick Test (Once npm install completes)

### Option 1: Automated Script

```bash
./run_paper_test.sh
```

This script will:
1. Compile contracts
2. Start local blockchain
3. Deploy contracts
4. Submit both papers as discoveries
5. Validate them with scores
6. Show results

### Option 2: Manual Steps

**Terminal 1 - Start Blockchain:**
```bash
npm run node
```

**Terminal 2 - Deploy & Test:**
```bash
# Deploy contracts
npm run deploy:local

# Run paper test
npx hardhat run blockchain/scripts/test_with_papers.js --network localhost
```

## What the Test Does

1. **Reads the Papers:**
   - `docs/HHF-AI_Paper.pdF` - Hydrogen-Holographic Fractal Awareness System
   - `docs/PoD_Protocol_Paper.pdf` - Proof-of-Discovery Protocol

2. **Submits as Discoveries:**
   - Computes content hashes from paper text
   - Creates fractal embeddings
   - Submits to Proof-of-Discovery contract

3. **Validates with Scores:**
   - HHF-AI Paper: Coherence=9200, Density=8500, Novelty=9500
   - PoD Paper: Coherence=8800, Density=9200, Novelty=9000

4. **Shows Results:**
   - Discovery IDs
   - Validation status
   - Token rewards
   - Coherence density updates
   - Epoch progression

## Expected Output

```
=== Syntheverse Paper Discovery Test ===

✓ Loaded deployment addresses
✓ HHF-AI Paper loaded (XXXX characters)
✓ PoD Protocol Paper loaded (XXXX characters)

=== Paper 1: HHF-AI Paper ===
✓ HHF-AI paper submitted!
  Discovery ID: 0x...
  
=== Paper 2: PoD Protocol Paper ===
✓ PoD Protocol paper submitted!
  Discovery ID: 0x...

=== Validating Discoveries ===
✓ HHF-AI discovery validated!
✓ PoD Protocol discovery validated!

=== Token Rewards ===
Discoverer 1 (HHF-AI) balance: XXXX SYNTH
Discoverer 2 (PoD Protocol) balance: XXXX SYNTH

=== Test Summary ===
✓ Both papers submitted as discoveries
✓ Both discoveries validated with high scores
✓ Token rewards distributed
✓ Coherence density updated
✓ System functioning correctly!
```

## Troubleshooting

**If npm install is still running:**
- Wait for it to complete (it compiles native modules which takes time)
- You can check progress: `ps aux | grep npm`

**If contracts won't compile:**
```bash
rm -rf blockchain/cache blockchain/artifacts
npm run compile
```

**If blockchain won't start:**
- Make sure port 8545 is not in use
- Check `blockchain.log` for errors

**If papers can't be read:**
- Verify files exist in `docs/` folder
- Check file permissions

## Next Steps

After successful test:
1. Review the discovery IDs and scores
2. Check token balances
3. Monitor epoch progression
4. Integrate with actual HHF-AI evaluation system



