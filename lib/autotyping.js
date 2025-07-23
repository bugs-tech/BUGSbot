// lib/autotyping.js
import fs from 'fs';

const path = './data/autotyping.json';

export function isAutoTypingEnabled() {
    if (!fs.existsSync(path)) return false;
    try {
        const data = JSON.parse(fs.readFileSync(path));
        return data.enabled === true;
    } catch {
        return false;
    }
}

export function setAutoTyping(state) {
    fs.writeFileSync(path, JSON.stringify({ enabled: state }, null, 2));
}
