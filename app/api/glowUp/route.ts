import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

// Common feedback for low-quality selfies
const LOW_QUALITY_FEEDBACK = "We need a clearer selfie to create your glow-up. Please ensure your face is clearly visible, properly lit, and in focus."

// Analysis prompt for face analysis
const faceAnalysisPrompt = `You are a professional stylist and beauty expert. Your task is to analyze a selfie and identify the person's key facial features, skin undertone, and hair attributes.

ANALYSIS INSTRUCTIONS:
1. Examine the selfie carefully for face shape (oval, round, square, heart, etc.)
2. Determine skin undertone (warm, cool, neutral)
3. Analyze hair attributes (length, texture, color, style)
4. Note any distinctive features that could influence styling recommendations
5. Consider current makeup, if any is visible

Provide your analysis in JSON format with the following fields:
1. "faceShape": The person's face shape (oval, round, square, heart, oblong, diamond, etc.)
2. "skinUndertone": Their skin undertone (warm, cool, neutral)
3. "hairAttributes": Object containing hair's length, texture, color, and current style
4. "distinctiveFeatures": Array of any distinctive features that could influence styling recommendations
5. "currentStyle": Brief description of current styling choices visible in the image
6. "confidenceScore": A number from 10-100 indicating your confidence in the analysis

Be very thorough and specific in your analysis. If the image quality is poor, specifically mention this.`

// Style generation prompt
const styleGenerationPrompt = `You will now generate three distinct styling looks for this person based on the face analysis previously conducted. Create eye-catching, attractive transformations that enhance their natural features while providing a dramatic "glow-up" effect.

STYLING INSTRUCTIONS:
1. Create three distinct looks:
   - "Soft Glow": A natural, enhanced version of their current look with subtle improvements
   - "Bold Pop": A dramatic, confident look with vibrant colors and statement elements
   - "Wild Vibe": An adventurous, creative look that pushes boundaries

2. For each look, provide the following details:
   - Hair styling recommendations (cut, color, styling technique)
   - Makeup suggestions (colors, techniques, focal points)
   - Other enhancement recommendations (accessories, etc.)
   - Brief, uplifting style notes written in a fun, encouraging tone with emojis

3. End with a brief "Shopping List" of 3-5 recommended products that would help achieve these looks

Return your response in JSON format with the following structure:
{
  "looks": [
    {
      "name": "Soft Glow",
      "description": "Brief overview of this look",
      "hairStyling": "Hair recommendations",
      "makeup": "Makeup recommendations",
      "accessories": "Accessory suggestions",
      "styleNotes": "Fun, uplifting style notes with emojis",
      "imagePrompt": "A detailed prompt that can be used to generate an image of this look"
    },
    // repeat for Bold Pop and Wild Vibe
  ],
  "shoppingList": [
    {
      "productName": "Product name",
      "purpose": "What it's for",
      "benefit": "How it helps achieve the look"
    },
    // 2-4 more products
  ]
}`

// Image generation prompt
const imageGenerationPrompt = `You are an expert image generator specifically trained to create attractive, stylized portrait transformations based on selfies. Your task is to take a person's selfie and create a transformed version according to a specific style direction.

IMPORTANT RULES:
1. Maintain the person's core identity and facial structure
2. Apply the style transformation naturally and flatteringly
3. Ensure the output image looks professional and polished
4. Match the described style exactly
5. Keep the person recognizable while enhancing their features
6. Do NOT distort facial features or create unrealistic proportions
7. Do NOT alter age or ethnicity
8. Maintain original image composition and framing
9. The result should look like a professional stylist/makeup artist's work, not digital manipulation
10. Output like a photo, not an illustration, painting, cartoon or anime

Create a photorealistic transformed portrait that shows this person with the following style applied: `

// Function to detect image quality issues
function detectImageQualityIssues(faceAnalysis: any): { hasIssues: boolean, feedback: string | null } {
  const confidenceScore = faceAnalysis.confidenceScore;
  
  // If confidence is less than 70%, suggest a better image
  if (confidenceScore && confidenceScore < 70) {
    return { 
      hasIssues: true, 
      feedback: LOW_QUALITY_FEEDBACK 
    };
  }
  
  // Check for common phrases indicating poor image quality
  const analysisText = JSON.stringify(faceAnalysis).toLowerCase();
  const qualityIssueTerms = [
    "blurry", "unclear", "poor quality", "poor lighting", 
    "too dark", "not visible", "hard to see", "difficult to determine"
  ];
  
  for (const term of qualityIssueTerms) {
    if (analysisText.includes(term)) {
      return { 
        hasIssues: true, 
        feedback: LOW_QUALITY_FEEDBACK 
      };
    }
  }
  
  return { hasIssues: false, feedback: null };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check for API key
    if (!apiKey) {
      console.warn("OpenAI API key is not configured. Returning an error response.");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Parse the JSON request body instead of formData
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // The image is already in base64 format
    const dataURI = image;
    
    // STEP 1: Analyze the face in the selfie
    const faceAnalysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: faceAnalysisPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataURI } }
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const faceAnalysisContent = faceAnalysisResponse.choices[0]?.message?.content;
    
    if (!faceAnalysisContent) {
      throw new Error("No content in the face analysis OpenAI response");
    }

    // Parse the face analysis response
    const faceAnalysis = JSON.parse(faceAnalysisContent);
    
    // Check image quality
    const qualityCheck = detectImageQualityIssues(faceAnalysis);
    if (qualityCheck.hasIssues) {
      return NextResponse.json({
        success: false,
        imageQualityIssue: true,
        feedback: qualityCheck.feedback
      });
    }
    
    // STEP 2: Generate style recommendations based on the face analysis
    const styleGenResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: styleGenerationPrompt },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Here is the face analysis result: ${JSON.stringify(faceAnalysis)}` 
            },
            { type: "image_url", image_url: { url: dataURI } }
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const styleGenContent = styleGenResponse.choices[0]?.message?.content;
    
    if (!styleGenContent) {
      throw new Error("No content in the style generation OpenAI response");
    }

    // Parse the style generation response
    const styleRecommendations = JSON.parse(styleGenContent);
    
    // STEP 3: For demonstration purposes, instead of actually generating transformed images
    // we'll return placeholder URLs for now, as image generation requires DALL-E credits
    // In a real implementation, you would uncomment the code below:
    
    const transformedImages = [];
    
    for (const look of styleRecommendations.looks) {
      // In a real application, this is how you'd call DALL-E to generate the image:
      /*
      // Combine the base prompt with the specific style prompt
      const fullPrompt = `${imageGenerationPrompt}${look.imagePrompt}`;
      
      // Generate the image
      const imageGenResponse = await openai.images.generate({
        prompt: fullPrompt,
        model: "dall-e-3",
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
      });
      
      // Add the generated image URL to our results
      transformedImages.push({
        lookName: look.name,
        imageUrl: imageGenResponse.data[0].url
      });
      */
      
      // For demo purposes, use placeholder images
      transformedImages.push({
        lookName: look.name,
        imageUrl: `https://placehold.co/1024x1024/FF7CFD/FFFFFF?text=${encodeURIComponent(look.name)}` 
      });
    }
    
    // Combine all results
    const result = {
      success: true,
      faceAnalysis,
      styleRecommendations,
      transformedImages
    };
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error("API Error:", error.message);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process the image. Please try again." 
      },
      { status: 500 }
    );
  }
}
