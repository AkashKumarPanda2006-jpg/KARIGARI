import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl');
  const callerNumber = formData.get('From');

  // At this point, the artisan has hung up. We have their recording URL.
  // 1. You would download the MP3 from recordingUrl
  // 2. Pass the audio to Gemini via @/lib/gemini (same prompt as voice-parse)
  // 3. Save the resulting JSON to the Prisma database associated with callerNumber
  // 4. Send an SMS confirmation back to the artisan
  
  console.log('Received IVR Recording from', callerNumber);
  console.log('Audio URL:', recordingUrl);

  // Return a generic TwiML to say thank you before hanging up
  const twiml = `
    <Response>
        <Say language="hi-IN" voice="Polly.Aditi">Dhanyavad. Aapki listing Karigari par jaldi hi verify ki jayegi. Namaste.</Say>
        <Hangup />
    </Response>
  `;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
