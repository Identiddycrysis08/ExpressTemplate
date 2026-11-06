require('dotenv').config();



const express = require('express');
const compression = require('compression');
const path = require('path');
const nodeCache = require('node-cache');

const indexRouter = require('./routes/index-route.js');
const imageRouter = require('./routes/images.js');
const seoRouter = require('./routes/seo-route.js');

const app = express();
const port = 8080;
const publicDirectory = path.join(__dirname, 'public');

//app.set('trust proxy', '172.22.0.0/16'); only applicable with caddy container


const cache = new nodeCache({ stdTTL: 300, useClones: false });

app.use((req, res, next) => {
    //console.log('Express IP:', req.ip);
    //console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
    console.log(`Request From ${req.headers['cf-connecting-ip']} for ${req.path}`)
    next();
});

//app.get('/debug-ip', (req, res) => {
//    res.json({
//        expressIp: req.ip,
//        socketIp: req.socket.remoteAddress,
//        forwardedFor: req.headers['x-forwarded-for'],
//        realIp: req.headers['x-real-ip'],
//        cloudflareIp: req.headers['cf-connecting-ip']
//    });
//});


const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.path;
    const cachedResponse = req.method === 'GET' ? cache.get(key) : undefined;

    if (cachedResponse) {
      console.log(`Image cache hit: ${key} 🖼️✅`);
      res.set(cachedResponse.headers);
      return res.status(cachedResponse.statusCode).send(cachedResponse.body);
    }

    console.log(`Image cache miss: ${key} 🖼️🟨`);
    const originalSend = res.send;
    res.send = function (body) {
      if (req.method === 'GET' && this.statusCode >= 200 && this.statusCode < 300 &&
          (Buffer.isBuffer(body) || typeof body === 'string')) {
        cache.set(key, {
          body: Buffer.isBuffer(body) ? Buffer.from(body) : body,
          headers: this.getHeaders(),
          statusCode: this.statusCode
        }, duration);
      }

      return originalSend.call(this, body);
    };

    next();
  };
};






app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(compression());

app.use((req, res, next) => {
    res.set({
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src 'self'",
      "script-src-elem 'self' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://cloudflareinsights.com",
      "frame-src https://maps.google.com https://www.google.com",
    ].join('; '),
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
  });
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000');
  }
  next();
});

const siteOrigin = process.env.DOMAIN ? new URL(process.env.DOMAIN).origin : null;
app.use((req, res, next) => {
  if (siteOrigin) {
    const pathname = req.path.replace(/\/+$/, '') || '/';
    res.locals.ogUrl = new URL(pathname, siteOrigin).href;
    res.locals.ogImage = new URL('/images/IMG_4557.webp', siteOrigin).href;
  }
  next();
});
app.use('/images', cacheMiddleware(6000), imageRouter);
app.use('/images', express.static(path.join(publicDirectory, 'images'), { maxAge: '1d' }));
app.use(express.static(publicDirectory));
app.use(express.json());


app.use('/', indexRouter);
app.use(seoRouter);






app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`http://127.0.0.1:${port}`);
});
