// commands/owner.js

export const name = 'owner';
export const description = 'Show current bot owners';
export const usage = '.owner';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
    // Get the chat where the message was triggered (group or private)
    const chatId = msg.key.remoteJid;

    // Load settings dynamically to get the owner numbers
    const settings = (await import('../settings.js')).default;
    const owners = settings.botOwnerNumbers;

    // Format owner numbers into clickable WhatsApp links
    const formatted = owners.map((num, i) => `*${i + 1}.* https://wa.me/${num}`).join('\n');

    // Send the message in the same place where it was triggered
    await sock.sendMessage(chatId, {
        text: `👑 *BOT OWNER(S)* 👑\n\n${formatted}`
    });
}
