import fetch from 'node-fetch';

export const name = 'ask';
export const description = 'Ask Gemini AI a question';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .ask [your question]\n_Example: .ask What is quantum computing?_');
  }

  const query = encodeURIComponent(args.join(' '));
  const apiUrl = `https://api.giftedtech.co.ke/api/ai/geminiai?apikey=gifted&q=${query}`;

  try {
    console.log(`📥 ask called with query: ${decodeURIComponent(query)}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    console.log('🔍 API Response (ask):', json);

    if (!json?.result) {
      return sendReply('⚠️ Gemini AI did not return a valid response.\n\n— *BUGS-BOT support tech*');
    }

    // Remove any "Powered by..." footer from response
    const cleanResult = json.result
      .replace(/_?Powered by.*$/i, '') // Removes "Powered by GiftedTech AI" or similar
      .trim();

    await sendReply(`*🧠 Gemini AI Response:*\n\n${cleanResult}\n\n— *BUGS-BOT support tech*`);

  } catch (error) {
    console.error('❌ Error executing ask:', error);
    return sendReply('❌ An unexpected error occurred while using Gemini AI.');
  }
}
