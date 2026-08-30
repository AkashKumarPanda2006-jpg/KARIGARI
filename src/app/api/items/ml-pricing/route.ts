import { NextResponse } from "next/server";
import { generateContentWithFallback } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { imageBase64, description, rawMaterialCost, laborDays } = await req.json();

    if (!imageBase64 || !description) {
      return NextResponse.json({ error: "Image and description are required for ML analysis" }, { status: 400 });
    }

    const base64Data = imageBase64.split(",")[1];

    const prompt = `
      Act as an advanced Machine Learning Dynamic Pricing Algorithm for Indian handicrafts.
      Analyze the provided product image and description to determine its market value.
      
      Inputs:
      - Description: "${description}"
      - Raw Material Cost: ₹${rawMaterialCost}
      - Labor Days: ${laborDays}
      
      Task:
      1. Visually analyze the image to determine the craftsmanship quality, complexity, and finish.
      2. Analyze the current e-commerce market trends in India for this specific type of item.
      3. Calculate competitive selling prices for Flipkart Samarth, Amazon Karigar, and the Government e-Marketplace (GeM).
      4. Ensure the suggested price provides a fair profit margin above the raw material + labor costs.
      
      Return your analysis as a JSON object with this exact format (no markdown, just raw JSON):
      {
         "flipkartPrice": 2500,
         "amazonPrice": 2800,
         "gemPrice": 2400,
         "suggestedPrice": 2600,
         "mlReasoning": "Visual analysis indicates high-quality tight weaving. Market trends show premium pricing for this pattern on Amazon, while GeM requires more competitive bulk pricing."
      }
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
            flipkartPrice: { type: "INTEGER" },
            amazonPrice: { type: "INTEGER" },
            gemPrice: { type: "INTEGER" },
            suggestedPrice: { type: "INTEGER" },
            mlReasoning: { type: "STRING" }
          },
          required: ["flipkartPrice", "amazonPrice", "gemPrice", "suggestedPrice", "mlReasoning"]
        }
      }
    );

    const rawText = typeof result === 'string' ? result : (result as { text?: string })?.text || '{}';
    let parsed: any = {};
    
    try {
      parsed = JSON.parse(rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, ''));
    } catch (e) {
      console.error("Failed to parse ML Pricing response:", rawText);
      throw new Error("Failed to parse ML pricing output");
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("ML Pricing API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate ML pricing" }, { status: 500 });
  }
}
