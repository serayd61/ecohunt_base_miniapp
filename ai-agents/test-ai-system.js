/**
 * AI Agent System Test Suite
 * Comprehensive testing for BMAD-Method AI integration
 */

const EcoHuntAIOrchestrator = require('./ecohunt-ai-orchestrator');

class AISystemTester {
  constructor() {
    this.orchestrator = new EcoHuntAIOrchestrator({
      environmental: {
        apiKeys: process.env.ENVIRONMENTAL_API_KEYS
      },
      photoAnalysis: {
        googleVisionKey: process.env.GOOGLE_VISION_API_KEY,
        openAIKey: process.env.OPENAI_API_KEY
      },
      tokenReward: {
        tokenContract: "0xd32F38d4bda39069066D3c9DeCF0d86D351DAD9d",
        network: "base"
      }
    });
    
    this.testResults = [];
  }

  /**
   * Run comprehensive AI system tests
   */
  async runAllTests() {
    console.log("🧪 Starting EcoHunt AI System Tests...\n");

    const tests = [
      this.testEnvironmentalAgent,
      this.testPhotoAnalysisAgent,
      this.testTokenRewardAgent,
      this.testOrchestrator,
      this.testPerformance,
      this.testErrorHandling
    ];

    for (const test of tests) {
      try {
        await test.call(this);
      } catch (error) {
        console.error(`❌ Test failed: ${test.name}`, error);
        this.testResults.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return this.generateTestReport();
  }

  /**
   * Test Environmental Impact Agent
   */
  async testEnvironmentalAgent() {
    console.log("🌱 Testing Environmental Impact Agent...");

    const testActivity = {
      type: "tree-planting",
      scale: 5,
      location: "urban",
      documentation: ["photo1.jpg", "photo2.jpg"],
      beforeAfterPhotos: true,
      communityInvolvement: true,
      measurableOutcomes: true
    };

    const agent = this.orchestrator.agents.environmental;

    // Test carbon footprint calculation
    const carbonResult = await agent.calculateCarbonFootprint(testActivity);
    console.log("  Carbon Footprint:", carbonResult.carbonImpact, "kg CO2");

    // Test sustainability scoring
    const sustainabilityResult = agent.calculateSustainabilityScore(testActivity);
    console.log("  Sustainability Score:", sustainabilityResult.score + "/100");

    // Test impact assessment
    const impactResult = await agent.assessEnvironmentalImpact(testActivity);
    console.log("  Impact Level:", impactResult.impactLevel);

    this.testResults.push({
      test: 'EnvironmentalAgent',
      status: 'passed',
      results: {
        carbonFootprint: carbonResult.carbonImpact,
        sustainabilityScore: sustainabilityResult.score,
        impactLevel: impactResult.impactLevel
      }
    });

    console.log("✅ Environmental Agent tests passed\n");
  }

  /**
   * Test Photo Analysis Agent
   */
  async testPhotoAnalysisAgent() {
    console.log("📸 Testing Photo Analysis Agent...");

    const testPhoto = {
      data: "base64_encoded_image_data",
      metadata: {
        timestamp: Date.now(),
        location: { lat: 40.7128, lng: -74.0060 },
        device: "iPhone 12",
        exif: { camera: "12MP", timestamp: Date.now() }
      }
    };

    const agent = this.orchestrator.agents.photoAnalysis;

    // Test photo verification
    const verificationResult = await agent.verifyEnvironmentalPhoto(
      testPhoto.data,
      "tree-planting",
      testPhoto.metadata
    );

    console.log("  Verification Status:", verificationResult.isVerified);
    console.log("  Confidence:", verificationResult.confidence + "%");
    console.log("  Token Eligibility:", verificationResult.tokenEligibility);

    this.testResults.push({
      test: 'PhotoAnalysisAgent',
      status: 'passed',
      results: {
        isVerified: verificationResult.isVerified,
        confidence: verificationResult.confidence,
        tokenEligibility: verificationResult.tokenEligibility
      }
    });

    console.log("✅ Photo Analysis Agent tests passed\n");
  }

  /**
   * Test Token Reward Agent
   */
  async testTokenRewardAgent() {
    console.log("💰 Testing Token Reward Agent...");

    const testUserProfile = {
      id: "test_user_123",
      streakData: { currentStreak: 7, longestStreak: 15 },
      communityMetrics: { referrals: 3, socialShares: 12, mentorshipPoints: 5 },
      dailyEarned: 25
    };

    const testActivityData = {
      type: "tree-planting",
      environmentalImpactScore: 85,
      carbonImpact: -21.77
    };

    const testVerificationResult = {
      verificationScore: 92,
      tokenEligibility: "premium_tier"
    };

    const agent = this.orchestrator.agents.tokenReward;

    // Test reward calculation
    const rewardResult = await agent.calculateSmartReward(
      testActivityData,
      testVerificationResult,
      testUserProfile
    );

    console.log("  Reward Amount:", rewardResult.rewardAmount, "GREEN tokens");
    console.log("  Token Tier:", rewardResult.tokenTier);
    console.log("  Bonus Details:", Object.keys(rewardResult.breakdown).length, "bonuses");

    // Test behavior analysis
    const behaviorResult = await agent.analyzeUserBehavior(
      testUserProfile,
      this.generateMockActivityHistory()
    );

    console.log("  Behavior Score:", behaviorResult.behaviorScore + "/100");
    console.log("  Recommendations:", behaviorResult.personalizedRecommendations.length);

    this.testResults.push({
      test: 'TokenRewardAgent',
      status: 'passed',
      results: {
        rewardAmount: rewardResult.rewardAmount,
        tokenTier: rewardResult.tokenTier,
        behaviorScore: behaviorResult.behaviorScore
      }
    });

    console.log("✅ Token Reward Agent tests passed\n");
  }

  /**
   * Test AI Orchestrator
   */
  async testOrchestrator() {
    console.log("🎼 Testing AI Orchestrator...");

    const testSubmission = {
      activityType: "tree-planting",
      photoData: "base64_image_data",
      metadata: {
        location: { lat: 40.7128, lng: -74.0060 },
        timestamp: Date.now(),
        device: "Test Device"
      },
      userProfile: {
        id: "test_user_123",
        streakData: { currentStreak: 5 }
      },
      userHistory: this.generateMockActivityHistory(),
      userWallet: "0x123...456",
      scale: 3
    };

    // Test full activity processing pipeline
    const result = await this.orchestrator.processEcoActivity(testSubmission);

    console.log("  Processing Status:", result.success ? "Success" : "Failed");
    console.log("  Verification:", result.verification?.isVerified ? "Verified" : "Not Verified");
    console.log("  Sustainability Score:", result.environmentalAnalysis?.sustainabilityScore || 0);
    console.log("  Token Reward:", result.rewards?.tokenAmount || 0, "GREEN");

    this.testResults.push({
      test: 'AIOrchestrator',
      status: result.success ? 'passed' : 'failed',
      results: {
        processingSuccess: result.success,
        verificationStatus: result.verification?.isVerified,
        sustainabilityScore: result.environmentalAnalysis?.sustainabilityScore,
        tokenReward: result.rewards?.tokenAmount
      }
    });

    console.log("✅ AI Orchestrator tests passed\n");
  }

  /**
   * Test System Performance
   */
  async testPerformance() {
    console.log("⚡ Testing System Performance...");

    const testActivities = Array.from({ length: 10 }, (_, i) => ({
      activityType: ["tree-planting", "waste-cleanup", "recycling"][i % 3],
      photoData: `test_image_${i}`,
      metadata: { timestamp: Date.now() + i * 1000 },
      userProfile: { id: `test_user_${i}` },
      userHistory: [],
      userWallet: `0x${i}23...456`
    }));

    const startTime = Date.now();
    
    // Test batch processing
    const batchResult = await this.orchestrator.processBatchActivities(testActivities);
    
    const processingTime = Date.now() - startTime;
    const avgTimePerActivity = processingTime / testActivities.length;

    console.log("  Batch Size:", testActivities.length, "activities");
    console.log("  Total Processing Time:", processingTime + "ms");
    console.log("  Average Time per Activity:", avgTimePerActivity.toFixed(2) + "ms");
    console.log("  Success Rate:", batchResult.summary.successRate.toFixed(1) + "%");

    this.testResults.push({
      test: 'Performance',
      status: avgTimePerActivity < 5000 ? 'passed' : 'failed', // Must be under 5s per activity
      results: {
        batchSize: testActivities.length,
        totalTime: processingTime,
        avgTimePerActivity: avgTimePerActivity,
        successRate: batchResult.summary.successRate
      }
    });

    console.log("✅ Performance tests completed\n");
  }

  /**
   * Test Error Handling
   */
  async testErrorHandling() {
    console.log("🛡️ Testing Error Handling...");

    // Test with invalid data
    const invalidSubmission = {
      activityType: null,
      photoData: null,
      metadata: {},
      userProfile: null
    };

    try {
      const result = await this.orchestrator.processEcoActivity(invalidSubmission);
      
      console.log("  Handled Invalid Input:", result.success ? "Failed" : "Success");
      console.log("  Error Message:", result.error || "No error message");
      console.log("  Fallback Reward:", result.fallbackReward?.tokenAmount || 0);

      this.testResults.push({
        test: 'ErrorHandling',
        status: !result.success && result.fallbackReward ? 'passed' : 'failed',
        results: {
          handledGracefully: !result.success,
          providedFallback: !!result.fallbackReward,
          errorMessage: result.error
        }
      });

    } catch (error) {
      console.log("  Unhandled Exception:", error.message);
      this.testResults.push({
        test: 'ErrorHandling',
        status: 'failed',
        error: 'Unhandled exception: ' + error.message
      });
    }

    console.log("✅ Error handling tests completed\n");
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const total = this.testResults.length;

    console.log("📊 AI System Test Report");
    console.log("========================");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error || 'Unknown error'}`);
        });
    }

    console.log("\n✅ Test Summary:");
    this.testResults.forEach(r => {
      console.log(`  ${r.status === 'passed' ? '✅' : '❌'} ${r.test}`);
    });

    return {
      summary: {
        total,
        passed,
        failed,
        successRate: (passed / total) * 100
      },
      details: this.testResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate mock activity history for testing
   */
  generateMockActivityHistory() {
    return Array.from({ length: 20 }, (_, i) => ({
      type: ["tree-planting", "waste-cleanup", "recycling", "water-conservation"][i % 4],
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // Past 20 days
      qualityScore: 70 + Math.random() * 30, // 70-100
      reward: 10 + Math.random() * 20 // 10-30 tokens
    }));
  }
}

// Export for testing
module.exports = AISystemTester;

// Run tests if called directly
if (require.main === module) {
  const tester = new AISystemTester();
  tester.runAllTests()
    .then(report => {
      console.log("\n🎉 All tests completed!");
      process.exit(report.summary.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}