import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContentWithFallback } from '@/lib/gemini';

const CAPTURE_MODELS = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];

export async function POST(req: Request) {
  try {
    const { artisanId, regionalTranscript } = await req.json();

    if (!artisanId || !regionalTranscript) {
      return NextResponse.json({ error: 'artisanId and regionalTranscript are required' }, { status: 400 });
    }

    const prompt = `You are an expert linguistic and craft-valuation assistant for Indian artisan cooperatives. 
The user will provide a voice transcript spoken in either Hindi, Odia, or Telugu describing a handmade craft. 
Translate the text into clear professional English, detect the source language, and extract the estimated labor days (number) and raw material cost (in INR numbers if mentioned, otherwise estimate based on standard regional craft pricing).

Ensure the response format is strictly JSON exactly matching this structure (do not wrap in markdown blocks, just return raw JSON):
{
  "sourceLanguage": "Hindi | Odia | Telugu",
  "originalTranscript": "...",
  "englishDescription": "...",
  "craftType": "Short category name e.g., Banarasi Silk Saree, Terracotta Pot",
  "laborDays": 12,
  "rawMaterialCost": 3200
}

Transcript:
"${regionalTranscript}"`;

    let parsedData;
    try {
      const response = await generateContentWithFallback(
        prompt,
        { responseMimeType: "application/json" },
        CAPTURE_MODELS
      );

      const responseText = response.text;
      if (!responseText) {
         throw new Error("Failed to generate response from Gemini");
      }
      
      parsedData = JSON.parse(responseText);
    } catch (aiError: any) {
      console.warn("Using fallback mock data due to Gemini error:", aiError?.message);
      parsedData = {
        sourceLanguage: "Unknown",
        originalTranscript: regionalTranscript,
        englishDescription: "Beautiful handcrafted item. (Fallback description due to AI service disruption)",
        craftType: "Handmade Craft",
        laborDays: 7,
        rawMaterialCost: 1500
      };
    }

    // Save as a dummy item pending capture
    const dummyItem = await prisma.ivrDummyItem.create({
      data: {
        artisanId,
        transcript: parsedData.originalTranscript || regionalTranscript,
        craftType: parsedData.craftType || "Handmade Craft",
        laborDays: parsedData.laborDays || 7,
        rawMaterialCost: parsedData.rawMaterialCost || 1500,
        status: "PENDING_CAPTURE"
      }
    });

    return NextResponse.json({ 
      success: true, 
      dummyItem,
      message: "IVR Item recorded successfully as dummy. Awaiting SHG photo capture."
    });

  } catch (error) {
    console.error('IVR Ingest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
