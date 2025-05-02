import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { MeterAnalysisResult } from "../../../types/meter-types"

// Standard feedback message for when we need a better photo
const MORE_INFO_FEEDBACK = "We need a clearer image of your meter. Please ensure the entire meter and its surroundings are clearly visible, properly lit, and in focus."

// Analysis prompt for meter recognition
const analysisPrompt = `You are a highly skilled energy expert specializing in electricity meter analysis. Your task is to analyze the photo of an electricity meter and determine whether it is an RTS (Radio Teleswitch Service) meter.

RTS meters have distinctive features (Although not all RTS meters will have all of these features):
1. They usually have a red button
2. They often display "Radio Teleswitch" text
3. They typically show "RTS" somewhere on the meter
4. They are commonly seen in UK properties with Economy 7 or similar time-of-use tariffs
5. They will be black boxes connected to the meter usually with white writing on them.
6. MOST IMPORTANTLY use common sense to determine if the meter is an RTS meter. 

Provide your analysis in JSON format with the following fields:
1. "result": Either "RTS meter" or "Not an RTS meter"
2. "certainty": A number from 0-100 indicating your confidence level
3. "explanation": A brief explanation of your conclusion, mentioning specific features you observed
4. "reasoning": Your step-by-step reasoning process
5. "meterType": If identifiable, the specific type of meter (e.g., "Economy 7", "Standard", etc.)
6. "additionalInfo": Any other relevant information about the meter

Be extremely thorough in your analysis. If the image quality is poor, blurry, or if critical parts of the meter are not visible, specifically mention this in your explanation.

If you can see ANY evidence of an RTS meter, even if the certainty is low, err on the side of identifying it as an RTS meter rather than not.

Specifically look for the text "Radio Teleswitch" or "RTS" on the meter, as well as the distinctive red button typically found on RTS meters.

Please also examine the broader view of the installation if visible, as surrounding equipment may provide additional clues.`

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const debugInfo: any[] = [];
  let formData: FormData;
  let modelUsed: string = "o4-mini";
  let wasImageUpscaled = false;
  
  try {
    formData = await request.formData();
    
    // Get API key from environment variables only
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check for API key
    if (!apiKey) {
      debugInfo.push({ step: "api_key_missing" });
      return NextResponse.json(
        { error: "OpenAI API key is not configured on the server." },
        { status: 500 }
      );
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

    // Analyze the image with o4-mini model
    debugInfo.push({ step: "analyzing_with_o4mini", model: modelUsed });
    
    try {
      // Make the API call to OpenAI
      const analysisResponse = await openai.chat.completions.create({
        model: modelUsed,
        messages: [
          { role: "system", content: analysisPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataURI } }
            ],
          },
        ],
        // Use correct parameter for o4-mini
        max_completion_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = analysisResponse.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content in the OpenAI response");
      }

      debugInfo.push({ step: "received_analysis", content });
      
      // Parse the response
      let analysisResult: MeterAnalysisResult = { result: "Unknown" };
      
      if (content && content.trim().startsWith("{")) {
        analysisResult = JSON.parse(content) as MeterAnalysisResult;
        
        // Skip image quality issues if RTS meter is detected
        if (analysisResult.result !== "RTS meter") {
          // Check for image quality issues
          const qualityCheck = detectImageQualityIssues(analysisResult);
          if (qualityCheck.hasIssues) {
            analysisResult.imageQualityIssue = true;
            analysisResult.imageQualityFeedback = qualityCheck.feedback || "Please take a clearer photo of the meter.";
          }
          
          // If certainty is below 80%, mark as needing a better image
          if (analysisResult.certainty && analysisResult.certainty < 80) {
            analysisResult.needsBetterImage = true;
            analysisResult.imageQualityIssue = true;
            analysisResult.imageQualityFeedback = MORE_INFO_FEEDBACK;
          }
          // If certainty is between 80% and 89%, warn about image quality but show results
          else if (analysisResult.certainty && analysisResult.certainty < 89) {
            analysisResult.imageQualityIssue = true;
            analysisResult.imageQualityFeedback = "A clearer photo would provide more accurate results.";
          }
        } else {
          // Clear any image quality flags for RTS meters
          analysisResult.imageQualityIssue = false;
          analysisResult.imageQualityFeedback = undefined; 
          analysisResult.needsBetterImage = false;
        }
        
        analysisResult.modelUsed = modelUsed;
        analysisResult.wasImageUpscaled = wasImageUpscaled;
        debugInfo.push({ analysisResult });
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
    debugInfo.push({ step: "unexpected_error", error: error.message });
    
    // Simplify unexpected errors as well
    return NextResponse.json(
      { error: "Something went wrong. Please try again with a clearer photo." },
      { status: 500 }
    );
  }
}
