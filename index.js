// index.js

import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";
import pino from "pino";
import { handleCommand } from "./handler.js";

const authFolder = "./auth";

// 📁 Load Anti-Link settings
const antiLinkPath = './data/antilink.json';
let antiLinkData = fs.existsSync(antiLinkPath)
    ? JSON.parse(fs.readFileSync(antiLinkPath, 'utf-8'))
    : {};

// 📁 Load Welcome Message settings
const welcomePath = './data/welcome.json';
let welcomeData = fs.existsSync(welcomePath)
    ? JSON.parse(fs.readFileSync(welcomePath, 'utf-8'))
    : {};

async function startBot() {
    // ✅ Auth and version setup
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    // 🔌 Create socket connection
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        syncFullHistory: false
    });

    // 📩 Handle incoming messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        let text = '';

        // 🔎 Extract message text from possible formats
        if (msg.message?.conversation) text = msg.message.conversation;
        else if (msg.message?.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
        else if (msg.message?.imageMessage?.caption) text = msg.message.imageMessage.caption;
        else if (msg.message?.videoMessage?.caption) text = msg.message.videoMessage.caption;
        else if (msg.message?.documentMessage?.caption) text = msg.message.documentMessage.caption;
        else text = '';

        // 🚫 Check for anti-link (only in group)
        if (isGroup && antiLinkData[msg.key.remoteJid]) {
            const linkRegex = /https?:\/\/[^\s]+/gi;
            if (linkRegex.test(text) && !msg.key.fromMe) {
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `🚫 *Link detected!* Message removed.`,
                        quoted: msg
                    });

                    await sock.sendMessage(msg.key.remoteJid, {
                        delete: {
                            remoteJid: msg.key.remoteJid,
                            fromMe: false,
                            id: msg.key.id,
                            participant: msg.key.participant
                        }
                    });

                    console.log(`🚷 Deleted link message in ${msg.key.remoteJid}`);
                    return; // Skip command handling if message is deleted
                } catch (err) {
                    console.error("❌ Failed to delete message:", err);
                }
            }
        }

        // 🖨 Log the sender info
        console.log(`📨 Message from ${msg.key.remoteJid}`);

        // ⚙️ Execute the command
        await handleCommand(sock, msg);
    });

    // 💾 Auto-save updated credentials
    sock.ev.on("creds.update", saveCreds);

    // 🆕 Handle new participants join for welcome
    sock.ev.on("group-participants.update", async (update) => {
        const groupId = update.id;

        // 🚫 Skip if no welcome message is set
        if (!welcomeData[groupId]) return;
        if (!update.participants || update.action !== 'add') return;

        for (const user of update.participants) {
            const tag = `@${user.split('@')[0]}`;
            const message = welcomeData[groupId].replace(/@user/gi, tag);

            await sock.sendMessage(groupId, {
                text: message,
                mentions: [user]
            });

            console.log(`👋 Sent welcome to ${tag}`);
        }
    });

    // 🔁 Handle QR, reconnection, session
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const qrcode = await import("qrcode-terminal");
            qrcode.default.generate(qr, { small: true });
            console.log("📲 Scan the QR code above to pair WhatsApp");
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom &&
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);

            console.log("⚠️ Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Bot connected successfully");

            // 📦 Export session once
            const sessionPath = path.join("sessions", "cred.js");
            if (!fs.existsSync(sessionPath)) {
                const credsPath = path.join(authFolder, "creds.json");

                if (fs.existsSync(credsPath)) {
                    const credsData = fs.readFileSync(credsPath);
                    fs.writeFileSync(sessionPath, credsData);

                    const me = sock.user.id;
                    await sock.sendMessage(me, {
                        document: { url: sessionPath },
                        mimetype: "application/json",
                        fileName: "cred.js",
                        caption: `✅ *Your session file*\n\n⚠️ *Don't share this file with anyone.*\n\nTo reuse the bot, upload this file into:\n📁 sessions/cred.js`
                    });

                    console.log("📤 Sent session cred.js file to:", me);
                } else {
                    console.warn("❌ Could not find Baileys creds.json");
                }
            }
        }
    });
}

// 🚀 Start the bot
startBot();
