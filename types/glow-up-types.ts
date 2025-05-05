// Hair attributes interface
export interface HairAttributes {
  length: string;
  texture: string;
  color: string;
  style: string;
}

// Face analysis result
export interface FaceAnalysisResult {
  faceShape: string;
  skinUndertone: string;
  hairAttributes: HairAttributes;
  distinctiveFeatures: string[];
  currentStyle: string;
  confidenceScore: number;
}

// Look recommendation
export interface LookRecommendation {
  name: string;
  description: string;
  hairStyling: string;
  makeup: string;
  accessories: string;
  styleNotes: string;
  imagePrompt: string;
}

// Shopping item
export interface ShoppingItem {
  productName: string;
  purpose: string;
  benefit: string;
}

// Style recommendations
export interface StyleRecommendations {
  looks: LookRecommendation[];
  shoppingList: ShoppingItem[];
}

// Transformed image
export interface TransformedImage {
  lookName: string;
  imageUrl: string;
}

// Complete glow-up result
export interface GlowUpResult {
  success: boolean;
  faceAnalysis?: FaceAnalysisResult;
  styleRecommendations?: StyleRecommendations;
  transformedImages?: TransformedImage[];
  imageQualityIssue?: boolean;
  feedback?: string;
  error?: string;
}
