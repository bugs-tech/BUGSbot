// commands/autolikestatus.js

import fs from 'fs';
import path from 'path';

const togglePath = './data/autolikestatus.json';

function loadState() {
    if (!fs.existsSync(togglePath)) return false;
    try {
        const state = JSON.parse(fs.readFileSync(togglePath));
        return state.enabled === true;
    } catch {
        return false;
    }
}

function saveState(enabled) {
    fs.writeFileSync(togglePath, JSON.stringify({ enabled }, null, 2));
}

export const name = 'autolikestatus';
export async function execute(sock, msg, args, context) {
    const { senderJid, isBotOwner } = context;
    if (!isBotOwner) {
        await sock.sendMessage(senderJid, {
            text: '🚫 Only the bot owner can toggle autolikestatus.'
        });
        return;
    }

    const arg = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(arg)) {
        await sock.sendMessage(senderJid, {
            text: '⚙️ Usage: .autolikestatus on/off'
        });
        return;
    }

    const newState = arg === 'on';
    saveState(newState);
    await sock.sendMessage(senderJid, {
        text: `✅ Auto Like Status has been *${newState ? 'enabled' : 'disabled'}*.`
    });
}

export function isAutoLikeStatusEnabled() {
    return loadState();
}
