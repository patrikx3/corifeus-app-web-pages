import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'corifeus.com',
    'www.corifeus.com',
    'localhost',
    '127.0.0.1',
  ],
});

const CANONICAL_HOST = 'https://corifeus.com';
const REPO_API_URL = 'https://network.corifeus.com/public/api/repo';
const SITEMAP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let sitemapCache: { body: string; builtAt: number } | null = null;

async function fetchReposForSitemap(): Promise<any> {
  const response = await fetch(REPO_API_URL, {
    headers: { 'accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Repo API returned ${response.status}`);
  }
  const data: any = await response.json();
  return data.repo || {};
}

function buildSitemap(repos: Record<string, any>): string {
  const now = new Date();
  const nowIso = now.toISOString();

  const urls: string[] = [];
  urls.push(`  <url>
    <loc>${CANONICAL_HOST}/</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  urls.push(`  <url>
    <loc>${CANONICAL_HOST}/matrix</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

  const xmlEscape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  for (const key of Object.keys(repos)) {
    const pkg = repos[key];
    const repoName = pkg?.corifeus?.reponame;
    if (!repoName) continue;
    if (repoName === 'corifeus') continue;

    const timeStamp = pkg?.corifeus?.['time-stamp'];
    let lastmod = nowIso;
    if (timeStamp) {
      const d = new Date(timeStamp);
      if (!isNaN(d.getTime())) {
        lastmod = d.toISOString();
      }
    }
    const escapedRepo = encodeURIComponent(repoName);
    const priority = (pkg?.corifeus?.stargazers_count ?? 0) > 100 ? '0.9' : '0.7';

    urls.push(`  <url>
    <loc>${CANONICAL_HOST}/${escapedRepo}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);

    // Also index any documented sub-pages declared in the package's menu.
    const menu: any[] = Array.isArray(pkg?.corifeus?.menu) ? pkg.corifeus.menu : [];
    for (const item of menu) {
      const link: string | undefined = item?.link;
      if (!link) continue;
      if (/^https?:\/\//i.test(link)) continue; // skip external links
      const cleanLink = link.startsWith('/') ? link.slice(1) : link;
      urls.push(`  <url>
    <loc>${CANONICAL_HOST}/${escapedRepo}/${xmlEscape(cleanLink)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>
`;
}

app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const now = Date.now();
    if (!sitemapCache || now - sitemapCache.builtAt > SITEMAP_TTL_MS) {
      const repos = await fetchReposForSitemap();
      const body = buildSitemap(repos);
      sitemapCache = { body, builtAt: now };
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.send(sitemapCache.body);
  } catch (error) {
    next(error);
  }
});

let manifestCache: { body: string; builtAt: number } | null = null;
const MANIFEST_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

app.get('/manifest.webmanifest', async (_req, res, next) => {
  try {
    const now = Date.now();
    if (!manifestCache || now - manifestCache.builtAt > MANIFEST_TTL_MS) {
      const repos = await fetchReposForSitemap();
      const sorted = Object.values(repos)
        .filter((pkg: any) => pkg?.corifeus?.reponame && pkg.corifeus.reponame !== 'corifeus')
        .sort((a: any, b: any) =>
          (b?.corifeus?.stargazers_count ?? 0) - (a?.corifeus?.stargazers_count ?? 0));

      const shortcuts = sorted.map((pkg: any) => {
        const repoName = pkg.corifeus.reponame;
        const prefix = pkg.corifeus.prefix;
        const shortName = prefix ? pkg.name.substr(prefix.length) : pkg.name;
        return {
          name: pkg.description || shortName,
          short_name: shortName,
          description: pkg.description || `${shortName} by Corifeus`,
          url: `/${repoName}`,
          icons: [{ src: 'assets/favicon.ico', sizes: '48x48', type: 'image/x-icon' }],
        };
      });

      shortcuts.unshift({
        name: 'Corifeus Matrix',
        short_name: 'Matrix',
        description: 'Browse all Corifeus open source packages',
        url: '/matrix',
        icons: [{ src: 'assets/favicon.ico', sizes: '48x48', type: 'image/x-icon' }],
      });

      const manifest = {
        name: 'Corifeus App Web Pages',
        short_name: 'Corifeus',
        description: 'Open source documentation portal for Angular, Node.js packages and developer tools',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#1b5e20',
        lang: 'en',
        dir: 'ltr',
        categories: ['developer', 'productivity', 'utilities'],
        icons: [
          { src: 'assets/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
        ],
        shortcuts,
      };

      manifestCache = {
        body: JSON.stringify(manifest, null, 2),
        builtAt: now,
      };
    }
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.send(manifestCache.body);
  } catch (error) {
    next(error);
  }
});

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${CANONICAL_HOST}/sitemap.xml
`);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4444;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
