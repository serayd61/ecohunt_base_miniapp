/**
 * AI Agent Service for EcoHunt Frontend
 * Integration with BMAD-Method AI Agents
 */

class AIAgentService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    this.apiVersion = 'v1';
  }

  /**
   * Submit eco-activity for AI processing
   */
  async submitEcoActivity(activityData) {
    try {
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/process-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          activityType: activityData.type,
          photoData: activityData.photo,
          metadata: {
            location: activityData.location,
            timestamp: activityData.timestamp,
            deviceInfo: this.getDeviceInfo(),
            userAgent: navigator.userAgent
          },
          userProfile: await this.getUserProfile(),
          userHistory: await this.getUserHistory(),
          userWallet: activityData.walletAddress
        })
      });

      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Store processing result locally
      this.storeProcessingResult(result);
      
      return this.formatAIResponse(result);

    } catch (error) {
      console.error('AI Agent Service Error:', error);
      return {
        success: false,
        error: error.message,
        fallbackReward: 5
      };
    }
  }

  /**
   * Get real-time AI analysis updates
   */
  async getAIAnalysisUpdates(processId) {
    try {
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/analysis/${processId}`);
      const data = await response.json();
      
      return {
        processId: data.processId,
        status: data.status,
        progress: data.progress,
        currentStep: data.currentStep,
        estimatedCompletion: data.estimatedCompletion,
        preliminaryResults: data.preliminaryResults
      };

    } catch (error) {
      console.error('Failed to get AI updates:', error);
      return null;
    }
  }

  /**
   * Get user behavior insights
   */
  async getUserBehaviorInsights(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/user-insights/${userId}`);
      const insights = await response.json();

      return {
        behaviorScore: insights.behaviorScore,
        engagementLevel: insights.engagementLevel,
        recommendations: insights.recommendations,
        gamificationSuggestions: insights.gamificationSuggestions,
        nextLevelProgress: insights.nextLevelProgress,
        streakData: insights.streakData,
        achievementOpportunities: insights.achievementOpportunities
      };

    } catch (error) {
      console.error('Failed to get user insights:', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Get environmental impact analytics
   */
  async getEnvironmentalImpactAnalytics(timeframe = '30d') {
    try {
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/impact-analytics?timeframe=${timeframe}`);
      const analytics = await response.json();

      return {
        totalCarbonFootprint: analytics.totalCarbonFootprint,
        sustainabilityScore: analytics.sustainabilityScore,
        impactTrend: analytics.impactTrend,
        categoryBreakdown: analytics.categoryBreakdown,
        comparisonData: analytics.comparisonData,
        recommendations: analytics.recommendations,
        achievements: analytics.achievements
      };

    } catch (error) {
      console.error('Failed to get impact analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get personalized challenges and achievements
   */
  async getPersonalizedChallenges(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/challenges/${userId}`);
      const challenges = await response.json();

      return challenges.map(challenge => ({
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        reward: challenge.reward,
        progress: challenge.progress,
        deadline: challenge.deadline,
        requirements: challenge.requirements
      }));

    } catch (error) {
      console.error('Failed to get challenges:', error);
      return this.getDefaultChallenges();
    }
  }

  /**
   * Validate photo before submission
   */
  async validatePhotoPreSubmission(photoData) {
    try {
      // Quick photo validation
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/ai/photo-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoData: photoData,
          quickCheck: true
        })
      });

      const validation = await response.json();

      return {
        isValid: validation.isValid,
        confidence: validation.confidence,
        suggestions: validation.suggestions,
        potentialIssues: validation.potentialIssues,
        estimatedReward: validation.estimatedReward
      };

    } catch (error) {
      console.error('Photo validation failed:', error);
      return {
        isValid: true, // Default to valid for user experience
        confidence: 0.7,
        suggestions: ["Ensure photo is clear and shows environmental activity"],
        potentialIssues: [],
        estimatedReward: 10
      };
    }
  }

  // Helper Methods
  formatAIResponse(aiResult) {
    return {
      success: aiResult.success,
      processId: aiResult.processId,
      
      // Verification Results
      isVerified: aiResult.verification?.isVerified || false,
      verificationConfidence: aiResult.verification?.confidence || 0,
      
      // Environmental Impact
      environmentalScore: aiResult.environmentalAnalysis?.sustainabilityScore || 0,
      carbonImpact: aiResult.environmentalAnalysis?.carbonFootprint?.carbonImpact || 0,
      impactCategory: aiResult.environmentalAnalysis?.carbonFootprint?.impactCategory || 'unknown',
      
      // Rewards
      tokenReward: aiResult.rewards?.tokenAmount || 0,
      rewardTier: aiResult.rewards?.rewardTier || 'basic',
      bonusDetails: aiResult.rewards?.breakdown || {},
      
      // User Insights
      behaviorScore: aiResult.userAnalysis?.behaviorScore || 0,
      recommendations: aiResult.userAnalysis?.recommendations || [],
      
      // Gamification
      newAchievements: aiResult.gamification?.achievements || [],
      availableChallenges: aiResult.gamification?.challenges || [],
      
      // Blockchain
      transactionHash: aiResult.blockchain?.confirmation?.transactionHash || null,
      gasUsed: aiResult.blockchain?.gasUsed || null,
      
      // Metadata
      processingTime: aiResult.metadata?.processingTime || 0,
      qualityMetrics: aiResult.metadata?.qualityMetrics || {}
    };
  }

  async getUserProfile() {
    // Get user profile from localStorage or API
    const stored = localStorage.getItem('ecohunt_user_profile');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      id: this.generateUserId(),
      joinDate: new Date().toISOString(),
      totalActivities: 0,
      streakData: { currentStreak: 0, longestStreak: 0 },
      communityMetrics: { referrals: 0, socialShares: 0, mentorshipPoints: 0 }
    };
  }

  async getUserHistory() {
    // Get user activity history from localStorage
    const stored = localStorage.getItem('ecohunt_user_history');
    return stored ? JSON.parse(stored) : [];
  }

  getAuthToken() {
    // Get authentication token for API requests
    return localStorage.getItem('ecohunt_auth_token') || 'anonymous';
  }

  getDeviceInfo() {
    return {
      screen: { width: screen.width, height: screen.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  storeProcessingResult(result) {
    // Store result in localStorage for offline access
    const history = this.getUserHistory();
    history.push({
      ...result,
      storedAt: new Date().toISOString()
    });
    
    // Keep only last 100 results
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('ecohunt_user_history', JSON.stringify(history));
  }

  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Default fallback data
  getDefaultInsights() {
    return {
      behaviorScore: 50,
      engagementLevel: 'moderate',
      recommendations: ['Try to maintain daily eco-activities for better rewards'],
      gamificationSuggestions: [],
      nextLevelProgress: 0,
      streakData: { current: 0, longest: 0 },
      achievementOpportunities: []
    };
  }

  getDefaultAnalytics() {
    return {
      totalCarbonFootprint: 0,
      sustainabilityScore: 0,
      impactTrend: 'stable',
      categoryBreakdown: {},
      comparisonData: {},
      recommendations: ['Submit more eco-activities to see detailed analytics'],
      achievements: []
    };
  }

  getDefaultChallenges() {
    return [
      {
        id: 'first_activity',
        type: 'onboarding',
        title: 'First Green Step',
        description: 'Complete your first eco-friendly activity',
        difficulty: 'easy',
        reward: 25,
        progress: 0,
        deadline: null,
        requirements: ['Submit one verified eco-activity']
      }
    ];
  }
}

export default new AIAgentService();