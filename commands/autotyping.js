// commands/autotyping.js
import { setAutoTyping, isAutoTypingEnabled } from '../lib/autotyping.js';

export const name = 'autotyping';
export const description = 'Toggle autotyping on or off';
export const usage = '.autotyping on/off';

export async function execute(sock, msg, args, context) {
    const { senderJid, isBotOwner } = context;

    if (!isBotOwner) {
        await sock.sendMessage(senderJid, { text: '🚫 Only bot owners can use this command.' });
        return;
    }

    const choice = args[0]?.toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
        await sock.sendMessage(senderJid, {
            text: `❓ Usage:\n.autotyping on\n.autotyping off`
        });
        return;
    }

    setAutoTyping(choice === 'on');
    await sock.sendMessage(senderJid, {
        text: `✅ Autotyping is now *${choice.toUpperCase()}*.`
    });
}
