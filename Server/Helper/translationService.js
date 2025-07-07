import axios from 'axios';

// Free translation service using Google Translate API
const GOOGLE_TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';

export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  try {
    const response = await axios.get(GOOGLE_TRANSLATE_API_URL, {
      params: {
        client: 'gtx',
        sl: sourceLanguage,
        tl: targetLanguage,
        dt: 't',
        q: text
      }
    });

    if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
      return {
        translatedText: response.data[0][0][0],
        detectedLanguage: response.data[2] || sourceLanguage
      };
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error.message);
    throw new Error('Translation service unavailable');
  }
};

// Common language codes
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'mk': 'Macedonian',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'mt': 'Maltese',
  'ga': 'Irish',
  'cy': 'Welsh',
  'is': 'Icelandic',
  'fa': 'Persian',
  'he': 'Hebrew',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'kn': 'Kannada',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'my': 'Myanmar',
  'km': 'Khmer',
  'lo': 'Lao',
  'ka': 'Georgian',
  'am': 'Amharic',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  'eu': 'Basque',
  'gl': 'Galician',
  'ca': 'Catalan',
  'co': 'Corsican',
  'eo': 'Esperanto',
  'fy': 'Frisian',
  'haw': 'Hawaiian',
  'hmn': 'Hmong',
  'ig': 'Igbo',
  'jw': 'Javanese',
  'ku': 'Kurdish',
  'la': 'Latin',
  'lb': 'Luxembourgish',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'mi': 'Maori',
  'mn': 'Mongolian',
  'ny': 'Chichewa',
  'ps': 'Pashto',
  'sm': 'Samoan',
  'gd': 'Scottish Gaelic',
  'sn': 'Shona',
  'so': 'Somali',
  'st': 'Sesotho',
  'su': 'Sundanese',
  'tg': 'Tajik',
  'tt': 'Tatar',
  'uz': 'Uzbek',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba'
};

// Detect language from text
export const detectLanguage = async (text) => {
  try {
    const response = await axios.get(GOOGLE_TRANSLATE_API_URL, {
      params: {
        client: 'gtx',
        sl: 'auto',
        tl: 'en',
        dt: 't',
        q: text
      }
    });

    if (response.data && response.data[2]) {
      return response.data[2];
    }
    
    return 'en'; // Default to English if detection fails
  } catch (error) {
    console.error('Language detection error:', error.message);
    return 'en'; // Default to English
  }
};
