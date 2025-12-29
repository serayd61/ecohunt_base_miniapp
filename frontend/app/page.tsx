'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Leaf, Award, Shield, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react';
import { useFarcaster } from '../src/providers/FarcasterProvider';
import sdk from '@farcaster/frame-sdk';

export default function Home() {
  const { context, isSDKLoaded, isInFrame, connectedAddress, user } = useFarcaster();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Farcaster kullanıcısı varsa otomatik bağlan
  useEffect(() => {
    if (isInFrame && user.fid) {
      // Priority: connectedAddress > verifiedAddresses > custodyAddress
      const ethAddress = 
        connectedAddress ||
        user.verifiedAddresses?.[0] || 
        user.custodyAddress || 
        null;
      
      console.log('Farcaster addresses:', {
        connectedAddress,
        verifiedAddresses: user.verifiedAddresses,
        custodyAddress: user.custodyAddress,
        selectedAddress: ethAddress
      });
      
      if (ethAddress && ethAddress.startsWith('0x')) {
        setWalletConnected(true);
        setWalletAddress(ethAddress);
      }
    }
  }, [isInFrame, user.fid, user.verifiedAddresses, user.custodyAddress, connectedAddress]);

  // Wallet bağlantısı
  const connectWallet = async () => {
    // Farcaster içindeyse, SDK ile wallet bağlantısı yap
    if (isInFrame) {
      try {
        // Try to get wallet from Farcaster SDK
        const ethProvider = sdk.wallet.ethProvider;
        if (ethProvider) {
          const accounts = await ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
          console.log('Farcaster wallet accounts:', accounts);
          if (accounts && accounts.length > 0 && accounts[0].startsWith('0x')) {
            setWalletConnected(true);
            setWalletAddress(accounts[0]);
            return;
          }
        }
      } catch (err) {
        console.error('Farcaster wallet error:', err);
      }
      
      // Fallback: use custody or verified address
      const fallbackAddress = 
        connectedAddress ||
        user.verifiedAddresses?.[0] || 
        user.custodyAddress;
      
      if (fallbackAddress && fallbackAddress.startsWith('0x')) {
        setWalletConnected(true);
        setWalletAddress(fallbackAddress);
      } else {
        setError('Could not get your Ethereum address from Farcaster. Please ensure you have a verified address.');
      }
      return;
    }

    // Normal web wallet
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        setError(null);
      } catch (err) {
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      setError('Please install a Web3 wallet to continue.');
    }
  };

  // Dosya seçimi
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file.');
    }
  };

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Foto yükleme
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    if (!walletConnected) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('walletAddress', walletAddress);

    try {
      // API endpoint - always use local API route
      const apiUrl = '/api/verify';
      
      console.log('Uploading to:', apiUrl);
      console.log('Wallet:', walletAddress);
      console.log('File:', selectedFile?.name, selectedFile?.size);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Server response error. Please try again.');
      }

      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Upload failed (${response.status})`);
      }

      setUploadResult(data);
      
      // Başarılı yükleme sonrası temizle
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setUploadResult(null);
      }, 10000);

    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err?.message || 'Failed to upload image. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">EcoHunt</span>
              {isInFrame && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Farcaster
                </span>
              )}
            </div>
            
            {/* Farcaster User Info */}
            {isInFrame && user.fid ? (
              <div className="flex items-center space-x-3">
                {user.pfpUrl ? (
                  <img 
                    src={user.pfpUrl} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-green-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.displayName || user.username}</p>
                  <p className="text-gray-500 text-xs">@{user.username}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  walletConnected 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {walletConnected 
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
                  : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Earn <span className="text-green-600">GREEN</span> Tokens
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Share your environmental conservation efforts and get rewarded with GREEN tokens on the Base network
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">100K</div>
                <div className="text-sm text-gray-600">Daily Limit</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">1B</div>
                <div className="text-sm text-gray-600">Max Supply</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">AI</div>
                <div className="text-sm text-gray-600">Verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Success Result */}
          {uploadResult && uploadResult.success && (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-xl font-bold text-green-800">🎉 Verification Successful!</h3>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-gray-500">AI Score</p>
                  <p className="text-2xl font-bold text-green-600">{uploadResult.aiScore}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-gray-500">GREEN Earned</p>
                  <p className="text-2xl font-bold text-emerald-600">{uploadResult.tokensEarned}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-bold text-blue-600 capitalize">{uploadResult.category?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* NFT Transaction */}
              {uploadResult.nftTransactionHash && !uploadResult.mock && (
                <div className="mt-3 p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">🖼️ EcoNFT Minted</p>
                  <a 
                    href={`https://basescan.org/tx/${uploadResult.nftTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs font-mono break-all"
                  >
                    {uploadResult.nftTransactionHash}
                  </a>
                </div>
              )}

              {/* Token Transaction */}
              {uploadResult.tokenTransactionHash && !uploadResult.mock && (
                <div className="mt-2 p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">🌱 GREEN Tokens Sent</p>
                  <a 
                    href={`https://basescan.org/tx/${uploadResult.tokenTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs font-mono break-all"
                  >
                    {uploadResult.tokenTransactionHash}
                  </a>
                </div>
              )}

              {uploadResult.mock && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-center">
                  <p className="text-xs text-yellow-700">⚠️ Demo mode - Configure VERIFIER_PRIVATE_KEY for real transactions</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all ${
              preview 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg shadow-lg"
                />
                <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setError(null);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your eco-friendly photo here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !walletConnected}
              className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-white transition-all ${
                isUploading || !walletConnected
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Verifying with AI...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </button>
          )}

          {!walletConnected && !isInFrame && selectedFile && (
            <p className="text-center text-amber-600 mt-4 text-sm">
              ⚠️ Please connect your wallet to submit photos
            </p>
          )}

          {/* Loading state for SDK */}
          {!isSDKLoaded && isInFrame && (
            <div className="text-center py-4">
              <Loader2 className="animate-spin h-6 w-6 text-green-600 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Loading Farcaster...</p>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">1. Upload Photo</h3>
            <p className="text-sm text-gray-600">
              Take a photo of your environmental conservation activity
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">2. AI Verification</h3>
            <p className="text-sm text-gray-600">
              Our AI verifies authenticity and environmental impact
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">3. Earn Tokens</h3>
            <p className="text-sm text-gray-600">
              Receive GREEN tokens based on your AI score
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
