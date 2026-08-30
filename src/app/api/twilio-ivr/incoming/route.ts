import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Twilio uses urlencoded form data by default for webhooks
  
  // TwiML (Twilio Markup Language) to instruct the phone call
  const twiml = `
    <Response>
        <Say language="hi-IN" voice="Polly.Aditi">Namaskar, Karigari mein aapka swagat hai. Aaj aapne kya banaya hai? Bip ke baad batayein.</Say>
        <!-- Record the caller's response, max 30 seconds -->
        <Record 
            action="/api/twilio-ivr/process" 
            maxLength="30" 
            playBeep="true"
        />
    </Response>
  `;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
