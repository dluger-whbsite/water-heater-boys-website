import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'blog-review/approved-blog-handoff.md'), 'utf8').replace(/\r\n/g, '\n');
const destination = path.join(root, 'site/src/content/blog');
fs.mkdirSync(destination, {recursive: true});

const articles = [
  {number: 19, slug: 'my-water-heater-is-leaking-what-should-i-do'},
  {number: 15, slug: 'signs-your-water-heater-is-failing'},
  {number: 18, slug: 'tankless-vs-traditional-water-heater-which-is-better-for-my-home'},
  {number: 12, slug: 'why-choosing-a-professional-water-heater-over-big-box-stores-saves-you-money'},
  {number: 10, slug: 'understanding-tankless-heater-pricing-factors-influencing-installation-costs'},
  {number: 7, slug: 'is-it-time-to-replace-your-toilet-here-s-why-upgrading-makes-sense'},
  {number: 14, slug: 'essential-safety-devices-for-your-home'},
  {number: 5, slug: 'sewer-line-repair-in-the-bay-area'},
  {number: 3, slug: 'thinking-about-a-heat-pump-water-heater-here-s-what-bay-area-homeowners-should-know-before-replacin'},
  {number: 2, slug: 'should-you-install-an-electric-tankless-water-heater'},
  {number: 9, slug: 'is-california-banning-gas-water-heaters', heading: 'Articles #9 and #17'},
  {number: 1, slug: 'what-bay-area-property-managers-should-know-about-the-2027-water-heater-rules'},
  {number: 8, slug: 'water-heater-replacement-cost-in-the-bay-area-what-to-expect-and-how-to-save'},
];

for (let index = 0; index < articles.length; index++) {
  const item = articles[index];
  const anchor = `# ${item.heading ?? `Article #${item.number}`}\n`;
  const start = source.indexOf(anchor);
  if (start < 0) throw new Error(`Missing approved article ${item.number}`);
  const end = source.indexOf('\n---\n', start);
  if (end < 0) throw new Error(`Missing separator after article ${item.number}`);
  const section = source.slice(start + anchor.length, end);
  const titleMatch = section.match(/^# (.+)$/m);
  if (!titleMatch) throw new Error(`Missing article title ${item.number}`);
  const body = section.slice(section.indexOf(titleMatch[0])).trim();
  if ((body.match(/^# /gm) ?? []).length !== 1) throw new Error(`Unexpected H1 count for article ${item.number}`);
  const title = titleMatch[1];
  const description = body.split('\n').find(line => line.trim() && !line.startsWith('#'))?.trim() ?? title;
  const frontmatter = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nnumber: ${item.number}\n---\n\n`;
  fs.writeFileSync(path.join(destination, `${item.slug}.md`), `${frontmatter}${body}\n`);
}

const files = fs.readdirSync(destination).filter(name => name.endsWith('.md'));
if (files.length !== articles.length) throw new Error(`Expected ${articles.length} articles, found ${files.length}`);
console.log(`Imported ${files.length} approved articles without changing the article bodies.`);
