import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, description } = await req.json();

    if (!imageBase64 || !description) {
      return NextResponse.json(
        { error: "Image and description are required for verification" },
        { status: 400 }
      );
    }

    // Prepare image for Gemini Vision
    // Remove the data:image/...;base64, prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are an expert appraiser of traditional Indian handcrafted items.
    The artisan has provided this description:
    "${description}"
    
    Look at the image. Is this a real, handcrafted item that is GENERALLY consistent with the description?
    Be lenient. If the description says a saree and it looks like a piece of clothing or fabric, or a pot and it looks like a pot, approve it.
    Reject it ONLY if it is obviously a random unrelated object (like a laptop), a selfie, a screenshot, or completely unrelated to the craft.
    `;

    const result = await generateContentWithFallback(
      [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
      ],
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            isVerified: { type: "BOOLEAN" },
            reasoning: { type: "STRING" }
          },
          required: ["isVerified", "reasoning"]
        }
      }
    );

    const responseText = result.text;
    let jsonResult;
    try {
      jsonResult = JSON.parse(responseText || '{}');
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      jsonResult = { isVerified: true, reasoning: "Fallback verification due to parser error" };
    }

    return NextResponse.json({ success: true, data: jsonResult });

  } catch (error: any) {
    console.error("Vision Verify Error:", error);
    return NextResponse.json(
      { error: "Failed to verify image using AI", details: error.message },
      { status: 500 }
    );
  }
}
