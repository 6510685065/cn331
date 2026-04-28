const THAI_PROFANITY_TERMS = [
  "กู",
  "มึง",
  "มรึง",
  "มุง",
  "เสือก",
  "เสือกไร",
  "เสือกมาก",
  "เสือกสัส",
  "สัส",
  "ไอสัส",
  "อิสัส",
  "เหี้ย",
  "เชี่ย",
  "เชี้ย",
  "เฮี้ย",
  "ควย",
  "ไอควย",
  "หี",
  "หำ",
  "เย็ด",
  "เอาแม่ง",
  "แม่ง",
  "โง่ฉิบหาย",
  "ฉิบหาย",
  "ชิบหาย",
  "ชห",
  "เวร",
  "ไอเวร",
  "ระยำ",
  "สารเลว",
  "ชั่ว",
  "จัญไร",
  "ส้นตีน",
  "ตีน",
  "เหี้ยไร",
  "เหี้ยอะ",
  "โคตรเหี้ย",
  "เยด",
  "เยดแม่",
  "เย็ดแม่",
  "แม่เย็ด",
  "พ่อมึง",
  "แม่มึง",
  "ลูกกะหรี่",
  "อีกะหรี่",
  "กะหรี่",
  "ดอกทอง",
  "อีกระหรี่",
  "ชาติหมา",
  "ควาย",
  "ไอควาย",
  "อีควาย",
  "ควายเอ๊ย",
  "ไอ้โง่",
  "อีโง่",
  "ไอ้บ้า",
  "อีบ้า",
  "ไอ้ห่า",
  "อีห่า",
  "ห่า",
  "หน้าหี",
  "หน้าควย",
  "หน้าตัวเมีย",
  "ไอ้สัตว์",
  "อีสัตว์",
  "สัตว์นรก",
  "ชั่วช้า",
  "เลว",
  "ไอ้เลว",
  "อีเลว",
  "ต่ำ",
  "ต่ำช้า",
  "อัปรีย์",
  "ถ่อย",
  "ไอ้ถ่อย",
  "อีถ่อย",
  "เงี่ยน",
  "หื่น",
  "คันหี",
  "คันควย",
  "อมควย",
  "ดูดควย",
  "เลียหี",
  "แทงหี",
  "เย็ดสด",
  "คลิปหลุด",
  "ขายตัว",
];

const ENGLISH_PROFANITY_TERMS = [
  "fuck",
  "fucking",
  "motherfucker",
  "mf",
  "wtf",
  "shit",
  "bullshit",
  "shithead",
  "ass",
  "asshole",
  "dick",
  "dickhead",
  "cock",
  "cunt",
  "bitch",
  "son of a bitch",
  "bastard",
  "slut",
  "whore",
  "hoe",
  "retard",
  "retarded",
  "moron",
  "idiot",
  "stupid ass",
  "dumbass",
  "jackass",
  "pussy",
  "jerk off",
  "jerkoff",
  "blowjob",
  "handjob",
  "rimjob",
  "tit",
  "tits",
  "boobs",
  "penis",
  "vagina",
  "porn",
  "porno",
  "nude",
  "nudes",
  "naked pic",
  "sext",
  "sexting",
  "cum",
  "jizz",
  "anal",
  "rape",
  "rapist",
  "kill yourself",
  "kys",
  "die bitch",
  "stfu",
  "fu",
  "f u",
  "fck",
  "fuk",
  "fk",
  "suck my dick",
  "suck dick",
  "eat shit",
  "piece of shit",
  "trash human",
];

const HARASSMENT_AND_HATE_TERMS = [
  "ไอ้ดำ",
  "อีดำ",
  "ไอ้เตี้ย",
  "อีอ้วน",
  "ไอ้พิการ",
  "ไอ้ตุ๊ด",
  "อีตุ๊ด",
  "กระเทยควาย",
  "เกย์ว่ะ",
  "ฆ่าตัวตาย",
  "ไปตาย",
  "ตายไปซะ",
  "มึงควรตาย",
  "มึงไปตาย",
  "เดี๋ยวฆ่า",
  "จะฆ่า",
  "ข่มขืน",
  "ลวนลาม",
  "เด็กเอ็น",
  "อีสลัม",
  "ล้างบาง",
  "เผ่าพันธุ์ต่ำ",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "tranny",
  "chink",
  "spic",
  "gook",
  "terrorist pig",
  "kill them all",
  "gas the",
  "rape her",
  "rape him",
];

const SPAM_AND_SCAM_TERMS = [
  "เครดิตฟรี",
  "โปรฝากถอน",
  "ปั่นสล็อต",
  "พนันออนไลน์",
  "บาคาร่า",
  "หวยออนไลน์",
  "กดลิงก์นี้",
  "คลิกด่วน",
  "สมัครตอนนี้",
  "ทักแชทด่วน",
  "แอดไลน์",
  "แอด line",
  "รับงานง่าย",
  "รายได้วันละ",
  "งานออนไลน์ได้เงินจริง",
  "ลงทุนวันนี้",
  "ผลตอบแทนสูง",
  "ปล่อยกู้",
  "buy now",
  "click here",
  "limited offer",
  "guaranteed profit",
  "double your money",
  "telegram investment",
  "crypto signal",
  "easy money",
  "casino",
  "slot",
  "bet now",
];

const NORMALIZATION_MAP = {
  "@": "a",
  "$": "s",
  "€": "e",
  "£": "l",
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "!": "i",
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLoose(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[@$€£013457!]/g, (char) => NORMALIZATION_MAP[char] || char);
}

function normalizeCompact(text) {
  return normalizeLoose(text).replace(/[^a-zก-๙]/g, "");
}

function hasSpacedVariant(source, term) {
  if (!/[a-z]/i.test(term)) {
    return false;
  }

  const letters = term.replace(/[^a-z]/gi, "").split("").map(escapeRegex);
  if (letters.length < 3) {
    return false;
  }

  const pattern = letters.join("[\\s._-]*");
  return new RegExp(pattern, "i").test(source);
}

function scanTerms(text, category, terms) {
  const raw = normalizeLoose(text);
  const compact = normalizeCompact(text);
  const matches = [];

  for (const term of terms) {
    const normalizedTerm = normalizeLoose(term);
    const compactTerm = normalizeCompact(term);

    if (!compactTerm) {
      continue;
    }

    if (
      raw.includes(normalizedTerm) ||
      compact.includes(compactTerm) ||
      hasSpacedVariant(raw, normalizedTerm)
    ) {
      matches.push({
        category,
        term,
      });
    }
  }

  return matches;
}

export function findBlockedTerms(text) {
  return [
    ...scanTerms(text, "profanity", THAI_PROFANITY_TERMS),
    ...scanTerms(text, "profanity", ENGLISH_PROFANITY_TERMS),
    ...scanTerms(text, "harassment", HARASSMENT_AND_HATE_TERMS),
    ...scanTerms(text, "spam", SPAM_AND_SCAM_TERMS),
  ];
}

export function checkBlockedTerms(text) {
  const matches = findBlockedTerms(text);
  const categories = new Set(matches.map((match) => match.category));

  return {
    blocked: matches.length > 0,
    matches,
    containsProfanity: categories.has("profanity") || categories.has("harassment"),
    containsSpam: categories.has("spam"),
  };
}

