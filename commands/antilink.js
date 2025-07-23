// commands/antilink.js
import fs from 'fs';

export const name = 'antilink';
export const description = 'Enable or disable anti-link in group (admins only)';

const dataPath = './data/antilink.json';

function loadData() {
    if (!fs.existsSync(dataPath)) return {};
    return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export async function execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.participant;
    const metadata = await sock.groupMetadata(groupId);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);

    if (!admins.includes(sender)) {
        await sock.sendMessage(groupId, { text: '🚫 Only group admins can use this command.' });
        return;
    }

    const state = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(state)) {
        await sock.sendMessage(groupId, {
            text: '⚙️ Usage: *.antilink on* or *.antilink off*'
        });
        return;
    }

    const data = loadData();
    data[groupId] = state === 'on';
    saveData(data);

    const status = state === 'on' ? '🛡️ *Anti-link is now ENABLED*' : '⚠️ *Anti-link is now DISABLED*';
    await sock.sendMessage(groupId, { text: status });
}
