import fetch from 'node-fetch';

export default {
  name: 'translate',
  aliases: ['tl'],
  description: 'Translate text to a target language (e.g., .translate spanish hello)',
  category: 'general',
  usage: '.translate <target-language> <text>',
  async execute(m, { args, sendReply }) {
    if (args.length < 2) {
      return await sendReply('❌ Usage: `.translate <language> <text>`\nExample: `.translate french Hello world`');
    }

    const targetLang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    // Mapping of language names to ISO codes
    const langMap = {
      english: 'en',
      french: 'fr',
      spanish: 'es',
      german: 'de',
      italian: 'it',
      portuguese: 'pt',
      russian: 'ru',
      chinese: 'zh',
      arabic: 'ar',
      japanese: 'ja',
      hindi: 'hi',
    };

    const langCode = langMap[targetLang];
    if (!langCode) {
      return await sendReply(`❌ Unsupported language: *${targetLang}*\nTry: english, french, spanish, german, etc.`);
    }

    try {
      const res = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: langCode,
          format: 'text'
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to translate. Status: ${res.status}`);
      }

      const json = await res.json();
      const translated = json.translatedText;

      await sendReply(`🌐 Translated to *${targetLang}*:\n\`\`\`${translated}\`\`\``);
    } catch (err) {
      console.error(err);
      await sendReply(`⚠️ Translation failed.\nReason: ${err.message}`);
    }
  }
};
