// commands/restart.js

export const name = 'restart';
export const description = 'Restart the bot (Owner only)';
export const usage = '.restart';

export async function execute(sock, msg, args, context) {
    const { isBotOwner, replyJid, sendReply } = context;

    if (!isBotOwner) {
        return await sendReply(replyJid, '🚫 This command is restricted to bot owners.');
    }

    await sendReply(replyJid, '♻️ Restarting *BUGS-BOT*...');

    // Wait a bit before restarting to ensure message is sent
    setTimeout(() => {
        console.log('🔄 Restarting bot as requested by owner...');
        process.exit(0); // Graceful shutdown, let a process manager like PM2/Render/Termux restart it
    }, 1000);
}
