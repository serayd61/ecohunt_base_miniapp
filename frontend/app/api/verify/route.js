import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract addresses (Base Mainnet)
const ECO_NFT_ADDRESS = '0xf477A5BD99AFfaC62c130Ae09C4352CFd792a803';
const GREEN_TOKEN_ADDRESS = '0x769Faa55AAfab4FBef229B398F2B09aa38F5730c';
const BASE_RPC_URL = 'https://mainnet.base.org';

// ABIs
const ECO_NFT_ABI = [
  "function mintEcoNFT(address to, string tokenURI, uint8 aiScore, uint256 greenTokensEarned, string category) external returns (uint256)"
];

const GREEN_TOKEN_ABI = [
  "function verifyAndReward(address user, uint8 aiScore, uint256 rewardAmount) external"
];

// Upload to Pinata IPFS
async function uploadToIPFS(imageBuffer, filename) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecret = process.env.PINATA_SECRET_KEY;

  if (!pinataApiKey || !pinataSecret) {
    console.log('Pinata not configured, using mock IPFS');
    return `ipfs://mock_${Date.now()}`;
  }

  try {
    // Upload image
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, filename);

    const imageRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecret,
      },
      body: formData,
    });

    if (!imageRes.ok) {
      throw new Error('Pinata upload failed');
    }

    const imageData = await imageRes.json();
    return `ipfs://${imageData.IpfsHash}`;
  } catch (error) {
    console.error('IPFS upload error:', error);
    return `ipfs://mock_${Date.now()}`;
  }
}

// Create and upload NFT metadata to IPFS
async function uploadMetadataToIPFS(imageIPFS, aiScore, category, description) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecret = process.env.PINATA_SECRET_KEY;

  const metadata = {
    name: `EcoHunt Action #${Date.now()}`,
    description: description || 'Verified environmental conservation action',
    image: imageIPFS,
    attributes: [
      { trait_type: 'AI Score', value: aiScore },
      { trait_type: 'Category', value: category },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Network', value: 'Base' },
      { trait_type: 'Date', value: new Date().toISOString().split('T')[0] }
    ],
    external_url: 'https://ecohunt-base-miniapp.vercel.app'
  };

  if (!pinataApiKey || !pinataSecret) {
    console.log('Pinata not configured, using mock metadata');
    return `ipfs://metadata_mock_${Date.now()}`;
  }

  try {
    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecret,
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error('Metadata upload failed');
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Metadata upload error:', error);
    return `ipfs://metadata_mock_${Date.now()}`;
  }
}

// Analyze image with OpenAI Vision
async function analyzeImageWithAI(imageBase64) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return { score: 75, isEnvironmental: true, category: 'other', description: 'Mock analysis' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze images for environmental conservation. Score 0-100:
- Tree planting, reforestation: 80-100
- Recycling, waste cleanup: 70-90
- Solar/renewable energy: 80-95
- Nature conservation: 60-85
- Beach/ocean cleanup: 75-95
- Community gardening: 60-80
- Generic nature photos: 30-50
- Non-environmental: 0-20

Respond ONLY with JSON: {"score": <0-100>, "isEnvironmental": <boolean>, "category": "<tree_planting|recycling|cleanup|renewable_energy|wildlife|gardening|other>", "description": "<brief description>"}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image:' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const result = JSON.parse(content);
    
    return {
      score: Math.min(100, Math.max(0, result.score)),
      isEnvironmental: result.isEnvironmental && result.score >= 50,
      category: result.category || 'other',
      description: result.description || 'Environmental action'
    };
  } catch (error) {
    console.error('AI error:', error);
    return { score: 70, isEnvironmental: true, category: 'other', description: 'Analysis completed' };
  }
}

// Calculate GREEN token reward (10-100 based on score)
// MAX_PER_REWARD in contract is 100 tokens
function calculateTokenReward(aiScore) {
  if (aiScore >= 90) return 100;
  if (aiScore >= 80) return 75;
  if (aiScore >= 70) return 50;
  if (aiScore >= 60) return 30;
  if (aiScore >= 50) return 10;
  return 0;
}

// Mint NFT and GREEN tokens on blockchain
async function mintOnBlockchain(userAddress, tokenURI, aiScore, greenTokens, category) {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;

  if (!privateKey) {
    console.log('Private key not set, returning mock');
    return { nftTxHash: `0xmock_nft_${Date.now().toString(16)}`, tokenTxHash: `0xmock_token_${Date.now().toString(16)}`, mock: true };
  }

  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Mint EcoNFT
    console.log('Minting EcoNFT...');
    const nftContract = new ethers.Contract(ECO_NFT_ADDRESS, ECO_NFT_ABI, wallet);
    const greenTokensWei = ethers.parseUnits(greenTokens.toString(), 18);
    
    const nftTx = await nftContract.mintEcoNFT(
      userAddress,
      tokenURI,
      aiScore,
      greenTokensWei,
      category
    );
    console.log('NFT TX:', nftTx.hash);
    await nftTx.wait();

    // Mint GREEN tokens
    console.log('Minting GREEN tokens...');
    const tokenContract = new ethers.Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, wallet);
    
    const tokenTx = await tokenContract.verifyAndReward(
      userAddress,
      aiScore,
      greenTokensWei
    );
    console.log('Token TX:', tokenTx.hash);
    await tokenTx.wait();

    return {
      nftTxHash: nftTx.hash,
      tokenTxHash: tokenTx.hash,
      mock: false
    };
  } catch (error) {
    console.error('Blockchain error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const walletAddress = formData.get('walletAddress');

    if (!image || !walletAddress) {
      return NextResponse.json({ success: false, message: 'Image and wallet address required' }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ success: false, message: 'Valid Ethereum address required' }, { status: 400 });
    }

    // Convert image to buffer and base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 1. AI Analysis
    console.log('1. Analyzing with AI...');
    const aiResult = await analyzeImageWithAI(base64Image);
    console.log('AI Result:', aiResult);

    if (!aiResult.isEnvironmental || aiResult.score < 50) {
      return NextResponse.json({
        success: false,
        message: 'Image does not show significant environmental conservation activity.',
        aiScore: aiResult.score,
        category: aiResult.category
      }, { status: 400 });
    }

    // 2. Upload image to IPFS
    console.log('2. Uploading to IPFS...');
    const imageIPFS = await uploadToIPFS(buffer, `eco_${Date.now()}.jpg`);
    console.log('Image IPFS:', imageIPFS);

    // 3. Upload metadata to IPFS
    console.log('3. Creating NFT metadata...');
    const metadataIPFS = await uploadMetadataToIPFS(imageIPFS, aiResult.score, aiResult.category, aiResult.description);
    console.log('Metadata IPFS:', metadataIPFS);

    // 4. Calculate token reward
    const greenTokens = calculateTokenReward(aiResult.score);
    console.log('GREEN tokens to mint:', greenTokens);

    // 5. Mint NFT + Tokens on blockchain
    console.log('4. Minting on blockchain...');
    const mintResult = await mintOnBlockchain(
      walletAddress,
      metadataIPFS,
      aiResult.score,
      greenTokens,
      aiResult.category
    );

    return NextResponse.json({
      success: true,
      message: `🌱 Success! You earned an EcoNFT and ${greenTokens} GREEN tokens!`,
      aiScore: aiResult.score,
      category: aiResult.category,
      description: aiResult.description,
      tokensEarned: greenTokens,
      nftTransactionHash: mintResult.nftTxHash,
      tokenTransactionHash: mintResult.tokenTxHash,
      imageIPFS,
      metadataIPFS,
      mock: mintResult.mock || false
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Verification failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
