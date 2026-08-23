import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { transcript, language, artisanName, currentRoute } = await req.json();

    const prompt = `You are a helpful, extremely concise, and encouraging voice assistant for the 'Karigari' app.
Your user is a marginalized Indian artisan named ${artisanName || 'Artisan'}. 
They are currently on this page route: "${currentRoute || '/dashboard'}"
They just said this to you via voice typing: "${transcript}"

The app has features to:
- Capture new crafts (take photos and get AI valuation)
- Apply for government schemes (PM Vishwakarma, MUDRA)
- List on ONDC (B2B wholesale network)
- View Market Demand Map (Insights)
- Track their uploaded works and advances.

Based on the page they are on, guide them appropriately. Respond directly to the artisan. Be very brief (1-2 sentences max) as this will be read aloud via Text-To-Speech.
CRITICAL INSTRUCTION: You must respond in the regional language corresponding to code '${language}' (e.g. Odia, Hindi). HOWEVER, you MUST OUTPUT IT IN ROMANIZED / TRANSLITERATED ENGLISH ALPHABET. 
Make the translation highly conversational and fluent (e.g. 'Namaskar, aapananka swagat. Mui kipari sahajya kari paribi?'). DO NOT use native scripts (No Devanagari, no Odia script). This ensures the basic browser TTS engine can read it properly.`;

    const result = await generateContentWithFallback(
      [{ text: prompt }],
      { responseMimeType: "text/plain" }
    );

    return NextResponse.json({ success: true, text: result.text || "Sorry, I couldn't understand." });
  } catch (error: any) {
    console.error("Voice API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
