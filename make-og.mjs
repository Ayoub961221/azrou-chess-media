import { chromium } from "playwright";
import fs from "node:fs";
/**
 * يولّد بطاقة المشاركة (og:image) بنفس هوية الموقع.
 * 1200×630 — المقاس المعتمد في واتساب وفيسبوك وتويتر.
 *
 *   node make-og.mjs   →   public/og-image.png
 */

const logo = fs.readFileSync("src/assets/club-logo.png").toString("base64");

const html = `<!doctype html>
<html dir="rtl" lang="ar"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=IBM+Plex+Sans+Arabic:wght@500;700&family=Noto+Sans+Tifinagh&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{position:relative;
       background:linear-gradient(155deg,#0d3570 0%,#09264f 48%,#061c3b 100%);
       font-family:"IBM Plex Sans Arabic",sans-serif;color:#fff}

  /* نقشة رقعة الشطرنج */
  .board{position:absolute;inset:0;opacity:.07;
    background-image:
      linear-gradient(45deg,#fff 25%,transparent 25%),
      linear-gradient(-45deg,#fff 25%,transparent 25%),
      linear-gradient(45deg,transparent 75%,#fff 75%),
      linear-gradient(-45deg,transparent 75%,#fff 75%);
    background-size:96px 96px;
    background-position:0 0,0 48px,48px -48px,-48px 0;
    -webkit-mask-image:linear-gradient(to bottom left,#000,transparent 72%)}

  .ring{position:absolute;border-radius:50%;border:1px solid rgba(198,161,78,.22)}
  .r1{width:460px;height:460px;top:-170px;left:-130px}
  .r2{width:300px;height:300px;top:-90px;left:-50px;border-color:rgba(255,255,255,.07)}

  /* شريط ذهبي علوي */
  .bar{position:absolute;top:0;right:0;left:0;height:7px;
       background:linear-gradient(to left,#e2cc96,#c6a14e 45%,transparent)}

  .wrap{position:relative;width:1200px;height:630px;display:flex;
        align-items:center;justify-content:center;gap:48px;padding:0 72px}

  .logo{width:196px;height:auto;flex:0 0 196px;
        filter:drop-shadow(0 18px 34px rgba(0,0,0,.45))}

  .divider{width:2px;height:260px;flex:0 0 2px;border-radius:2px;
    background:linear-gradient(to bottom,transparent,rgba(198,161,78,.9),transparent)}

  .txt{flex:0 1 auto;min-width:0}
  .ar{font-size:56px;font-weight:700;line-height:1.32;letter-spacing:-.5px}
  .fr{font-family:"Cormorant Garamond",serif;font-size:37px;
      color:#e2cc96;margin-top:12px;direction:ltr;text-align:right}
  .tif{font-family:"Noto Sans Tifinagh",sans-serif;font-size:25px;
       color:rgba(255,255,255,.62);direction:ltr;unicode-bidi:isolate}

  .meta{display:flex;align-items:center;justify-content:flex-start;gap:15px;margin-top:28px}
  .chip{display:inline-flex;align-items:center;gap:10px;
        border:1px solid rgba(198,161,78,.45);background:rgba(255,255,255,.07);
        border-radius:999px;padding:11px 24px;font-size:23px;font-weight:500}
  .dot{width:9px;height:9px;background:#c6a14e;transform:rotate(45deg)}
  .dash{width:34px;height:1px;background:rgba(198,161,78,.5)}
</style></head>
<body>
  <div class="board"></div>
  <div class="ring r1"></div><div class="ring r2"></div>
  <div class="bar"></div>

  <div class="wrap">
    <img class="logo" src="data:image/png;base64,${logo}">
    <div class="divider"></div>
    <div class="txt">
      <div class="ar">النادي الرياضي لأزرو للشطرنج</div>
      <div class="fr">Club Azrou Sportif d’Échecs</div>
      <div class="meta">
        <span class="tif">ⴰⵣⵔⵓ</span>
        <span class="dash"></span>
        <span class="chip"><span class="dot"></span>أزرو · المغرب</span>
      </div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: "public/og-image.png" });
await browser.close();

const kb = Math.round(fs.statSync("public/og-image.png").size / 1024);
console.log(`✓ public/og-image.png — 1200×630، ${kb} KB`);
