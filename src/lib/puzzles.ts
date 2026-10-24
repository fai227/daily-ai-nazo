import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const puzzleUrl = (date: string) => href(date.replaceAll('-', '/') + '/');
export async function publishedPuzzles() {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const all = await getCollection('puzzles');
  const dates = all.map(p => p.data.date);
  if (new Set(dates).size !== dates.length) throw new Error('Duplicate puzzle date');
  for (const p of all) {
    if (p.id !== p.data.date) throw new Error('JSON filename must match date');
    if (!existsSync(`public${p.data.image}`)) throw new Error(`Missing image: ${p.data.date}`);
    if (p.data.date > today) throw new Error('Keep future drafts outside the public repository');
  }
  if (!all.length) throw new Error('No published puzzles');
  return all.sort((a,b) => b.data.date.localeCompare(a.data.date));
}
