const router = require('express').Router();
const sharp = require('sharp');
const path = require('node:path');

const imagesDir = path.join(__dirname, '../public/images/');
const responsiveWidths = new Set([256, 480, 960, 1600]);

router.get('/:name/resize/:width', async (req, res) => {
  const imageName = req.params.name;
  const width = Number(req.params.width);
  if (!/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(imageName) || !responsiveWidths.has(width)) {
    return res.sendStatus(400);
  }

  try {
    const image = await sharp(path.join(imagesDir, imageName))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400'
    });
    return res.send(image);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Unable to resize image ${imageName}:`, error);
    }
    return res.sendStatus(error.code === 'ENOENT' ? 404 : 500);
  }
});

router.get('/:name/placeholder', async (req, res) => {
  try {
    // Restrict names to image files in the public image directory.
    const imageName = req.params.name;
    if (!/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(imageName)) {
      return res.sendStatus(400);
    }

    const imagePath = path.join(imagesDir, imageName);
    console.log(imagePath);
    const placeholder = await sharp(imagePath)
      .resize({ width: 256, withoutEnlargement: true })
      .blur(2)
      .webp({ quality: 50 })
      .toBuffer();

    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable'
    });

    return res.send(placeholder);
  } catch (err) {
    return res.sendStatus(404);
  }
});

module.exports = router;