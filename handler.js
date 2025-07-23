// handler.js

import * as fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import settings from './settings.js';
import { isAutoLikeStatusEnabled } from './lib/autolikestatus.js';
import { isAutoTypingEnabled } from './lib/autotyping.js'; // ✅ Autotyping toggle

const commands = new Map();

// 📁 Dynamically load all command modules from ./commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    if (command.name) {
        commands.set(command.name, command);
    }
}

// 📬 Main handler for all incoming messages
export async function handleCommand(sock, msg) {
    const prefix = settings.prefix || '.';

    // 🚫 Ignore broadcast/status messages (handled separately)
    if (msg.key.remoteJid === 'status@broadcast') {
        return; // Leave it for status handler below
    }

    const fromMe = msg.key.fromMe;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');

    // 🧾 Extract message text from all message types
    let text = '';
    if (msg.message?.conversation) text = msg.message.conversation;
    else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
    else if (msg.message?.imageMessage?.caption) text = msg.message.imageMessage.caption;
    else if (msg.message?.videoMessage?.caption) text = msg.message.videoMessage.caption;
    else if (msg.message?.documentMessage?.caption) text = msg.message.documentMessage.caption;
    else if (msg.message?.buttonsResponseMessage?.selectedButtonId) text = msg.message.buttonsResponseMessage.selectedButtonId;
    else if (msg.message?.templateButtonReplyMessage?.selectedId) text = msg.message.templateButtonReplyMessage.selectedId;
    else if (msg.message) text = '[Non-text message received]';
    else text = '[Empty message]';

    // 🙈 Ignore self commands if disallowed
    if (fromMe && !settings.allowSelfCommands && text.startsWith(prefix)) {
        return;
    }

    // 👤 Extract sender name and group name (if applicable)
    const senderName = msg.pushName || msg.key.participant || msg.key.remoteJid || 'Unknown';
    let groupName = '';
    if (isGroup && sock.groupMetadata) {
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            groupName = metadata.subject;
        } catch (err) {
            groupName = '[Unknown Group]';
        }
    }

    // 🎨 Stylized console log of message
    const nameColored = chalk.yellow(senderName);
    const sourceInfo = isGroup
        ? chalk.blueBright(`👥 ${groupName}`)
        : (fromMe ? chalk.gray('🤖 Self Chat') : chalk.magenta('👤 Private Chat'));
    const messageColored = chalk.green(text);
    console.log(`💬 ${nameColored} (${sourceInfo}): ${messageColored}`);

    // ⛔ Ignore messages that don't start with prefix
    if (!text.startsWith(prefix)) return;

    // ✂️ Parse command and arguments
    const args = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // 🔍 Fetch command handler
    const command = commands.get(commandName);
    if (!command) return;

    // 🧠 Identify sender JID for replies
    const senderJid = isGroup
        ? msg.key.participant || msg.participant
        : msg.key.remoteJid;

    // 📍 Get the proper reply JID depending on group or private
    const replyJid = isGroup ? msg.key.remoteJid : senderJid;

    // 🧼 Normalize sender number for permission checks
    const senderNumber = senderJid.replace(/[@:].*/g, ''); // e.g., "237xxxxxxx"

    // 🔐 Check session file exists (cred.js)
    const sessionPath = path.join('sessions', 'cred.js');
    if (!fs.existsSync(sessionPath)) {
        await sock.sendMessage(replyJid, {
            text: `❌ *Access Denied*\n\nYour session is not active.`
        });
        return;
    }

    // 🚷 Block banned users (banned.json)
    const banPath = './data/banned.json';
    if (fs.existsSync(banPath)) {
        const banned = JSON.parse(fs.readFileSync(banPath));
        const userJid = isGroup ? msg.key.participant : msg.key.remoteJid;
        if (Array.isArray(banned) && banned.includes(userJid)) return;
    }

    // 💡 Flag: is user an owner?
    const isBotOwner = settings.botOwnerNumbers.includes(senderNumber);

    // 🌐 Log command usage with system hostname
    console.log(chalk.cyan(`📥 ${commandName} called by ${senderName} (${senderNumber}) on ${os.hostname()}`));

    // 💬 If autotyping is enabled, send composing presence first
    if (isAutoTypingEnabled()) {
        await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
        await new Promise(resolve => setTimeout(resolve, 1000)); // simulate 1s typing
    }

    // ✅ Helper to send replies with BOT tag appended
    async function sendReply(jid, replyText, extra = {}) {
        const tag = '\n\n— *BUGS-BOT support tech*';
        return sock.sendMessage(jid, { text: replyText + tag, ...extra });
    }

    // ▶️ Try to execute the command
    try {
        await command.execute(sock, msg, args, {
            senderJid,
            senderNumber,
            isGroup,
            isBotOwner,
            replyJid,
            sendReply // Pass helper to commands
        });
        console.log(chalk.greenBright(`✅ Command '${commandName}' executed successfully.`));
    } catch (err) {
        console.error(chalk.bgRed.white(`❌ Error executing ${commandName}:`), err);
        await sock.sendMessage(replyJid, {
            text: `⚠️ An error occurred while executing *${commandName}*.`
        });
    }
}

// 🔁 Auto-react to statuses if enabled
export async function handleStatus(sock, msg) {
    if (msg.key.remoteJid === 'status@broadcast' && isAutoLikeStatusEnabled()) {
        try {
            await sock.sendMessage('status@broadcast', {
                react: {
                    text: '❤️',
                    key: msg.key
                }
            });
            console.log(`✅ Auto-reacted to a status.`);
        } catch (err) {
            console.error('❌ Failed to auto-react to status:', err);
        }
    }
}
