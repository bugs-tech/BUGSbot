// commands/time.js
export const name = 'time';

export async function execute(sock, msg, args) {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', { timeZoneName: 'short' });

    await sock.sendMessage(msg.key.remoteJid, {
        text: `🕒 Current time:\n${timeString}`
    }, { quoted: msg });
}
