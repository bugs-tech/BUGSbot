// lib/autolikestatus.js

import fs from 'fs';

const path = './data/autolikestatus.json';

export function isAutoLikeStatusEnabled() {
    try {
        const data = JSON.parse(fs.readFileSync(path));
        return data.enabled === true;
    } catch {
        return false;
    }
}
