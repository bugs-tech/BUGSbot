import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'npms';
export const description = 'Get info about an NPM package';
export const usage = '.npms <package name>';

export async function execute(sock, msg, args) {
  const packageName = args.join(' ').trim();
  if (!packageName) return sendReply(sock, msg, '❌ Usage: .npms <package name>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/npmstalk?apikey=gifted&packagename=${encodeURIComponent(packageName)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result || !data.result.name) {
      return sendReply(sock, msg, `❌ No info found for npm package *${packageName}*`);
    }

    const pkg = data.result;

    const boxedReply = `
┌─❒ *NPM Package Info*
│
├─ *Name:* ${pkg.name}
├─ *Description:* ${pkg.description || 'N/A'}
├─ *Version:* ${pkg.version}
├─ *Owner:* ${pkg.owner || 'N/A'}
├─ *License:* ${pkg.license || 'N/A'}
├─ *Published:* ${pkg.publishedDate || 'N/A'}
├─ *Keywords:* ${pkg.keywords?.join(', ') || 'N/A'}
├─ *Package Link:* ${pkg.packageLink ? `[Link](${pkg.packageLink})` : 'N/A'}
└─────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, { 
      // optional: add buttons or media here if needed
    });

  } catch (err) {
    console.error('[NPMS ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to fetch npm package info. Please try again later.');
  }
}
