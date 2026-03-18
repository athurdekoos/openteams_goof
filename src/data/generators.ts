import { SeededPRNG } from '../prng';
import { FIRST_NAMES, LAST_NAMES, COMPANY_WORDS, COMPANY_SUFFIXES, STATUSES, CATEGORIES, DOMAINS } from './word-lists';

export function genFullName(prng: SeededPRNG): string {
  return `${prng.pick(FIRST_NAMES)} ${prng.pick(LAST_NAMES)}`;
}

export function genCompanyName(prng: SeededPRNG): string {
  const word1 = prng.pick(COMPANY_WORDS);
  const word2 = prng.pick(COMPANY_WORDS);
  const suffix = prng.pick(COMPANY_SUFFIXES);
  return `${word1}${word2} ${suffix}`;
}

export function genEmail(prng: SeededPRNG, name: string): string {
  const parts = name.toLowerCase().split(' ');
  const domain = prng.pick(DOMAINS);
  const sep = prng.next() > 0.5 ? '.' : '_';
  return `${parts[0]}${sep}${parts[1]}@${domain}`;
}

export function genPrice(prng: SeededPRNG): number {
  return Math.round(prng.next() * 99999) / 100;
}

export function genDateString(prng: SeededPRNG): string {
  const year = prng.nextInt(2020, 2027);
  const month = prng.nextInt(1, 13);
  const day = prng.nextInt(1, 29);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function genStatus(prng: SeededPRNG): string {
  return prng.pick(STATUSES);
}

export function genCategory(prng: SeededPRNG): string {
  return prng.pick(CATEGORIES);
}

export function genImagePlaceholder(prng: SeededPRNG, size = 24): string {
  const hue = prng.nextInt(0, 360);
  const letter = String.fromCharCode(65 + prng.nextInt(0, 26));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="4" fill="hsl(${hue},60%,50%)"/>
    <text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="white" font-size="${size * 0.5}" font-family="sans-serif">${letter}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function genUrl(prng: SeededPRNG, companyName: string): string {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const domain = prng.pick(DOMAINS);
  return `https://${slug}.${domain}`;
}

export interface RecordRow {
  id: number;
  name: string;
  company: string;
  email: string;
  status: string;
  category: string;
  price: number;
  date: string;
  image: string;
  website: string;
}

export function genRecord(prng: SeededPRNG, id: number): RecordRow {
  const name = genFullName(prng);
  const company = genCompanyName(prng);
  return {
    id,
    name,
    company,
    email: genEmail(prng, name),
    status: genStatus(prng),
    category: genCategory(prng),
    price: genPrice(prng),
    date: genDateString(prng),
    image: genImagePlaceholder(prng),
    website: genUrl(prng, company),
  };
}
