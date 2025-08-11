import * as fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import fetch from 'node-fetch';
import settings from './settings.js';
import { isAutoLikeEnabled } from './commands/autolike.js';
import { isAutoReactEnabled, getRandomEmoji } from './data/features.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = new Map();

export const dynamicOwners = new Set(
  settings.botOwnerNumbers.map(num => num.replace(/\D/g, ''))
);

const dbPath = path.join('./data', 'database.json');
let database = {};
try {
  database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
} catch (e) {
  console.warn('⚠️ Failed to load database.json, using defaults');
  database = { autoreact: false, autostatusreact: false, owners: [], notifications: {} };
}

function isOwner(jid) {
  if (!jid) return false;
  const normalized = jid.replace(/\D/g, '');
  return (
    settings.botOwnerNumbers.some(n => n.replace(/\D/g, '') === normalized) ||
    database.owners.includes(normalized + '@s.whatsapp.net') ||
    dynamicOwners.has(normalized)
  );
}

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  if (command.name) {
    commands.set(command.name, command);
  }
}

// PRESENCE MAP to track users' online presence
const presenceMap = new Map();

// The 'sock' object should be passed into init or you should register this somewhere globally where 'sock' is available
// Here is an example you might add after sock is connected (adjust if needed):
// sock.ev.on('presence-update', update => {
//   presenceMap.set(update.id, update);
// });

export async function handleCommand(sock, msg) {
  // Listen presence updates here on first command for example (ensure you do this once in your app startup)
  if (!presenceMap.has('init')) {
    presenceMap.set('init', true);
    sock.ev.on('presence-update', update => {
      presenceMap.set(update.id, update);
    });
  }

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

  // Auto-react with emoji if enabled
  if (isAutoReactEnabled()) {
    const emoji = getRandomEmoji();
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: emoji,
          key: msg.key,
        },
      });
    } catch (e) {
      console.error('Auto-react error:', e);
    }
  }

  // Block self commands if configured
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

  // Removed chatbot global toggle block here

  // Parse command and args
  if (!text.startsWith(prefix)) return; // no prefix, no command

  const args = text.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const command = commands.get(commandName);
  if (!command) return;

  const rawSenderJid = isGroup ? msg.key.participant : (msg.key.fromMe ? sock.user.id : msg.key.remoteJid);
  let resolvedJid = rawSenderJid;
  try {
    const resolved = await sock.onWhatsApp(rawSenderJid);
    if (resolved?.[0]?.jid) {
      resolvedJid = resolved[0].jid;
    }
  } catch (err) {
    console.warn('⚠️ Could not resolve JID:', err);
  }

  const normalize = num => num.replace(/\D/g, '');
  const normalizedSender = normalize(resolvedJid);
  const isBotOwner =
    settings.botOwnerNumbers.some(n => normalize(n) === normalizedSender) ||
    database.owners.includes(resolvedJid) ||
    dynamicOwners.has(normalizedSender);

  if (fromMe && !dynamicOwners.has(normalizedSender)) {
    dynamicOwners.add(normalizedSender);
    console.log(`🆕 Added ${normalizedSender} as dynamic owner`);
  }

  const sessionPath = path.join('sessions', 'cred.js');
  if (!fs.existsSync(sessionPath)) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ *Access Denied*\n\nYour session is not active.`,
    });
    return;
  }

  const banPath = './data/banned.json';
  if (fs.existsSync(banPath)) {
    const banned = JSON.parse(fs.readFileSync(banPath));
    if (Array.isArray(banned) && banned.includes(resolvedJid)) return;
  }

  console.log(chalk.cyan(`📥 ${commandName} called by ${senderName} (${normalizedSender}) on ${os.hostname()}`));

  if (settings.autoTyping) {
    await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const mentionedJid = (
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.contextInfo?.mentionedJid ||
    []
  );

  if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    args.quoted = {
      key: {
        remoteJid: msg.message.extendedTextMessage.contextInfo.remoteJid || msg.key.remoteJid,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        fromMe: false,
        participant: msg.message.extendedTextMessage.contextInfo.participant
      },
      message: msg.message.extendedTextMessage.contextInfo.quotedMessage
    };
  }

  async function sendReply(replyText, extra = {}) {
    const jid = msg.key.remoteJid || msg.key.participant || msg.participant;
    const tag = '\n\n— *BUGS-BOT support tech*';

    try {
      return await sock.sendMessage(jid, { text: replyText + tag, ...extra });
    } catch (e) {
      console.error('❌ sendReply failed:', e);
    }
  }

  async function getName(jid) {
    try {
      const contacts = await sock.onWhatsApp(jid);
      if (contacts && contacts.length > 0) {
        return contacts[0].notify || contacts[0].vname || contacts[0].name || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    await command.execute(sock, msg, args, {
      senderJid: resolvedJid,
      senderNumber: normalizedSender,
      isGroup,
      isBotOwner,
      replyJid: msg.key.remoteJid,
      mentionedJid,
      sendReply,
      isOwner: isOwner(resolvedJid),
      getName,
      presenceMap,  // presence info for commands to use
    });
    console.log(chalk.greenBright(`✅ Command '${commandName}' executed successfully.`));
  } catch (err) {
    console.error(chalk.bgRed.white(`❌ Error executing ${commandName}:`), err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `⚠️ An error occurred while executing *${commandName}*.`
    }, {
      quoted: msg
    });
  }
}

export async function handleStatus(sock, msg) {
  if (msg.key.remoteJid === 'status@broadcast') {
    const senderJid = msg.key.participant || '';
    if (database.autostatusreact && isOwner(senderJid)) {
      try {
        const randomEmojis = ['❤️', '😂', '👍', '🔥', '😊', '😎', '💯', '🤖'];
        const reactEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        await sock.sendMessage('status@broadcast', {
          react: {
            text: reactEmoji,
            key: msg.key
          }
        });
        console.log(`✅ Auto-reacted to a status with ${reactEmoji}`);
      } catch (err) {
        console.error('❌ Failed to auto-react to status:', err);
      }
    }
  }
}

export async function handleGroupParticipantUpdate(sock, update) {
  const { id, participants, action } = update;
  if (!database.notifications?.[id]) return;

  const metadata = await sock.groupMetadata(id);
  const groupName = metadata.subject;
  const date = new Date().toLocaleString('en-GB');
  const memberCount = metadata.participants.length;

  for (const user of participants) {
    let userName = user;
    try {
      const [userData] = await sock.onWhatsApp(user);
      if (userData?.notify) userName = userData.notify;
    } catch {}

    const box = [
      '╭── 🎉 Group Notification',
      `│ 🏷️ Action: *${action === 'add' ? 'Join' : 'Leave'}*`,
      `│ 👤 User: @${user.replace(/[^0-9]/g, '')}`,
      `│ 📅 Date: ${date}`,
      `│ 👥 Group: ${groupName}`,
      `│ 🔢 Members: ${memberCount}`,
      '╰───────────────────────'
    ].join('\n');

    await sock.sendMessage(id, {
      text: box,
      mentions: [user]
    });
  }
}
