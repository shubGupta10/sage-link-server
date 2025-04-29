import axios from "axios";

export async function translateToEnglish(text) {
    try {
      const res = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'auto',
        target: 'en',
        format: 'text',
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data.translatedText;
    } catch (err) {
      console.error("Translation error:", err);
      return text; // fallback to original if translation fails
    }
  }