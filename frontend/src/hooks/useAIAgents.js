/**
 * React Hook for AI Agents Integration
 * Provides easy access to BMAD-Method AI capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import AIAgentService from '../services/ai-agent-service';

export const useAIAgents = () => {
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userInsights, setUserInsights] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  // Submit eco-activity for AI processing
  const submitActivity = useCallback(async (activityData) => {
    setProcessing(true);
    setError(null);

    try {
      const result = await AIAgentService.submitEcoActivity(activityData);
      setAnalysisResult(result);
      
      // Refresh user insights after successful submission
      if (result.success) {
        await refreshUserInsights();
        await refreshChallenges();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  // Validate photo before submission
  const validatePhoto = useCallback(async (photoData) => {
    try {
      return await AIAgentService.validatePhotoPreSubmission(photoData);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Refresh user behavior insights
  const refreshUserInsights = useCallback(async (userId = 'current') => {
    try {
      const insights = await AIAgentService.getUserBehaviorInsights(userId);
      setUserInsights(insights);
      return insights;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Refresh personalized challenges
  const refreshChallenges = useCallback(async (userId = 'current') => {
    try {
      const challenges = await AIAgentService.getPersonalizedChallenges(userId);
      setChallenges(challenges);
      return challenges;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Get environmental impact analytics
  const getAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analytics = await AIAgentService.getEnvironmentalImpactAnalytics(timeframe);
      setAnalytics(analytics);
      return analytics;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Monitor real-time AI processing
  const monitorProcessing = useCallback(async (processId) => {
    const pollInterval = 2000; // 2 seconds
    let attempts = 0;
    const maxAttempts = 30; // 1 minute total

    const poll = async () => {
      try {
        const update = await AIAgentService.getAIAnalysisUpdates(processId);
        
        if (update && update.status === 'completed') {
          return update;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        }
      } catch (err) {
        console.error('Monitoring error:', err);
      }
    };

    return poll();
  }, []);

  // Initialize data on mount
  useEffect(() => {
    refreshUserInsights();
    refreshChallenges();
    getAnalytics();
  }, [refreshUserInsights, refreshChallenges, getAnalytics]);

  return {
    // State
    processing,
    analysisResult,
    userInsights,
    challenges,
    analytics,
    error,
    
    // Actions
    submitActivity,
    validatePhoto,
    refreshUserInsights,
    refreshChallenges,
    getAnalytics,
    monitorProcessing,
    
    // Utility methods
    clearError: () => setError(null),
    resetResults: () => {
      setAnalysisResult(null);
      setError(null);
    }
  };
};

export default useAIAgents;