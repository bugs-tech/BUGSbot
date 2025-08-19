export const name = 'spams';
export const description = 'Spam a user privately until stopped';
export const category = 'fun';

const activeSpams = {}; // { targetJid: intervalId }

export async function execute(sock, msg, args) {
    try {
        // Function to find target JID
        const getTargetJid = () => {
            // 1. Reply
            if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                return msg.message.extendedTextMessage.contextInfo.participant;
            }
            // 2. Mention
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
                return msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // 3. Number
            if (args[0] && /^\d+$/.test(args[0].replace(/[^0-9]/g, ''))) {
                return args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            // 4. Username
            if (args[0] && sock.contacts && Object.keys(sock.contacts).length) {
                const lowerName = args[0].toLowerCase();
                for (const [jid, contact] of Object.entries(sock.contacts)) {
                    if (
                        contact?.name?.toLowerCase() === lowerName ||
                        contact?.notify?.toLowerCase() === lowerName
                    ) {
                        return jid;
                    }
                }
            }
            return null;
        };

        const target = getTargetJid();
        if (!target) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Could not find target user.' }, { quoted: msg });
        }

        const spamMessage = args.slice(1).join(' ');
        if (!spamMessage) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a message to spam.' }, { quoted: msg });
        }

        if (activeSpams[target]) {
            return sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Spam already running for this user.' }, { quoted: msg });
        }

        // Start spamming
        const intervalId = setInterval(() => {
            sock.sendMessage(target, { text: spamMessage });
        }, 200); // Every 2 seconds

        activeSpams[target] = intervalId;

        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Started spamming ${target}` }, { quoted: msg });
    } catch (err) {
        console.error(err);
        sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
}

export function stopAllSpams() {
    for (const target in activeSpams) {
        clearInterval(activeSpams[target]);
        delete activeSpams[target];
    }
}

export function stopSpamFor(target) {
    if (activeSpams[target]) {
        clearInterval(activeSpams[target]);
        delete activeSpams[target];
        return true;
    }
    return false;
}
