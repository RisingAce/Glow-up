// Meter analysis response type
export interface MeterAnalysisResult {
  result: string;
  certainty?: number;
  confidence_score?: number; // Added to match API response and usage
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
