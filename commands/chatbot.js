// commands/chatbot.js
import { toggleChatbot } from '../lib/autochatbot.js';

export const name = 'chatbot';
export async function execute(sock, msg, args, { sendReply, senderNumber }) {
  const toggle = args[0]?.toLowerCase();

  if (!['on', 'off'].includes(toggle)) {
    return sendReply(`⚙️ Usage: .chatbot on/off`);
  }

  const state = toggle === 'on';
  toggleChatbot(senderNumber, state);

  await sendReply(`🤖 Chatbot has been *${state ? 'enabled' : 'disabled'}* for your private messages.`);
}
