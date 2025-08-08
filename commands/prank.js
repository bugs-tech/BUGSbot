import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { botOwnerNumbers } from '../settings.js';

export default {
  name: 'prank',
  category: 'fun',
  description: 'Sends a scary or funny prank to target',
  usage: '.prank hack @user',
  async execute(m, { conn, args, sendReply }) {
    const type = args[0]?.toLowerCase();
    const tag = m.mentionedJid?.[0];

    const prankTypes = ['hack', 'virus', 'error', 'rickroll', 'ghostcall'];
    if (!type || !prankTypes.includes(type)) {
      return sendReply(`❗ Usage: .prank [${prankTypes.join(' | ')}] @user`);
    }

    let text = '';
    let media = null;

    switch (type) {
      case 'hack':
        text = `🧠 Initiating remote hack on ${tag ? '@' + tag.split('@')[0] : 'target'}...`;
        media = 'https://i.gifer.com/ZZ5H.gif'; // green matrix gif
        break;
      case 'virus':
        text = `☣️ WARNING: ${tag ? '@' + tag.split('@')[0] : 'target'}'s phone has been infected!`;
        media = 'https://i.gifer.com/Yz2z.gif';
        break;
      case 'error':
        text = `❌ Critical Error: Your device is now unstable.`;
        media = 'https://i.ibb.co/sbKZWZ1/fake-error.png';
        break;
      case 'rickroll':
        text = `😂 Never gonna give you up... 🎵`;
        media = 'https://media.tenor.com/1Q9jlpHOxLIAAAAC/rick-astley-rickroll.gif';
        break;
      case 'ghostcall':
        text = `📞 Incoming call from the spirit realm 👻...`;
        media = 'https://i.ibb.co/KbY8ndT/ghostcall.gif';
        break;
    }

    await conn.sendMessage(m.chat, {
      text,
      mentions: tag ? [tag] : [],
      ...(media && {
        caption: text,
        image: { url: media },
      })
    }, { quoted: m });
  }
};
