const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { ethers } = require('ethers');
const pinataSDK = require('@pinata/sdk');
const PhotoVerificationService = require('../ai-verification/PhotoVerificationService');

require('dotenv').config();

class EcoHuntBackend {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;

        // Initialize services
        this.photoVerifier = new PhotoVerificationService();
        this.pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

        // Blockchain setup
        this.provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Multer for file uploads
        const storage = multer.memoryStorage();
        this.upload = multer({
            storage: storage,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB limit
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Only image files are allowed'), false);
                }
            }
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });

        // Submit photo for verification
        this.app.post('/api/submit-photo', this.upload.single('photo'), async (req, res) => {
            try {
                const { userAddress } = req.body;
                const photoFile = req.file;

                if (!photoFile) {
                    return res.status(400).json({ error: 'No photo file provided' });
                }

                if (!userAddress || !ethers.utils.isAddress(userAddress)) {
                    return res.status(400).json({ error: 'Invalid user address' });
                }

                // Upload to IPFS via Pinata
                const ipfsResult = await this.pinata.pinFileToIPFS(photoFile.buffer, {
                    pinataMetadata: {
                        name: `ecohunt-photo-${Date.now()}`,
                        keyvalues: {
                            userAddress: userAddress,
                            timestamp: new Date().toISOString()
                        }
                    }
                });

                // Start AI verification process
                this.processPhotoVerification(ipfsResult.IpfsHash, photoFile.buffer);

                res.json({
                    success: true,
                    ipfsHash: ipfsResult.IpfsHash,
                    message: 'Photo submitted successfully. AI verification in progress.'
                });

            } catch (error) {
                console.error('Photo submission error:', error);
                res.status(500).json({
                    error: 'Photo submission failed',
                    details: error.message
                });
            }
        });
    }

    async processPhotoVerification(ipfsHash, imageBuffer) {
        try {
            console.log(`Starting AI verification for IPFS: ${ipfsHash}`);

            // Run AI verification
            const verificationResult = await this.photoVerifier.verifyPhoto(imageBuffer);

            console.log(`Photo verification complete: Score ${verificationResult.score}`);

        } catch (error) {
            console.error('AI verification process error:', error);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`EcoHunt Backend running on port ${this.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
}

// Start the server
const backend = new EcoHuntBackend();
backend.start();

module.exports = EcoHuntBackend;