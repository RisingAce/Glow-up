// Meter analysis response type
export interface MeterAnalysisResult {
  result: string;
  certainty?: number;
  confidence_score?: number; // Added to match API response and usage
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
}
