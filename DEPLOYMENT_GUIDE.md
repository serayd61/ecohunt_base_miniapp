# EcoHunt Deployment Guide

## 🚀 Production Deployment

### Step 1: Deploy GreenToken Contract

```bash
cd deployment
npm install
```

Create `.env` file:
```env
PRIVATE_KEY=0x_your_deployer_private_key
BASE_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

Deploy to Base Sepolia:
```bash
npx hardhat run scripts/deploy.js --network baseTestnet
```

Note the contract address after deployment.

### Step 2: Add Verifier to Contract

After deployment, add your verifier wallet as an authorized minter:

```javascript
// In hardhat console or script
const contract = await ethers.getContractAt("GreenTokenV2", "CONTRACT_ADDRESS");
await contract.addVerifier("VERIFIER_WALLET_ADDRESS");
```

### Step 3: Configure Vercel Environment Variables

Go to: https://vercel.com/YOUR_TEAM/ecohunt-base-miniapp/settings/environment-variables

Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key for image analysis |
| `GREEN_TOKEN_ADDRESS` | `0x...` | Deployed GreenToken contract address |
| `VERIFIER_PRIVATE_KEY` | `0x...` | Private key of verifier wallet |

### Step 4: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to Vercel environment variables

### Step 5: Fund Verifier Wallet

The verifier wallet needs Base Sepolia ETH for gas:

1. Go to https://www.base.org/faucet
2. Get testnet ETH for the verifier wallet address

---

## 🧪 Testing

### Test AI Analysis (without blockchain)

Without `GREEN_TOKEN_ADDRESS` set, the system will:
- Use OpenAI for real image analysis ✅
- Return mock transaction hash ⚠️

### Test Full System

With all env vars set:
- Real AI analysis ✅
- Real blockchain transaction ✅
- Real GREEN tokens minted ✅

---

## 📊 How It Works

```
User uploads photo
        ↓
OpenAI Vision analyzes image
        ↓
AI Score calculated (0-100)
        ↓
If score >= 50:
  Calculate token reward
        ↓
  Call GreenTokenV2.verifyAndReward()
        ↓
  Tokens minted to user wallet
        ↓
  Transaction hash returned
```

## 🏆 Token Rewards

| AI Score | GREEN Tokens |
|----------|--------------|
| 90-100   | 100 tokens   |
| 80-89    | 75 tokens    |
| 70-79    | 50 tokens    |
| 60-69    | 30 tokens    |
| 50-59    | 20 tokens    |
| < 50     | 0 (rejected) |

## 🌱 Recognized Activities

- Tree planting / reforestation
- Recycling / waste cleanup
- Beach cleanup / ocean conservation
- Solar panels / renewable energy
- Wildlife protection
- Community gardening
- Urban greening

---

## 🔗 Contract Addresses

### Base Sepolia (Testnet)
- GreenTokenV2: `TBD` (deploy and update)

### Base Mainnet (Production)
- GreenTokenV2: `TBD` (after testnet validation)

