import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { craftType, clusterName } = await req.json();

    if (!craftType) {
      return NextResponse.json({ error: 'craftType is required' }, { status: 400 });
    }

    const prompt = `You are a dynamic raw material sourcing engine for Indian artisans.
The artisan makes: "${craftType}" and is located near "${clusterName}".
Generate 3 realistic raw material items they would need to buy to make this craft.
Do not include items they don't use (e.g., no gold for pottery, no clay for sarees).
For each item, provide a realistic supplier name (a cooperative or local store), location, and price in INR (e.g. '?850').

Return the result as a strict JSON array of objects with this schema:
[
  {
    "id": 1,
    "name": "Specific Raw Material Name",
    "supplier": "Realistic Supplier Name",
    "location": "City, State",
    "price": "?...",
    "isVerified": true
  }
]`;

    // Using Groq instead of Gemini as requested
    const apiKey = process.env.GROQ_API_KEY ;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: "You are a JSON-only API. You output raw, valid JSON arrays with no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" } // Qwen supports JSON object, but we need an array. We will wrap the array in an object in prompt if needed, or just let it return array if it ignores json_object.
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || "Groq API Error");
    }

    const rawText = data.choices?.[0]?.message?.content || "[]";
    
    let parsedData = [];
    try {
      let cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      if (cleaned.startsWith('{') && !cleaned.startsWith('[{')) {
          // If Groq wrapped the array in an object due to json_object mode, extract it
          const obj = JSON.parse(cleaned);
          parsedData = obj.materials || obj.data || obj.items || Object.values(obj)[0] || [];
          if (!Array.isArray(parsedData)) parsedData = [parsedData];
      } else {
          parsedData = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error("Failed to parse materials:", rawText);
      throw new Error("Failed to parse: " + rawText);
    }

    const stockImages = [
      "https://images.unsplash.com/photo-1584286595398-a59f2afdd7ea?w=400&q=80", // fabric/colors
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&q=80", // cloth
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", // brushes/tools
      "https://images.unsplash.com/photo-1610738048682-990a4b711e51?w=400&q=80", // clay/pottery
      "https://images.unsplash.com/photo-1558024220-b302c009d134?w=400&q=80", // wood/metal
    ];

    parsedData.forEach((item: any) => {
      const text = (item.name + craftType).toLowerCase();
      let img = stockImages[0];
      if (text.includes("cloth") || text.includes("saree") || text.includes("silk") || text.includes("cotton") || text.includes("thread")) img = stockImages[1];
      else if (text.includes("brush") || text.includes("tool") || text.includes("carv")) img = stockImages[2];
      else if (text.includes("clay") || text.includes("mud") || text.includes("terracotta")) img = stockImages[3];
      else if (text.includes("wood") || text.includes("metal") || text.includes("brass") || text.includes("wire")) img = stockImages[4];
      item.image = img;
    });

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error('Materials error:', error);
    return NextResponse.json({ 
      success: true, 
      data: [
        {
          id: 1, name: `Premium Artisan Material (Error: ${error.message})`, supplier: "Local Cooperative", location: "Local Cluster", price: "?500", isVerified: true,
          image: "https://images.unsplash.com/photo-1584286595398-a59f2afdd7ea?w=400&q=80"
        }
      ]
    });
  }
}
