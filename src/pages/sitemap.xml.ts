/*
 * sitemap.xml maison (docs/stack.md § 6), tiré de la liste des pages : une dépendance de moins
 * que @astrojs/sitemap pour 7 adresses. Il ne contredit pas le noindex : le sitemap aide un robot
 * à trouver les pages, le noindex lui interdit de les indexer.
 */
import type { APIRoute } from 'astro';
import { pages } from '../data/navigation';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` manque dans astro.config.mjs');
  const adresses = pages.map(({ href }) => `  <url><loc>${new URL(href, site).href}</loc></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...adresses,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
