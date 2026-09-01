import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { craftType, artisanName, clusterName, price, laborDays, description } = await req.json();

    if (!craftType) {
      return NextResponse.json({ error: "craftType is required" }, { status: 400 });
    }

    const prompt = `You are an elite viral social media marketing director specializing in Indian D2C handloom and handicrafts.
The artisan is: "${artisanName || 'Master Weaver'}" from "${clusterName || 'Bargarh, Odisha'}".
Craft Type: "${craftType}".
Labor: "${laborDays || 12} days of handcrafting".
Price: "₹${price || 4500}".
Raw Details: "${description || 'Authentic traditional handmade craft.'}".

Generate a complete, high-converting social media marketing kit for Instagram, YouTube Shorts, and WhatsApp.
Focus on authenticity, emotional storytelling, fighting machine-made counterfeits, and the fair wage guarantee.

Return the result as a strict JSON object with this exact schema:
{
  "adTitle": "Punchy 6-word high-converting ad title",
  "reelScript": {
    "hook": "0-3s: Provocative viral visual hook (e.g. Did you know a machine takes 20 mins to fake this, but Lakshmi spent 14 days weaving it?)",
    "body": "4-10s: Emotional story of the artisan's technique, natural dyes, and heritage.",
    "cta": "11-15s: Clear call to action (e.g. Tap the link in bio to verify the QR digital passport and buy direct from the weaver.)"
  },
  "instagramCaption": "Engaging 2-paragraph Instagram caption with emotional storytelling and fair-trade trust.",
  "hashtags": ["#HandloomSaree", "#VocalForLocal", "#AuthenticIkat", "#SlowFashion", "#DiwaliShopping", "#IndianArtisans"],
  "whatsappPitch": "Formatted WhatsApp status and broadcast message with emojis ready to share with customers.",
  "microAffiliateOffer": "Short invitation message for fashion creators to wear this craft and earn a 5% heritage affiliate commission."
}`;

    const apiKey = process.env.GROQ_API_KEY;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a JSON-only API. You output raw, valid JSON with no markdown backticks." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Groq API Error");
    }

    const rawText = data.choices?.[0]?.message?.content || "{}";
    let parsedData: any = {};
    try {
      const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse social ad JSON:", rawText);
      throw new Error("Failed to parse social ad response");
    }

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error("Social Ad API Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        adTitle: "Authentic Handcrafted Masterpiece • Direct from Weaver",
        reelScript: {
          hook: "0-3s: Don't buy power-loom counterfeits this festival season!",
          body: "4-10s: Handwoven over 14 days using pure heritage techniques and natural organic dyes.",
          cta: "11-15s: Scan the QR code to meet the artisan and buy directly with 0% middleman cut."
        },
        instagramCaption: "Every thread tells a story of patience, heritage, and pride. Handcrafted with love by our verified master artisans. Support local weavers directly.",
        hashtags: ["#VocalForLocal", "#HandmadeInIndia", "#AuthenticCrafts", "#FairWage", "#HeritageWeaves"],
        whatsappPitch: "🌟 *Authentic Handcrafted Special* 🌟\nDirect from our weaver cluster. 100% genuine with QR digital passport.\n\n👉 *Tap to view and order:* https://karigari.in/verify/PAT-101",
        microAffiliateOffer: "Collaborate with authentic Indian artisans! Share this piece with your audience and earn a 5% verified affiliate reward."
      }
    });
  }
}
