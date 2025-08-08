import fetch from 'node-fetch';

export const name = 'gimg';
export const description = 'Generate an image using deep AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { sendReply, pushName } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .gimg [prompt]\n_Example: .gimg A handsome gentle man_');
  }

  const prompt = args.join(' ');
  const apiUrl = `https://apis.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(prompt)}`;

  try {
    console.log(`📥 gimg called by ${pushName || 'Unknown'} (${msg.sender}) on ${msg.key.id}`);
    console.log(`🔍 API URL: ${apiUrl}`);

    // Fetch the image as buffer (not json)
    const res = await fetch(apiUrl);
    if (!res.ok) {
      return sendReply('❌ Failed to generate image. Try again.\n\n— *BUGS-BOT support tech*');
    }
    const buffer = await res.buffer();

    // Send the image buffer directly
    await sock.sendMessage(msg.key.remoteJid, {
      image: buffer,
      caption: `🧠 *Prompt:* ${prompt}\n\n— *BUGS-BOT support tech*`
    }, { quoted: msg });

    console.log(`✅ Command 'gimg' executed successfully.`);
  } catch (error) {
    console.error('❌ Error executing gimg:', error);
    return sendReply('❌ An unexpected error occurred while generating the image.\n\n— *BUGS-BOT support tech*');
  }
}
