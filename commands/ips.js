import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'ips';
export const description = 'Get IP info from an IP address';
export const usage = '.ips <ip_address>';

export async function execute(sock, msg, args) {
  const ip = args[0];
  if (!ip) return sendReply(sock, msg, '❌ Usage: .ips <ip_address>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/ipstalk?apikey=gifted&address=${encodeURIComponent(ip)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.result) {
      return sendReply(sock, msg, `❌ No data found for IP: ${ip}`);
    }

    const r = data.result;
    const replyText = `
╭━━〔 🌐 IP INFO 〕━━⬣
┃🆔 IP Address: ${r.ip}
┃🌍 Country: ${r.country} (${r.countryCode})
┃🏙 Region: ${r.region}
┃🏢 City: ${r.city}
┃🗺 Continent: ${r.continent} (${r.continentCode})
┃📮 Postal Code: ${r.postal}
┃🕒 Timezone: ${r.timezone}
┃📡 ASN: ${r.asn}
┃🏢 AS Name: ${r.asName}
┃🌐 AS Domain: ${r.asDomain}
┃🏛 Organization: ${r.org}
┃📍 Location: ${r.loc}
╰━━━⊰ BUGS BOT ⊱━━━━⬣
    `.trim();

    await sendReply(sock, msg, replyText);
  } catch (err) {
    console.error('IPS command error:', err);
    return sendReply(sock, msg, '⚠️ Error fetching IP info. Please try again later.');
  }
}
