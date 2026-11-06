const router = require('express').Router();
const path = require('node:path');
const sharp = require('sharp');



router.get('/', async (req, res) => {

  const canonicalUrl = process.env.DOMAIN
    ? new URL('/', process.env.DOMAIN).href
    : null;

  const siteOrigin = canonicalUrl ? new URL(canonicalUrl).origin : null;

  const description = 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  
  
  
  const ogmetaData = siteOrigin
    ? JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'idk',
          url: siteOrigin,
          publisher: { '@id': `${siteOrigin}/#organization` }
        },
        {
          '@type': 'Organization',
          '@id': `${siteOrigin}/#organization`,
          name: 'idk',
          url: siteOrigin,
          logo: new URL('/images/logo.webp', siteOrigin).href
        },
        {
          '@type': 'idk',
          name: 'idk',
          description,
          url: siteOrigin,
          image: new URL('/images/placeholder', siteOrigin).href
        }
      ]
    }).replace(/</g, '\\u003c')
    : null;
  res.render('content/index', { canonicalUrl, ogmetaData});
  console.log(`Rendered Index Successfully to Client ${req.headers['cf-connecting-ip']}📄✅`);
});

module.exports = router;