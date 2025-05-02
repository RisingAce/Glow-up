// Meter analysis response type
export interface MeterAnalysisResult {
  result: string;
  certainty?: number;
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
