import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { MeterAnalysisResult } from "../../../types/meter-types"

// Standard feedback message for when we need a better photo
const MORE_INFO_FEEDBACK = "We need a clearer image of your meter. Please ensure the entire meter and its surroundings are clearly visible, properly lit, and in focus."

// Analysis prompt for meter recognition
const analysisPrompt = `You are a highly skilled energy expert specializing in electricity meter analysis. Your task is to analyze the photo of an electricity meter and determine whether it is an RTS (Radio Teleswitch Service) meter with extremely high accuracy.

RTS meters have distinctive features:
! This list is not exhaustive and you should use your best judgement to make a decision.
1. They typically have a RED BUTTON, 
2. They often display "Radio Teleswitch" or "RADIO TELESWITCH" text
3. They frequently show "RTS" text somewhere on the meter or connected box
4. They are installed in UK properties with Economy 7 or similar time-of-use tariffs
5. They appear as BLACK BOXES connected to the meter, often with white writing on them
6. They are usually separate components mounted next to the main meter
7. They control heating and hot water timing based on radio signals
8. They look like the are plugged into something else
9. They are usually wired to another black box
10. They usually have two rates for the readings
11. They look old and are usually made of metal 
12. If it has anything about radio signals it is probably an RTS meter


CRITICAL INSTRUCTIONS:
- If you see a RED BUTTON on a black box near the meter, this is VERY STRONG evidence of an RTS meter
- A black box with "RTS" or "Radio Teleswitch" or similar text is DEFINITIVE evidence
- Even if only part of an RTS meter is visible, classify it as "RTS meter"
- You MUST set a non-zero confidence level, even if low (minimum 10%)
- If in doubt, err on the side of identifying as an RTS meter rather than not
- Analyze the entire image, including meter surroundings, not just the main meter face
- Consider lighting and angles that might hide or obscure RTS features
- If the image quality isn't good enough and you can't read the writing, say "I can't read the writing"

Provide your analysis in JSON format with the following fields:
1. "result": Either "RTS meter" or "Not an RTS meter"
2. "certainty": A number from 10-100 (As a percentage) indicating your confidence level (NEVER 0)
3. "explanation": A brief explanation of your conclusion, mentioning specific features you observed
4. "reasoning": Your step-by-step reasoning process
5. "meterType": If identifiable, the specific type of meter (e.g., "Economy 7", "Standard", etc.)
6. "additionalInfo": Any other relevant information about the meter

Be extremely thorough in your analysis. If the image quality is poor, blurry, or if critical parts of the meter are not visible, specifically mention this in your explanation.

If you can see ANY evidence of an RTS meter, even if the certainty is low, err on the side of identifying it as an RTS meter rather than not.

CRITICAL: Your certainty value MUST be between 10 and 100, NEVER 0, even if you are uncertain.
CRITICAL: Always set certainty to at least 90% if you see a red button on a black box near the meter.
CRITICAL: Always set certainty to at least 95% if you see "RTS" or "Radio Teleswitch" text.`

// Function to check for image quality issues
function detectImageQualityIssues(response: any): { hasIssues: boolean, feedback: string | null } {
  // Skip image quality checks if an RTS meter is detected
  if (response.result === "RTS meter") {
    return { hasIssues: false, feedback: null };
  }
  
  // Check for common image quality phrases
  const explanation = response.explanation || "";
  const reasoning = response.reasoning || "";
  const contentToCheck = (explanation + " " + reasoning).toLowerCase();
  
  const imageQualityPhrases = [
    { phrase: "blurry", feedback: "The image appears to be blurry. Please take a clearer photo." },
    { phrase: "unclear", feedback: "The image is unclear. Please take a better photo with good lighting." },
    { phrase: "poor quality", feedback: "The image quality is poor. Please take a clearer photo." },
    { phrase: "poor lighting", feedback: "The lighting in the image is poor. Please take a photo with better lighting." },
    { phrase: "too dark", feedback: "The image is too dark. Please take a photo with better lighting." },
    { phrase: "not visible", feedback: "Parts of the meter are not visible. Please capture the entire meter clearly." },
    { phrase: "partially visible", feedback: "The meter is only partially visible. Please capture the entire meter in the frame." },
    { phrase: "low resolution", feedback: "The image resolution is too low. Please take a higher quality photo." },
    { phrase: "glare", feedback: "There is glare on the meter. Please take a photo without reflections or glare." },
    { phrase: "hard to see", feedback: "The meter details are hard to see. Please take a clearer photo with good lighting." },
    { phrase: "difficult to read", feedback: "The meter is difficult to read. Please take a clearer photo." },
    { phrase: "cannot determine", feedback: "We cannot determine the meter type from this image. Please take a clearer photo showing the entire meter." },
    { phrase: "out of focus", feedback: "The image is out of focus. Please take a clearer photo." }
  ];

  for (const { phrase, feedback } of imageQualityPhrases) {
    if (contentToCheck.includes(phrase)) {
      return { hasIssues: true, feedback };
    }
  }

  return { hasIssues: false, feedback: null };
}

// Helper function to normalize confidence values to the 10-100 range
function normalizeConfidenceValue(value: any): number {
  // If not a number or undefined, return minimum confidence of 10
  if (value === undefined || value === null || typeof value !== 'number') {
    return 10;
  }
  
  // Convert to number explicitly if it's a string or other type
  const numValue = Number(value);
  
  // Handle values in thousands (e.g., 8500)
  if (numValue >= 1000) {
    return Math.min(100, Math.round(numValue / 100));
  }
  
  // Handle decimal values (0.85 → 85%)
  if (numValue > 0 && numValue <= 1) {
    return Math.round(numValue * 100);
  }
  
  // For values outside reasonable range (101-999), scale them down
  if (numValue > 100 && numValue < 1000) {
    return 100; // Cap at 100%
  }
  
  // Values already in proper range (10-100)
  return Math.min(100, Math.max(10, Math.round(numValue)));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const debugInfo: any[] = [];
  let formData: FormData;
  let modelUsed: string = "o4-mini";
  let wasImageUpscaled = false;
  let useDetailedModel = false;
  
  try {
    formData = await request.formData();
    
    // Check if this is a request for a detailed analysis with o3 model
    const detailedAnalysisParam = formData.get("detailedAnalysis");
    if (detailedAnalysisParam === "true") {
      modelUsed = "o3";
      useDetailedModel = true;
      debugInfo.push({ step: "using_detailed_o3_model" });
    }
    
    // Get API key from environment variables or fall back to a mock response for testing
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check for API key
    if (!apiKey) {
      console.warn("OpenAI API key is not configured. Returning a mock response for testing.");
      
      // Return a mock response for testing when no API key is available
      const mockRTSStatus = useDetailedModel ? "RTS meter" : "Not an RTS meter";
      const mockCertainty = useDetailedModel ? 95 : 80;
      
      return NextResponse.json({
        result: mockRTSStatus,
        certainty: mockCertainty,
        explanation: useDetailedModel 
          ? "This is a mock detailed analysis. The meter appears to have RTS characteristics including a black housing with a red button." 
          : "This is a mock response. The OpenAI API key is not configured.",
        reasoning: useDetailedModel
          ? "Mock detailed analysis reasoning: The presence of a separate black box with a red button is a strong indicator of an RTS meter."
          : "No actual analysis was performed as this is a mock response.",
        meterType: useDetailedModel ? "RTS Economy 7" : "Mock Meter",
        additionalInfo: useDetailedModel 
          ? "This mock RTS meter appears to control Economy 7 heating and hot water timing."
          : "Please configure the OPENAI_API_KEY environment variable in your Vercel project.",
        imageQualityIssue: false,
        detailedAnalysis: useDetailedModel,
        detailedReport: useDetailedModel ? 
          `# Detailed Mock Analysis Report
          
## Meter Identification
This appears to be an RTS meter with the classic features of Radio Teleswitch Service equipment. The black box with red button is the hallmark characteristic of these systems.

## Technical Specifications
- **Meter Type**: Radio Teleswitch Service (RTS)
- **Configuration**: Economy 7 
- **Communication**: Radio signal reception
- **Tariff Support**: Dual rate (day/night)
- **Key Features**: Red button, black casing with white text

## Detailed Observations
The separate black control box mounted alongside the main electricity meter serves as the Radio Teleswitch receiver. This device receives radio signals that control when your heating and hot water systems operate, typically switching between day and night rates automatically.

## Replacement Information
**Important:** This RTS meter is scheduled to be phased out by 2027 as part of the national Radio Teleswitch Service decommissioning. The radio signal that controls these meters will be switched off.

## Recommended Actions
1. **Contact your energy supplier** to arrange for a replacement meter
2. **Consider smart meter options** which offer similar time-of-use tariff capabilities
3. **Review your current energy plan** as replacement may present opportunities for better tariffs

*Note: This is a mock detailed report for testing purposes only.*` : undefined
      });
    }
    
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const image = formData.get("image") as File;
    
    if (!image) {
      debugInfo.push({ step: "no_image_provided" });
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert the uploaded file to base64
    const fileBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const fileBase64 = buffer.toString("base64");
    const dataURI = `data:${image.type};base64,${fileBase64}`;
    debugInfo.push({ step: "image_converted_to_base64", type: image.type });

    // Analyze the image with selected model
    debugInfo.push({ step: "analyzing_with_model", model: modelUsed });
    
    try {
      // Make the API call to OpenAI
      let promptToUse = analysisPrompt;
      
      // For detailed analysis, add more instructions to generate a comprehensive report
      if (useDetailedModel) {
        promptToUse = `${analysisPrompt}
        
ADDITIONAL INSTRUCTIONS FOR DETAILED ANALYSIS:
As this is a detailed analysis request, please provide a more comprehensive report, including:
1. A thorough examination of all meter components visible in the image
2. Specific details about manufacturing markings, model numbers, and utility company information if visible
3. More detailed explanation about how the meter works and its specific capabilities
4. Recommendations for the user based on the meter type (economy plans, replacement options, etc.)
5. Any other information that would be valuable to someone who wants to understand their meter in depth

In addition to the standard JSON response, include a "detailedReport" field with a comprehensive, well-formatted markdown report that the user can read to understand their meter in detail.
`;
      }
      
      const analysisResponse = await openai.chat.completions.create({
        model: modelUsed,
        messages: [
          { role: "system", content: promptToUse },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataURI } }
            ],
          },
        ],
        // Use model-appropriate token limits
        max_completion_tokens: useDetailedModel ? 2000 : 800,
        response_format: { type: "json_object" },
      });

      const content = analysisResponse.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content in the OpenAI response");
      }

      debugInfo.push({ step: "received_analysis", content });
      
      // Parse the OpenAI response
      let analysisResult: MeterAnalysisResult = { 
        result: "Unknown", 
        certainty: 10,
        confidence_score: 10
      };

      if (content && content.trim().startsWith("{")) {
        try {
          // Parse the OpenAI response
          const rawResponse = JSON.parse(content);
          
          // Format confidence values before assigning to analysisResult
          // If certainty is missing or 0, set to 10%
          const certainty = (!rawResponse.certainty || rawResponse.certainty === 0) 
            ? 10 
            : normalizeConfidenceValue(rawResponse.certainty);
          
          // Create a properly normalized result object
          analysisResult = {
            ...rawResponse,
            certainty: certainty ?? 10, // Use normalized value, default to 10 if null
            confidence_score: certainty ?? 10, // Ensure both values match
            wasImageUpscaled: wasImageUpscaled,
            detailedAnalysis: useDetailedModel,
            // Ensure the detailed report is properly captured if it exists in the response or undefined if not
            detailedReport: rawResponse.detailedReport || undefined
          };
          
          // Determine the classification based on confidence thresholds
          // If RTS meter with very low confidence, label as "Unknown"
          if (analysisResult.result === "RTS meter") {
            // Clear any image quality flags for RTS meters
            analysisResult.imageQualityIssue = false;
            analysisResult.imageQualityFeedback = undefined; 
            analysisResult.needsBetterImage = false;
            
            // Change the result to "Unknown" if the certainty is too low
            // Don't do this for detailed analysis which should be more accurate and definitive
            if (!useDetailedModel && analysisResult.certainty < 50) {
              analysisResult.result = "Unknown";
              analysisResult.explanation = "There might be evidence of an RTS meter, but the confidence is too low to make a definitive determination. " + (analysisResult.explanation || "");
            }
            // Boost confidence for RTS meters to prevent false negatives
            else if (!useDetailedModel && analysisResult.certainty < 70) {
              analysisResult.certainty = Math.min(70, analysisResult.certainty + 20);
              analysisResult.confidence_score = analysisResult.certainty;
            }
          } else {
            // Similarly, if Not an RTS meter with very low confidence, label as "Unknown"
            // Don't do this for detailed analysis which should be more accurate
            if (!useDetailedModel && analysisResult.certainty < 50) {
              analysisResult.result = "Unknown";
              analysisResult.explanation = "The image doesn't appear to show an RTS meter, but the confidence is too low to make a definitive determination. " + (analysisResult.explanation || "");
            }
            
            // Check for image quality issues - skip for detailed analysis which is more thorough
            if (!useDetailedModel) {
              const qualityCheck = detectImageQualityIssues(analysisResult);
              if (qualityCheck.hasIssues) {
                analysisResult.imageQualityIssue = true;
                analysisResult.imageQualityFeedback = qualityCheck.feedback || "Please take a clearer photo of the meter.";
              }
            }
            
            // If certainty is below 70%, mark as needing a better image
            // Skip for detailed analysis which is meant to be the final verdict
            if (!useDetailedModel && analysisResult.certainty < 70) {
              analysisResult.needsBetterImage = true;
              analysisResult.imageQualityIssue = true;
              analysisResult.imageQualityFeedback = MORE_INFO_FEEDBACK;
            }
            // If certainty is between 70% and 85%, warn about image quality but show results
            // Skip for detailed analysis which is meant to be the final verdict
            else if (!useDetailedModel && analysisResult.certainty < 85) {
              analysisResult.imageQualityIssue = true;
              analysisResult.imageQualityFeedback = "A clearer photo would provide more accurate results.";
            }
          }
          
          analysisResult.modelUsed = modelUsed;
          analysisResult.wasImageUpscaled = wasImageUpscaled;
          debugInfo.push({ analysisResult });
        } catch (error) {
          console.error("Error parsing OpenAI response:", error);
          debugInfo.push({ step: "json_parse_error", error: String(error) });
          throw new Error("Invalid JSON response from OpenAI");
        }
      } else {
        throw new Error("Invalid JSON response from OpenAI");
      }
      
      // Return the final analysis result
      return NextResponse.json(analysisResult);
      
    } catch (error: any) {
      debugInfo.push({ step: "openai_api_error", error: error.message });
      
      // Simplify error messages for users
      let userFriendlyError = "Image analysis failed. Please try again with a clearer photo.";
      
      // For developers, still log the actual error
      console.error("Original API error:", error.message);
      
      // Return the simplified error message
      return NextResponse.json(
        { error: userFriendlyError },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    debugInfo.push({ step: "form_processing_error", error: error.message });
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
