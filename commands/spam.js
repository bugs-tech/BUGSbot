// commands/spam.js

export const name = 'spam';
export const description = 'Spam a message multiple times (owner only)';
export const usage = '.spam <count> <message>';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
    const { senderJid, isBotOwner } = context;
    const chatId = msg.key.remoteJid;

    // 🔐 Only allow bot owners
    if (!isBotOwner) {
        await sock.sendMessage(chatId, {
            text: '🚫 This command is restricted to bot owners only.'
        });
        return;
    }

    // 🧾 Validate input
    const count = parseInt(args[0]);
    const message = args.slice(1).join(' ');

    if (!count || !message || isNaN(count) || count > 30 || count < 1) {
        await sock.sendMessage(chatId, {
            text: '❌ Usage: `.spam <count> <message>`\nExample: `.spam 5 Hello!`'
        });
        return;
    }

    // 🧨 Send message in a loop
    for (let i = 0; i < count; i++) {
        await sock.sendMessage(chatId, { text: message });
        await new Promise(resolve => setTimeout(resolve, 500)); // ⏱️ slight delay between messages
    }
}
