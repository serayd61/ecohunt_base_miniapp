export const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "EcoHunt",
    subtitle: "AI-powered green rewards",
    description: "Earn GREEN tokens for real-world eco actions.",
    screenshotUrls: [
      `${ROOT_URL}/splash.png`,
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#10B981",
    homeUrl: ROOT_URL,
    primaryCategory: "utilities",
    tags: ["environment", "ai", "rewards", "miniapp"],
    heroImageUrl: `${ROOT_URL}/splash.png`,
    tagline: "Do good. Get rewarded.",
    ogTitle: "EcoHunt – Earn GREEN Tokens",
    ogDescription: "AI-verified environmental actions on Base network.",
    ogImageUrl: `${ROOT_URL}/splash.png`,
  },
} as const;

export default minikitConfig;

