const router = require('express').Router();

const publicPages = ['/'];
const llmsTxt = `# This is a test heading for llms.txt`;

function getSiteOrigin() {
  if (!process.env.DOMAIN) {
    throw new Error('DOMAIN is missing.');
  }

  const siteUrl = new URL(process.env.DOMAIN);
  if (
    !['http:', 'https:'].includes(siteUrl.protocol)
    || !siteUrl.hostname
    || siteUrl.username
    || siteUrl.password
  ) {
    throw new Error('DOMAIN must be an absolute HTTP(S) URL without credentials.');
  }

  return siteUrl.origin;
}

function getConfiguredOrigin(res, resourceName) {
  try {
    return getSiteOrigin();
  } catch (error) {
    console.error(`Unable to serve ${resourceName}:`, error.message);
    res.status(500).type('text/plain').send('The site URL is not configured correctly.');
    return null;
  }
}

router.get('/llms.txt', (req, res) => {
  res.type('text/plain').send(llmsTxt);
});

router.get('/sitemap.xml', (req, res) => {
  const origin = getConfiguredOrigin(res, 'sitemap');
  if (!origin) return;

  const urls = publicPages
    .map((page) => `  <url><loc>${new URL(page, origin).href}</loc></url>`)
    .join('\n');

  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

router.get('/robots.txt', (req, res) => {
  const origin = getConfiguredOrigin(res, 'robots.txt');
  if (!origin) return;

  res
    .type('text/plain')
    .send(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${origin}/sitemap.xml\n`);
});

module.exports = router;
