// handler.js

import * as fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import settings from './settings.js';
import { isAutoLikeEnabled } from './commands/autolike.js';
import { isAutoLikeStatusEnabled } from './lib/autolikestatus.js';
import { isAutoTypingEnabled } from './lib/autotyping.js';
import { isAutoViewStatusEnabled } from './commands/autoviewstatus.js';
import { isGroupBroadcastEnabled } from './commands/broadcastgroup.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = new Map();

// Track dynamic owners
export const dynamicOwners = new Set(settings.botOwnerNumbers);

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    if (command.name) {
        commands.set(command.name, command);
    }
}

// Handle messages
export async function handleCommand(sock, msg) {
    const prefix = settings.prefix || '.';

    if (msg.key.remoteJid === 'status@broadcast') return;

    const fromMe = msg.key.fromMe;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');

    // Extract text
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

    // Auto-like
    try {
        if (isAutoLikeEnabled() && !fromMe) {
            const messageTypesToReact = ['conversation', 'imageMessage', 'stickerMessage', 'videoMessage', 'documentMessage'];
            const msgType = Object.keys(msg.message || {})[0];
            if (messageTypesToReact.includes(msgType)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    react: {
                        text: '❤️',
                        key: msg.key
                    }
                });
            }
        }
    } catch (err) {
        console.error('❌ Auto-like failed:', err);
    }

    if (fromMe && !settings.allowSelfCommands && text.startsWith(prefix)) return;

    const senderName = msg.pushName || msg.key.participant || msg.key.remoteJid || 'Unknown';
    let groupName = '';
    if (isGroup && sock.groupMetadata) {
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            groupName = metadata.subject;
        } catch {
            groupName = '[Unknown Group]';
        }
    }

    const nameColored = chalk.yellow(senderName);
    const sourceInfo = isGroup ? chalk.blueBright(`👥 ${groupName}`) : (fromMe ? chalk.gray('🤖 Self Chat') : chalk.magenta('👤 Private Chat'));
    const messageColored = chalk.green(text);
    console.log(`💬 ${nameColored} (${sourceInfo}): ${messageColored}`);

    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    const senderJid = isGroup ? msg.key.participant || msg.participant : msg.key.remoteJid;
    const replyJid = isGroup ? msg.key.remoteJid : senderJid;

    let resolvedJid = senderJid;
    try {
        const resolved = await sock.onWhatsApp(senderJid);
        if (resolved?.[0]?.jid) resolvedJid = resolved[0].jid;
    } catch (err) {
        console.warn('⚠️ Could not resolve JID:', err);
    }

    const normalize = num => num.replace(/\D/g, '').replace(/^0+/, '');
    const normalizedSender = normalize(resolvedJid.split('@')[0]);

    const isBotOwner = [...dynamicOwners].some(owner => {
        const normOwner = normalize(owner.split('@')[0] || owner);
        return normalizedSender.endsWith(normOwner);
    });

    if (fromMe && !dynamicOwners.has(resolvedJid)) {
        dynamicOwners.add(resolvedJid);
        console.log(`🆕 Added ${resolvedJid} as dynamic owner`);
    }

    // Block non-owners if no session
    const sessionPath = path.join('sessions', 'cred.js');
    if (!fs.existsSync(sessionPath)) {
        await sock.sendMessage(replyJid, { text: `❌ *Access Denied*\n\nYour session is not active.` });
        return;
    }

    // Ban check
    const banPath = './data/banned.json';
    if (fs.existsSync(banPath)) {
        const banned = JSON.parse(fs.readFileSync(banPath));
        const userJid = isGroup ? msg.key.participant : msg.key.remoteJid;
        if (Array.isArray(banned) && banned.includes(userJid)) return;
    }

    console.log(chalk.cyan(`📥 ${commandName} called by ${senderName} (${normalizedSender}) on ${os.hostname()}`));

    // Auto typing
    if (isAutoTypingEnabled()) {
        await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Extract mentioned users
    const mentionedJid = (
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
        msg.message?.contextInfo?.mentionedJid ||
        []
    );

    // Reply helper
    async function sendReply(jid, replyText, extra = {}) {
        const tag = '\n\n— *BUGS-BOT support tech*';
        return sock.sendMessage(jid, { text: replyText + tag, ...extra });
    }

    try {
        // Restrict gcbroadcast
        if (commandName === 'gcbroadcast') {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const senderIsAdmin = metadata.participants?.find(p => p.id === resolvedJid && (p.admin === 'admin' || p.admin === 'superadmin'));
            if (!senderIsAdmin) {
                return sendReply(replyJid, '❌ *Only group admins can use this command.*');
            }
        }

        // ✅ Execute command with full context
        await command.execute(sock, msg, args, {
            senderJid,
            senderNumber: normalizedSender,
            isGroup,
            isBotOwner,
            replyJid,
            mentionedJid,
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

// Auto-react to statuses
export async function handleStatus(sock, msg) {
    if (msg.key.remoteJid === 'status@broadcast' && (isAutoLikeStatusEnabled() || isAutoViewStatusEnabled())) {
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
