// Meter analysis response type
export interface MeterAnalysisResult {
  result: string;
  certainty: number;
  confidence_score: number;
  original_confidence_score?: number; // Store original image confidence
  enhanced_confidence_score?: number; // Store enhanced image confidence
  explanation?: string;
  reasoning?: string;
  meterType?: string;
  additionalInfo?: string;
  needsBetterImage?: boolean;
  imageQualityIssue?: boolean;
  imageQualityFeedback?: string;
  modelUsed?: string;
  wasImageUpscaled?: boolean;
  detailedAnalysis?: boolean; // Whether this is a detailed analysis
  detailedReport?: string; // Detailed report from o3 model
}
