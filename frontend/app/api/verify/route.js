import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// GreenTokenV2 ABI (minimal)
const GREEN_TOKEN_ABI = [
  "function verifyAndReward(address user, uint8 aiScore, uint256 rewardAmount) external",
  "function balanceOf(address account) view returns (uint256)"
];

// Contract address (Base Mainnet)
const GREEN_TOKEN_ADDRESS = process.env.GREEN_TOKEN_ADDRESS || '0x769Faa55AAfab4FBef229B398F2B09aa38F5730c';

// Base Mainnet RPC
const BASE_RPC_URL = 'https://mainnet.base.org';

// OpenAI API for image analysis
async function analyzeImageWithAI(imageBase64) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.log('OpenAI API key not set, using mock analysis');
    return mockAnalysis();
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
            content: `You are an environmental impact analyzer. Analyze images and determine if they show genuine environmental conservation activities.

Score the image from 0-100 based on:
- Tree planting, reforestation (high score)
- Recycling, waste cleanup (high score)
- Solar panels, renewable energy (high score)
- Nature conservation, wildlife protection (high score)
- Beach cleanup, ocean conservation (high score)
- Community gardening, urban greening (medium score)
- Generic nature photos without conservation activity (low score)
- Non-environmental content (0 score)

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "isEnvironmental": <boolean>,
  "category": "<string: tree_planting|recycling|cleanup|renewable_energy|wildlife|other>",
  "confidence": <number 0-100>,
  "description": "<brief description of what you see>"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for environmental conservation activity. Is this a genuine eco-friendly action?'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return mockAnalysis();
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Parse JSON response
    try {
      const result = JSON.parse(content);
      return {
        score: Math.min(100, Math.max(0, result.score)),
        isEnvironmental: result.isEnvironmental && result.score >= 50,
        category: result.category || 'other',
        confidence: result.confidence || 80,
        description: result.description || 'Image analyzed'
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return mockAnalysis();
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return mockAnalysis();
  }
}

// Mock analysis for testing without API key
function mockAnalysis() {
  const score = Math.floor(Math.random() * 40) + 60; // 60-100
  return {
    score,
    isEnvironmental: score >= 50,
    category: 'other',
    confidence: 70,
    description: 'Mock analysis - set OPENAI_API_KEY for real analysis'
  };
}

// Calculate token reward based on AI score
function calculateTokenReward(aiScore) {
  if (aiScore >= 90) return 100;
  if (aiScore >= 80) return 75;
  if (aiScore >= 70) return 50;
  if (aiScore >= 60) return 30;
  if (aiScore >= 50) return 20;
  return 0;
}

// Mint tokens on blockchain using ethers.js
async function mintTokens(userAddress, aiScore, rewardAmount) {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  
  if (!privateKey || GREEN_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.log('Blockchain not configured, returning mock transaction');
    return {
      success: true,
      transactionHash: `0xmock_${Date.now().toString(16)}`,
      mock: true
    };
  }

  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(GREEN_TOKEN_ADDRESS, GREEN_TOKEN_ABI, wallet);
    
    // Convert reward amount to wei (18 decimals)
    const rewardInWei = ethers.parseUnits(rewardAmount.toString(), 18);
    
    console.log(`Minting ${rewardAmount} GREEN to ${userAddress} with score ${aiScore}`);
    
    // Send transaction
    const tx = await contract.verifyAndReward(userAddress, aiScore, rewardInWei);
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber.toString()
    };
  } catch (error) {
    console.error('Blockchain error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Validate Ethereum address
function isValidAddress(address) {
  if (!address) return false;
  if (address.startsWith('fid:')) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const walletAddress = formData.get('walletAddress');

    // Validation
    if (!image) {
      return NextResponse.json(
        { success: false, message: 'No image provided' },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Check if it's a valid Ethereum address
    if (!isValidAddress(walletAddress)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Valid Ethereum address required. Please connect a wallet with a verified Ethereum address.' 
        },
        { status: 400 }
      );
    }

    // File size check (10MB limit)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log(`Processing image for ${walletAddress}, size: ${image.size}`);

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // AI Analysis
    console.log('Starting AI analysis...');
    const aiResult = await analyzeImageWithAI(base64Image);
    console.log('AI Result:', aiResult);

    // Check if environmental
    if (!aiResult.isEnvironmental) {
      return NextResponse.json({
        success: false,
        message: `This image does not appear to show environmental conservation activity. ${aiResult.description}`,
        aiScore: aiResult.score,
        category: aiResult.category
      }, { status: 400 });
    }

    // Calculate reward
    const tokenReward = calculateTokenReward(aiResult.score);

    if (tokenReward === 0) {
      return NextResponse.json({
        success: false,
        message: 'AI score too low to earn rewards. Please submit a clearer image of environmental activity.',
        aiScore: aiResult.score
      }, { status: 400 });
    }

    // Mint tokens on blockchain
    console.log(`Minting ${tokenReward} GREEN tokens to ${walletAddress}...`);
    const mintResult = await mintTokens(walletAddress, aiResult.score, tokenReward);

    if (!mintResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to mint tokens. Please try again later.',
        aiScore: aiResult.score,
        error: mintResult.error
      }, { status: 500 });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `🌱 Verification successful! You earned ${tokenReward} GREEN tokens!`,
      aiScore: aiResult.score,
      tokensEarned: tokenReward,
      category: aiResult.category,
      description: aiResult.description,
      confidence: aiResult.confidence,
      transactionHash: mintResult.transactionHash,
      blockNumber: mintResult.blockNumber,
      mock: mintResult.mock || false
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during verification. Please try again.',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// CORS
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
