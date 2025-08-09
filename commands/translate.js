import fetch from 'node-fetch';

export const name = 'translate';
export const description = 'Translate text using GPT-4 AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .translate [text to translate]\n_Example: .translate Hello, how are you in French?_');
  }

  const query = encodeURIComponent(args.join(' '));
  const apiUrl = `https://api.giftedtech.co.ke/api/ai/gpt4?apikey=gifted&q=${query}`;

  try {
    console.log(`📥 translate called with: ${decodeURIComponent(query)}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    console.log('🔍 API Response (translate):', json);

    if (!json?.result) {
      return sendReply('⚠️ GPT-4 did not return a valid translation.\n\n— *BUGS-BOT support tech*');
    }

    // Remove "Powered by..." footer
    const cleanResult = json.result
      .replace(/_?Powered by.*$/i, '')
      .trim();

    await sendReply(`*🌐 Translated Result:*\n\n${cleanResult}\n\n— *BUGS-BOT support tech*`);

  } catch (error) {
    console.error('❌ Error executing translate:', error);
    return sendReply('❌ An unexpected error occurred while translating.\n\n');
  }
}