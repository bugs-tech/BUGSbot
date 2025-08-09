import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'wcs';
export const description = 'Get WhatsApp Channel info';
export const usage = '.wcs <channel URL>';

export async function execute(sock, msg, args) {
  const url = args.join(' ').trim();
  if (!url) return sendReply(sock, msg, '❌ Usage: .wcs <WhatsApp channel URL>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/wachannel?apikey=gifted&url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result) return sendReply(sock, msg, '❌ Could not find info for that WhatsApp channel.');

    const channel = data.result;

    const boxedReply = `
┌─❒ *WhatsApp Channel Info*
│
├─ *Followers:* ${channel.followers || 'N/A'}
├─ *Description:* ${channel.description || 'No description'}
└───────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: channel.img }
    });

  } catch (err) {
    console.error('[WCS ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to fetch WhatsApp channel info. Please try again later.');
  }
}
