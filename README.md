# 🌱 EcoHunt - AI-Powered Environmental Conservation Platform

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Base Network](https://img.shields.io/badge/network-Base-blue.svg)

## 🎯 Overview

EcoHunt is a revolutionary blockchain-based platform that rewards environmental conservation efforts through AI-powered photo verification. Users submit photos of their eco-friendly activities, and our advanced AI system verifies the authenticity and environmental impact to distribute GREEN tokens on the Base network.

## ✨ Key Features

### 🤖 AI-Powered Verification
- **Multi-Layer Analysis**: Google Vision API + OpenAI GPT-4 Vision
- **Environmental Detection**: Trees, conservation activities, recycling efforts
- **Anti-Fraud Protection**: Stock photo detection and authenticity verification
- **Real-time Processing**: Automated scoring and reward distribution

### 🔗 Blockchain Integration
- **Base Network**: Low-cost, fast transactions
- **Smart Contracts**: Transparent and secure token distribution
- **GREEN Token**: ERC-20 token with supply controls
- **Daily Limits**: Anti-spam protection with 100k daily mint limits

### 🎨 User Experience
- **Modern UI**: Clean, responsive Next.js frontend
- **Easy Upload**: Drag-and-drop photo submission
- **Real-time Feedback**: Instant AI verification results
- **Wallet Integration**: Seamless Web3 connectivity

## 🏗 Architecture

```
Frontend (Next.js) ←→ Backend (Node.js) ←→ Base Network
       ↓                    ↓                    ↓
   Photo Upload      AI Verification      Smart Contract
       ↓                    ↓                    ↓
    IPFS Storage     Reward Calculation   Token Distribution
```

## 💰 Reward System

| AI Score | GREEN Tokens | Description |
|----------|--------------|-------------|
| 90-100   | 100 tokens   | Exceptional environmental impact |
| 70-89    | 50 tokens    | Good conservation effort |
| 50-69    | 20 tokens    | Basic environmental activity |
| <50      | 0 tokens     | Below threshold |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Base network wallet with ETH
- API keys for Google Vision & OpenAI

### Installation
```bash
# Clone the repository
git clone https://github.com/serayd61/ecohunt_base_miniapp.git
cd ecohunt_base_miniapp

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Configure your API keys in .env

# Deploy smart contracts
npm run deploy:mainnet

# Start the application
npm run dev
```

## 📁 Project Structure

```
EcoHunt-Production/
├── contracts/           # Smart contracts
│   └── GreenToken.sol   # Main ERC-20 token contract
├── ai-verification/     # AI verification service
├── backend/             # Express.js API server
├── frontend/            # Next.js React app
├── deployment/          # Hardhat deployment scripts
└── tests/              # Test suites
```

## 🔧 Environment Configuration

```env
# Blockchain
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_api_key

# AI Services
GOOGLE_CLOUD_KEY_PATH=/path/to/key.json
OPENAI_API_KEY=sk-your-key

# IPFS Storage
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test smart contracts
npm run test:contracts

# Test AI verification
npm run test:ai
```

## 🚀 Deployment

### Smart Contract Deployment
```bash
# Deploy to Base Mainnet
npm run deploy:mainnet

# Verify on BaseScan
npm run verify:mainnet
```

### Production Deployment
1. Deploy backend to your preferred cloud provider
2. Deploy frontend to Vercel/Netlify
3. Configure environment variables
4. Test the complete flow

## 🔒 Security Features

- **Daily Mint Limits**: 100,000 tokens per user per day
- **Supply Cap**: Maximum 1 billion GREEN tokens
- **Access Control**: Role-based verifier system
- **Pausable Contracts**: Emergency stop functionality
- **Re-entrancy Protection**: Secure transaction handling

## 📊 AI Verification Process

1. **Image Analysis**: Basic metadata and quality checks
2. **Environmental Content**: Detect nature, conservation elements
3. **Activity Recognition**: Identify specific eco-friendly actions
4. **Authenticity Check**: Verify original vs stock photos
5. **Location Verification**: GPS metadata validation
6. **Score Calculation**: Weighted scoring algorithm
7. **Reward Distribution**: Automatic token minting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Environmental Impact

EcoHunt incentivizes real-world environmental conservation by:
- Rewarding tree planting and reforestation efforts
- Encouraging waste cleanup and recycling
- Promoting renewable energy adoption
- Supporting wildlife conservation activities
- Building a community of environmental stewards

## 🔗 Links

- **Website**: [ecohunt.app](https://ecohunt.app)
- **Base Network**: [base.org](https://base.org)
- **Documentation**: [docs.ecohunt.app](https://docs.ecohunt.app)
- **Community**: [Discord](https://discord.gg/ecohunt)

## 🙏 Acknowledgments

- Base Network for scalable blockchain infrastructure
- OpenAI for advanced AI vision capabilities
- Google Cloud for environmental detection
- The environmental conservation community

---

**Made with 💚 for a sustainable future**

🚀 **Generated with [Claude Code](https://claude.ai/code)**
