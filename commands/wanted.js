import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { botOwnerNumbers } from '../settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: 'wanted',
  description: 'Create a wanted poster of a user',
  category: 'fun',

  async execute(sock, msg, args, sendReply) {
    console.log('⚠️ .wanted command triggered');

    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderId = senderJid.split('@')[0];

    // Check if bot owner or group admin
    let isGroupAdmin = false;
    if (isGroup) {
      try {
        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        isGroupAdmin = admins.includes(senderJid);
      } catch {
        isGroupAdmin = false;
      }
    }

    const isBotOwner = botOwnerNumbers.map(num => num.replace(/\D/g, '')).includes(senderId);

    if (!isBotOwner && (!isGroup || !isGroupAdmin)) {
      await sendReply(msg, '❌ This command is only for group admins or bot owners.');
      return;
    }

    // 📌 Target user logic
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.key.participant ||
      msg.key.remoteJid;

    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(target, 'image');
    } catch {
      ppUrl = 'https://i.imgur.com/5QjMcNT.png'; // fallback image
    }

    try {
      const profileImage = await Jimp.read(ppUrl);
      const wantedTemplate = await Jimp.read(path.join(__dirname, '../media/wanted.png'));

      // Resize and center the profile image
      const profileSize = 300;
      profileImage.resize(profileSize, profileSize);
      const x = (wantedTemplate.bitmap.width - profileSize) / 2;
      const y = 220;
      wantedTemplate.composite(profileImage, x, y);

      // Fonts and text
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
      const targetNumber = target.split('@')[0];
      wantedTemplate.print(font, 10, wantedTemplate.getHeight() - 30, 'powered by BUGS-BOT');
      wantedTemplate.print(font, x, y + profileSize + 10, `@${targetNumber}`);

      // Temp path
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const outputPath = path.join(tempDir, `wanted_${Date.now()}.jpg`);
      await wantedTemplate.writeAsync(outputPath);

      const imageBuffer = fs.readFileSync(outputPath);

      await sock.sendMessage(msg.key.remoteJid, {
        image: imageBuffer,
        caption: '🚨 WANTED!',
      }, { quoted: msg });

      try {
        fs.unlinkSync(outputPath); // Cleanup
      } catch (e) {
        console.warn('⚠️ Could not delete temp file:', e.message);
      }

      console.log('✅ .wanted poster sent');
    } catch (err) {
      console.error('❌ Error in .wanted command:', err);
      await sendReply(msg, '❌ Failed to create wanted poster.');
    }
  },
};
