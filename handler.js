// handler.js

import * as fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import settings from './settings.js';
import { isAutoLikeStatusEnabled } from './lib/autolikestatus.js';
import { isAutoTypingEnabled } from './lib/autotyping.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = new Map();

// Global owner tracking
export const dynamicOwners = new Set(settings.botOwnerNumbers);

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

    if (msg.key.remoteJid === 'status@broadcast') return;

    const fromMe = msg.key.fromMe;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');

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

    if (fromMe && !settings.allowSelfCommands && text.startsWith(prefix)) return;

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

    const nameColored = chalk.yellow(senderName);
    const sourceInfo = isGroup
        ? chalk.blueBright(`👥 ${groupName}`)
        : (fromMe ? chalk.gray('🤖 Self Chat') : chalk.magenta('👤 Private Chat'));
    const messageColored = chalk.green(text);
    console.log(`💬 ${nameColored} (${sourceInfo}): ${messageColored}`);

    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    const senderJid = isGroup
        ? msg.key.participant || msg.participant
        : msg.key.remoteJid;

    const replyJid = isGroup ? msg.key.remoteJid : senderJid;

    // 🔁 Resolve real JID if using 'lid' format
    let resolvedJid = senderJid;
    try {
        const resolved = await sock.onWhatsApp(senderJid);
        if (resolved?.[0]?.jid) {
            resolvedJid = resolved[0].jid;
            console.log('🔄 Resolved lid to:', resolvedJid);
        }
    } catch (err) {
        console.warn('⚠️ Could not resolve JID:', err);
    }

    const normalize = num => num.replace(/\D/g, '').replace(/^0+/, '');
    const normalizedSender = normalize(resolvedJid.split('@')[0]);

    const isBotOwner = [...dynamicOwners].some(owner => {
        const normOwner = normalize(owner.split('@')[0] || owner);
        return normalizedSender.endsWith(normOwner);
    });

    console.log(`✅ isBotOwner: ${isBotOwner}`);
    console.log('👑 Current dynamicOwners:', [...dynamicOwners]);

    if (fromMe && !dynamicOwners.has(resolvedJid)) {
        dynamicOwners.add(resolvedJid);
        console.log(`🆕 Added ${resolvedJid} as a dynamic owner.`);
    }

    const sessionPath = path.join('sessions', 'cred.js');
    if (!fs.existsSync(sessionPath)) {
        await sock.sendMessage(replyJid, {
            text: `❌ *Access Denied*\n\nYour session is not active.`
        });
        return;
    }

    const banPath = './data/banned.json';
    if (fs.existsSync(banPath)) {
        const banned = JSON.parse(fs.readFileSync(banPath));
        const userJid = isGroup ? msg.key.participant : msg.key.remoteJid;
        if (Array.isArray(banned) && banned.includes(userJid)) return;
    }

    console.log(chalk.cyan(`📥 ${commandName} called by ${senderName} (${normalizedSender}) on ${os.hostname()}`));

    if (isAutoTypingEnabled()) {
        await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async function sendReply(jid, replyText, extra = {}) {
        const tag = '\n\n— *BUGS-BOT support tech*';
        return sock.sendMessage(jid, { text: replyText + tag, ...extra });
    }

    try {
        await command.execute(sock, msg, args, {
            senderJid,
            senderNumber: normalizedSender,
            isGroup,
            isBotOwner,
            replyJid,
            sendReply
        });
        console.log(chalk.greenBright(`✅ Command '${commandName}' executed successfully.`));
    } catch (err) {
        console.error(chalk.bgRed.white(`❌ Error executing ${commandName}:`), err);
        await sock.sendMessage(replyJid, {
            text: `⚠️ An error occurred while executing *${commandName}*.`
        });
    }
}

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
