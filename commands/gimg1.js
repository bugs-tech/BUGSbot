// commands/gimg1.js
import fetch from 'node-fetch';

export const name = 'gimg1';
export const description = 'Generate an image using Stable Diffusion AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply, pushName } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .gimg1 [prompt]\n_Example: .gimg1 Tall Green Grass_');
  }

  const prompt = args.join(' ');
  const apiUrl = `https://api.giftedtech.co.ke/api/ai/sd?apikey=gifted&prompt=${encodeURIComponent(prompt)}`;

  try {
    console.log(`📥 gimg1 called by ${pushName || 'Unknown'} on ${msg.key.id}`);
    console.log(`🔍 API URL: ${apiUrl}`);

    // Fetch image
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    // Get raw image buffer
    const buffer = await res.buffer();

    // Send to chat
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        image: buffer,
        caption: `🧠 *Prompt:* ${prompt}\n\n— *BUGS-BOT support tech*`,
      },
      { quoted: msg }
    );

    console.log(`✅ Command 'gimg1' executed successfully.`);
  } catch (error) {
    console.error('❌ Error executing gimg1:', error);
    return sendReply(
      '❌ An unexpected error occurred while generating the image.\n\n— *BUGS-BOT support tech*'
    );
  }
}
