// BMAD-Method Configuration for EcoHunt
module.exports = {
  projectName: "EcoHunt Environmental AI Agents",
  projectType: "environmental-sustainability",
  framework: "base-miniapp",
  
  agents: [
    {
      name: "EnvironmentalImpactAgent",
      type: "environmental-analysis",
      capabilities: [
        "carbon-footprint-calculation",
        "environmental-impact-assessment", 
        "sustainability-scoring",
        "eco-friendly-activity-validation"
      ]
    },
    {
      name: "PhotoVerificationAgent", 
      type: "computer-vision",
      capabilities: [
        "ai-powered-photo-analysis",
        "environmental-activity-detection",
        "authenticity-verification",
        "anti-fraud-checking"
      ]
    },
    {
      name: "TokenRewardAgent",
      type: "reward-optimization", 
      capabilities: [
        "smart-reward-calculation",
        "user-behavior-analysis",
        "gamification-optimization",
        "blockchain-integration"
      ]
    }
  ],
  
  integrations: {
    blockchain: "base-network",
    tokenContract: "0xd32F38d4bda39069066D3c9DeCF0d86D351DAD9d",
    aiServices: [
      "google-vision-api",
      "openai-gpt-4-vision",
      "custom-environmental-models"
    ]
  },
  
  deployment: {
    platform: "vercel",
    environment: "production",
    url: "https://ecohunt-base-miniapp-bau55hx38-serkans-projects-9991a7f3.vercel.app"
  }
};