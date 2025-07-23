// commands/ping.js
import os from 'os';

export const name = 'ping';

/**
 * Responds to a ping command with bot stats
 */
export async function execute(sock, msg, args) {
    const start = Date.now();

    const jid = msg.key.remoteJid;
    const senderName = msg.pushName || 'User';
    const isGroup = jid.endsWith('@g.us');

    // Send temporary "Pinging..." message
    const waitMsg = await sock.sendMessage(jid, {
        text: '⏳ *Pinging...*'
    }, { quoted: msg });

    const latency = Date.now() - start;
    const uptime = formatUptime(process.uptime());
    const host = os.hostname();

    // Prepare styled response
    const response = `
╭─❖ *Pong Response*
│👤 *User:* ${senderName}
│💬 *Chat:* ${isGroup ? 'Group Chat' : 'Private Chat'}
│📡 *Latency:* ${latency}ms
│🕒 *Uptime:* ${uptime}
│💻 *Host:* ${host}
╰───────────────❖
`.trim();

    // Log to terminal
    console.log(`
📶 PING RESPONSE
├─ From   : ${senderName}
├─ Chat   : ${isGroup ? 'Group' : 'Private'}
├─ Latency: ${latency}ms
├─ Uptime : ${uptime}
└─ Host   : ${host}
    `.trim());

    // Send response
    
    await sock.sendMessage(jid, {
        text: response
    }, { quoted: msg });
}

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}
