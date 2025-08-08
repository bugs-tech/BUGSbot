import fetch from 'node-fetch';

export const name = 'ai';
export const description = 'Ask the AI anything';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .ai [your question]\n_Example: .ai Who is Elon Musk?_');
  }

  const query = encodeURIComponent(args.join(' '));
  const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${query}`;

  try {
    console.log(`📥 ai called with query: ${decodeURIComponent(query)}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    console.log('🔍 API Response (ai):', json);

    if (!json?.result) {
      return sendReply('⚠️ AI did not return a valid response.\n\n— *BUGS-BOT support tech*');
    }

    const replyText = json.result.trim();

    await sendReply(`*🤖 AI Response:*\n\n${replyText}\n\n— `);

  } catch (error) {
    console.error('❌ Error executing ai:', error);
    return sendReply('❌ An unexpected error occurred while using AI.\n\n— *BUGS-BOT support tech*');
  }
}
