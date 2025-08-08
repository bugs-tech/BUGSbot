// commands/img.js
import fetch from 'node-fetch';

export const name = 'img';
export const description = 'Generate an image using AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply, pushName } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .img [prompt]\n_Example: .img A futuristic city at sunset_');
  }

  const prompt = encodeURIComponent(args.join(' '));
  const apiUrl = `https://api.giftedtech.co.ke/api/ai/fluximg?apikey=gifted&prompt=${prompt}`;

  try {
    console.log(`📥 img called by ${pushName || 'Unknown'} (${msg.sender}) on ${msg.key.id}`);
    console.log(`🔍 API URL: ${apiUrl}`);

    const res = await fetch(apiUrl);
    const json = await res.json();

    console.log('🔍 API Response (img):', JSON.stringify(json, null, 2));

    if (!json?.status || !json?.result) {
      return sendReply('❌ Failed to generate image. Try again.\n\n— *BUGS-BOT support tech*');
    }

    // ✅ FIXED: use msg.key.remoteJid to avoid jidDecode error
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: json.result },
      caption: `✅ *Prompt:* ${decodeURIComponent(prompt)}\n\n— *BUGS-BOT support tech*`
    }, { quoted: msg });

    console.log(`✅ Command 'img' executed successfully.`);

  } catch (error) {
    console.error('❌ Error executing img:', error);
    return sendReply('❌ An unexpected error occurred while generating the image.');
  }
}
