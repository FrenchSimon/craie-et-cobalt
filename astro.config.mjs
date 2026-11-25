// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Adresse de production : sert aux URL absolues d'Open Graph, du lien canonique, du JSON-LD et du sitemap.
  site: 'https://craie-et-cobalt.vercel.app',
  // URL courtes sans barre finale : /realisations, servi par dist/realisations.html
  // (Vercel : cleanUrls et trailingSlash: false).
  trailingSlash: 'never',
  // HTML compressé sans supprimer les espaces entre éléments en ligne
  // (le mode 'jsx' collerait des mots lus par les lecteurs d'écran).
  compressHTML: true,
  build: {
    format: 'file',
    // CSS toujours en fichiers externes : la CSP interdit les styles en ligne.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Aucun fichier transformé en URI data: ni script mis en ligne (CSP).
      assetsInlineLimit: 0,
    },
  },
});
