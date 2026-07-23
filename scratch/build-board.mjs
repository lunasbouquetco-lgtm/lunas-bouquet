import { readFileSync, writeFileSync } from 'node:fs';

const b64 = (p, mime) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;

let html = readFileSync('brand-board.html', 'utf8');

const map = {
  __LOGO__: b64('logo-sm.png', 'image/png'),
  __HERO__: b64('hero-sm.jpg', 'image/jpeg'),
  __MCQUEEN__: b64('mcqueen-sm.jpg', 'image/jpeg'),
  __F_CORMORANT__: b64('cormorant.woff2', 'font/woff2'),
  __F_CORMORANT6__: b64('cormorant600.woff2', 'font/woff2'),
  __F_PLAYFAIR__: b64('playfair.woff2', 'font/woff2'),
  __F_FRAUNCES__: b64('fraunces.woff2', 'font/woff2'),
  __F_JOST__: b64('jost.woff2', 'font/woff2'),
  __F_JOST5__: b64('jost500.woff2', 'font/woff2'),
};

for (const [k, v] of Object.entries(map)) html = html.replaceAll(k, v);

writeFileSync('brand-board.built.html', html);
console.log('built brand-board.built.html', (html.length / 1024 / 1024).toFixed(2), 'MB');
