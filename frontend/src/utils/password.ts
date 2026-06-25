// Avoids visually ambiguous characters (O/0, l/1/I) for passwords people read aloud.
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%*?';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

/** Generates a strong, readable random password with mixed character classes. */
export function generatePassword(length = 14): string {
  const required = [
    LOWER[randomInt(LOWER.length)],
    UPPER[randomInt(UPPER.length)],
    DIGITS[randomInt(DIGITS.length)],
    SYMBOLS[randomInt(SYMBOLS.length)],
  ];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => ALL[randomInt(ALL.length)]);
  const chars = [...required, ...rest];
  // Fisher–Yates shuffle so the required characters aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
