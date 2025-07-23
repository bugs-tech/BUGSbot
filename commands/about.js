// commands/about.js
import os from 'os';

export const name = 'about';

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

export async function execute(sock, msg, args) {
    const hostname = os.hostname();
    const uptime = formatUptime(process.uptime());

    const aboutMsg = `🤖 *Bugs_bot*\nHost: ${hostname}\nUptime: ${uptime}\n`;

    await sock.sendMessage(msg.key.remoteJid, {
        text: aboutMsg
    }, { quoted: msg });
}
