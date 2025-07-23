// commands/echo.js
export const name = 'echo';

export async function execute(sock, msg, args) {
    if (args.length === 0) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '⚠️ Usage: .echo <message>'
        }, { quoted: msg });
    }

    const echoText = args.join(' ');
    await sock.sendMessage(msg.key.remoteJid, {
        text: echoText
    }, { quoted: msg });
}
