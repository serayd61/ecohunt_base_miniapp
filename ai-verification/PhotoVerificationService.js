const { GoogleVisionAPI } = require('@google-cloud/vision');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const sharp = require('sharp');
const ExifParser = require('exif-parser');

class PhotoVerificationService {
    constructor() {
        this.visionClient = new GoogleVisionAPI({
            keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH
        });

        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));

        // Environmental keywords for detection
        this.environmentalKeywords = [
            'tree', 'forest', 'nature', 'recycling', 'cleanup', 'waste',
            'plant', 'garden', 'renewable', 'solar', 'wind', 'conservation',
            'biodiversity', 'ecosystem', 'sustainable', 'green', 'eco',
            'pollution', 'carbon', 'emission', 'climate', 'environment'
        ];

        this.fraudPatterns = [
            'stock photo', 'watermark', 'getty', 'shutterstock',
            'istockphoto', 'adobe stock', 'dreamstime'
        ];
    }

    async verifyPhoto(imageBuffer, metadata = {}) {
        try {
            const verificationResult = {
                score: 0,
                breakdown: {
                    environmentalContent: 0,
                    conservationActivity: 0,
                    authenticity: 0,
                    locationVerification: 0
                },
                details: {},
                isValid: false
            };

            // Step 1: Basic image analysis
            const imageAnalysis = await this.analyzeImageBasics(imageBuffer);
            verificationResult.details.imageAnalysis = imageAnalysis;

            // Step 2: Environmental content detection
            const environmentalScore = await this.detectEnvironmentalContent(imageBuffer);
            verificationResult.breakdown.environmentalContent = environmentalScore;

            // Step 3: Conservation activity detection
            const activityScore = await this.detectConservationActivity(imageBuffer);
            verificationResult.breakdown.conservationActivity = activityScore;

            // Step 4: Authenticity verification
            const authenticityScore = await this.verifyAuthenticity(imageBuffer, metadata);
            verificationResult.breakdown.authenticity = authenticityScore;

            // Step 5: Location verification (if GPS data available)
            if (metadata.gps) {
                const locationScore = await this.verifyLocation(metadata.gps);
                verificationResult.breakdown.locationVerification = locationScore;
            } else {
                verificationResult.breakdown.locationVerification = 5; // Neutral score
            }

            // Calculate final score
            verificationResult.score = this.calculateFinalScore(verificationResult.breakdown);
            verificationResult.isValid = verificationResult.score >= 50;

            return verificationResult;

        } catch (error) {
            console.error('Photo verification error:', error);
            throw new Error('Photo verification failed: ' + error.message);
        }
    }

    calculateFinalScore(breakdown) {
        const totalScore =
            breakdown.environmentalContent +
            breakdown.conservationActivity +
            breakdown.authenticity +
            breakdown.locationVerification;

        return Math.min(100, Math.max(0, totalScore));
    }

    calculateReward(score) {
        if (score >= 90) return 100; // 100 GREEN tokens
        if (score >= 70) return 50;  // 50 GREEN tokens
        if (score >= 50) return 20;  // 20 GREEN tokens
        return 0; // No reward
    }
}

module.exports = PhotoVerificationService;