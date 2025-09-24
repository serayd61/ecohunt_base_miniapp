'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function EcoHuntApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddress] = useState('0x1234567890123456789012345678901234567890'); // Mock address

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('userAddress', userAddress);

      const response = await fetch(`${BACKEND_URL}/api/submit-photo`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Photo submitted successfully! AI verification in progress...');
        setSelectedFile(null);
        setPreview(null);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h1 className="text-4xl font-bold text-green-800">EcoHunt</h1>
          </div>
          <p className="text-green-600 text-lg">
            Earn GREEN tokens by sharing your environmental conservation efforts
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Submit Environmental Photo
          </h2>

          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Environmental Photo
              </h3>
              <p className="text-gray-600 mb-6">
                Share your conservation efforts and earn GREEN tokens
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full cursor-pointer transition-colors"
              >
                Choose Photo
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <span className="text-yellow-600 mr-3 text-xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      AI Verification Tips
                    </h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Show clear environmental activity</li>
                      <li>• Include yourself or tools to show participation</li>
                      <li>• Original photos score higher</li>
                      <li>• Avoid edited or stock photos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePhotoSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Photo'}
              </button>
            </div>
          )}
        </div>

        <footer className="text-center text-gray-500 mt-12">
          <p>EcoHunt - Making environmental conservation rewarding</p>
          <p className="text-sm mt-2">Powered by Base Network & AI Verification</p>
        </footer>
      </div>
    </div>
  );
}