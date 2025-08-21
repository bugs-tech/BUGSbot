import fetch from 'node-fetch';

export const name = 'ask';
export const description = 'Ask AI a question'; // removed Gemini
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .ask [your question]\n_Example: .ask What is quantum computing?_');
  }

  const query = encodeURIComponent(args.join(' '));
  // You can still use the Gemini endpoint, but we hide its branding in responses
  const apiUrl = `https://api.giftedtech.co.ke/api/ai/geminiai?apikey=gifted&q=${query}`;

  try {
    console.log(`📥 ask called with query: ${decodeURIComponent(query)}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    console.log('🔍 API Response (ask):', json);

    if (!json?.result) {
      return sendReply('⚠️ AI did not return a valid response.\n\n— > Bugs');
    }

    // Strip unwanted footers or branding
    const cleanResult = json.result
      .replace(/_?Powered by.*$/i, '')   // removes "Powered by ..." lines
      .replace(/Gemini\s*AI/gi, 'AI')    // replaces "Gemini AI" mentions
      .trim();

    await sendReply(`*🧠 AI Response:*\n\n${cleanResult}\n\n`);

  } catch (error) {
    console.error('❌ Error executing ask:', error);
    return sendReply('❌ An unexpected error occurred while using AI.');
  }
}
