// Store graphics: Google Play phone and 7"/10" tablet screenshots plus the feature graphic (1024×500), App Store
// iPhone/iPad screenshots and creative assets. Adapted from BSG Companion's store-graphics.mjs.
// Captures the real app (production build) in headless Chrome with a sample game loaded, then frames each screen
// with a headline in the app's look: the night sky of the icon, cream art-nouveau rules, Federant and EB Garamond.
// Output: store/google-play/ and store/app-store/ (24-bit, no alpha, sRGB, as the stores require).
//
// Run: npm run store   (builds first)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const PORT = 4318;
const DEBUG_PORT = 9334;
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => existsSync(p));
if (!CHROME) throw new Error("Chrome or Edge not found");
if (!existsSync("dist/index.html")) throw new Error("Run `npm run build` first");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fileUrl = (p) => pathToFileURL(resolve(p)).href;

// The icon's colours
const NIGHT = "#141a36";
const SKY = "#2c3d72";
const GLOW = "#2f7f8f";
const CREAM = "#efe4c4";

// ---------- sample game ----------
const config = {
  abyss: true,
  noCultist: false,
  preludes: true,
  preludeCounts: { day: 1, twilight: 1, night: 1 },
  preludeExcluded: [],
};
const cast = ["keilani-tatupu", "william-bowleg", "beatrice-sharpe", "ida-lawrence", "kokoj-fernandes"];
const setupState = {
  version: 1,
  config,
  phase: "setup",
  titles: {},
  awakened: false,
  activations: ["motherHydra", "deepOnes"],
  preludeDraw: ["outpace", "valuable-lessons", "emergence"],
  log: [],
  players: cast.map((characterId, seat) => ({ seat, characterId, revealed: false, brig: false })),
};
const playingState = {
  ...setupState,
  phase: "playing",
  // Keilani went to the Brig, so the Captain title passed down the line to Beatrice; Kokoj revealed.
  players: setupState.players.map((p) =>
    p.characterId === "keilani-tatupu" ? { ...p, brig: true } : p.characterId === "kokoj-fernandes" ? { ...p, revealed: true } : p,
  ),
  titles: { captain: 2, keeper: 1 },
  log: ["Captain: Keilani", "Keeper of the Tome: William", "Keilani moved to the Brig", "Captain: Keilani → Beatrice", "Kokoj revealed as a traitor"],
};

// ---------- the scenes ----------
// `prepare` runs in the page after navigation; it may scroll. Mostly lavender paper, one screen on mint.
// Scroll an element to just under the sticky header; `extra` is the space left between them. (Rule anchors
// already leave room for the header and search bar through their scroll margin, so they take a negative extra.)
const header = `parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0`;
const scrollTo = (selector, extra) =>
  `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'start'}); window.scrollBy(0,-(${header} + ${extra}));`;
const scenes = [
  {
    id: "01-setup", state: setupState, route: "#/setup", theme: "lavender",
    title: "Set up any voyage", sub: "Characters, the loyalty deck and the starting titles",
    prepare: `[...document.querySelectorAll('.card h2')].find(h => h.textContent.startsWith('Characters'))?.closest('.card')?.scrollIntoView({block:'start'}); window.scrollBy(0,-(${header} + 14));`,
  },
  {
    id: "02-roles", state: playingState, route: "#/roles", theme: "lavender",
    title: "Track every title", sub: "Captain and Keeper of the Tome, passed down the line",
  },
  {
    id: "03-dice", state: playingState, route: "#/dice", theme: "mint",
    title: "Every roll at a glance", sub: "The attack table for the eight-sided die",
  },
  {
    id: "04-monsters", state: playingState, route: "#/monsters", theme: "lavender",
    title: "What the monsters do", sub: "Tap the icons on the mythos card you drew",
    prepare: scrollTo(".sequence", 12),
  },
  {
    id: "05-preludes", state: setupState, route: "#/setup", theme: "lavender",
    title: "Draw your preludes", sub: "Day, twilight and night, shuffled for you",
    // .drawn-wrap leaves room for the header through its own scroll margin
    prepare: `document.querySelector('.drawn-wrap')?.scrollIntoView({block:'start'});`,
  },
  {
    id: "06-rules", state: playingState, route: "#/rules", theme: "lavender",
    title: "The rules on demand", sub: "Searchable, with From the Abyss built in",
    prepare: `await new Promise(r => setTimeout(r, 400)); document.getElementById('rule-3.4')?.scrollIntoView({block:'start'});`,
  },
];

// ---------- stores and devices ----------
// view = the CSS viewport the app is rendered at (× scale = capture pixels); W×H = the final image.
const TARGETS = [
  // Google Play phone: 360×640 @3 → 1080×1920
  { prefix: "phone", out: "store/google-play", W: 1080, H: 1920, maxWidth: 0.8, device: "phone",
    view: { w: 360, h: 640, scale: 3, mobile: true } },
  // Google Play 7" tablet: 9:16, 1080×1920 (600 px wide tablet @1.8)
  { prefix: "tablet7", out: "store/google-play/tablet-7", W: 1080, H: 1920, maxWidth: 0.82, device: "tablet",
    view: { w: 600, h: 1067, scale: 1.8, mobile: true } },
  // Google Play 10" tablet: 9:16, 1440×2560 (800 px wide tablet @1.8)
  { prefix: "tablet10", out: "store/google-play/tablet-10", W: 1440, H: 2560, maxWidth: 0.82, device: "tablet",
    view: { w: 800, h: 1422, scale: 1.8, mobile: true } },
  // App Store iPhone 6.1"/6.3" slot: 1179×2556 (iPhone 393×852 @3)
  { prefix: "iphone", out: "store/app-store/iphone-6.3", W: 1179, H: 2556, maxWidth: 0.8, device: "phone", jpg: true,
    view: { w: 393, h: 852, scale: 3, mobile: true } },
  // App Store iPad 13" slot: 2048×2732 (iPad 1024×1366 @2)
  { prefix: "ipad", out: "store/app-store/ipad-13", W: 2048, H: 2732, maxWidth: 0.82, device: "tablet", jpg: true,
    view: { w: 1024, h: 1366, scale: 2, mobile: false } },
];

// ---------- headless Chrome over the DevTools protocol ----------
const profile = mkdtempSync(join(tmpdir(), "unf-store-"));
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
});
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files", "about:blank",
], { stdio: "ignore" });

async function waitFor(url) {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(url); if (r.ok) return r; } catch { /* not up yet */ }
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

let ws, msgId = 0;
const pending = new Map();
function send(method, params = {}) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}
async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression: `(async () => { ${expression} })()`, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description ?? ""));
  return r.result?.value;
}
async function settle() {
  // Lazy images below the fold never load, so cap the wait instead of waiting for every image.
  await evaluate(`await document.fonts.ready;
    const pending = [...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise(r => setTimeout(r, 2500))]);`);
  await sleep(400);
}
/** Capture the viewport. PNG always; JPG too for App Store slots (some uploads only accept it). */
async function shot(path, { width, height, scale }, jpg = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: scale > 1 });
  await sleep(150);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  // Play wants 24-bit images without transparency; App Store Connect can refuse images without an sRGB profile.
  const img = () => sharp(Buffer.from(data, "base64")).flatten({ background: NIGHT }).removeAlpha().withMetadata({ icc: "srgb", density: 72 });
  const files = [[path, await img().png({ compressionLevel: 9 }).toBuffer()]];
  if (jpg) files.push([path.replace(/\.png$/, ".jpg"), await img().jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer()]);
  for (const [file, buf] of files) {
    // On Windows another process (preview pane, antivirus) can briefly hold the file; retry instead of failing.
    for (let attempt = 1; ; attempt++) {
      try {
        writeFileSync(file, buf);
        break;
      } catch (e) {
        if (attempt >= 6) throw e;
        await sleep(500 * attempt);
      }
    }
  }
}

try {
  await waitFor(`http://localhost:${PORT}/`);
  await waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const target = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");

  // Shared: the app's own fonts, the night-sky backdrop, the art-nouveau rule and the frame template.
  const font = (pkg, file) => fileUrl(`node_modules/@fontsource/${pkg}/files/${file}`);
  const fontsCss = `
    @font-face { font-family: Federant; src: url(${font("federant", "federant-latin-400-normal.woff2")}); }
    @font-face { font-family: "EB Garamond"; font-weight: 400; src: url(${font("eb-garamond", "eb-garamond-latin-400-normal.woff2")}); }
    @font-face { font-family: "EB Garamond"; font-weight: 400; font-style: italic; src: url(${font("eb-garamond", "eb-garamond-latin-400-italic.woff2")}); }
    @font-face { font-family: "EB Garamond"; font-weight: 600; src: url(${font("eb-garamond", "eb-garamond-latin-600-normal.woff2")}); }`;
  const backdrop = `
    background:
      radial-gradient(ellipse at 50% 22%, ${GLOW}55, transparent 55%),
      radial-gradient(ellipse at 50% 40%, ${SKY}, ${NIGHT} 78%);`;
  /** A cream rule that runs out into whiplash curls at both ends, like the box's frame. */
  const rule = (w, h, stroke) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="${CREAM}"
      stroke-width="${stroke}" stroke-linecap="round">
      <path d="M${h * 1.2},${h / 2} L${w - h * 1.2},${h / 2}"/>
      <path d="M${h * 1.2},${h / 2} C${h * 0.6},${h / 2} ${h * 0.15},${h * 0.35} ${h * 0.2},${h * 0.15} C${h * 0.25},${h * -0.05} ${h * 0.6},${h * 0.02} ${h * 0.5},${h * 0.3}"/>
      <path d="M${w - h * 1.2},${h / 2} C${w - h * 0.6},${h / 2} ${w - h * 0.15},${h * 0.35} ${w - h * 0.2},${h * 0.15} C${w - h * 0.25},${h * -0.05} ${w - h * 0.6},${h * 0.02} ${w - h * 0.5},${h * 0.3}"/>
    </svg>`;
  const tpl = join(profile, "tpl.html");

  /** Store screenshot: headline between two cream rules on top, the app screen in a device frame below. */
  const frameHtml = (t, s, imgUrl) => {
    const k = t.W / 1080; // the design was made for 1080 px wide
    const headerTop = 96 * k, headerH = 270 * k;
    const areaTop = headerTop + headerH + 28 * k;
    const avail = t.H - areaTop - 34 * k;
    const aspect = t.view.w / t.view.h;
    const fw = Math.min(t.W * t.maxWidth, avail * aspect);
    const fh = fw / aspect;
    const top = areaTop + (avail - fh) / 2;
    const r = (t.device === "tablet" ? 34 : 54) * k;
    const rw = Math.round(t.W - 140 * k);
    return `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}
      * { box-sizing: border-box; margin: 0; }
      body { width: ${t.W}px; height: ${t.H}px; overflow: hidden; position: relative; ${backdrop} color: ${CREAM}; }
      header { position: absolute; top: ${headerTop}px; left: ${70 * k}px; right: ${70 * k}px; height: ${headerH}px; display: flex;
               flex-direction: column; justify-content: center; align-items: center; gap: ${16 * k}px; text-align: center; }
      h1 { font: 400 ${86 * k}px/1.05 Federant, serif; letter-spacing: 0.04em; text-transform: uppercase; -webkit-text-stroke: ${1.2 * k}px ${CREAM}; }
      p { font: italic 400 ${44 * k}px/1.2 "EB Garamond", serif; color: #cfd8ea; }
      .device { position: absolute; top: ${top}px; left: ${(t.W - fw) / 2}px; width: ${fw}px; height: ${fh}px;
                border-radius: ${r}px; padding: ${14 * k}px; background: #0b1024;
                box-shadow: 0 0 0 ${3 * k}px ${CREAM}cc, 0 ${30 * k}px ${80 * k}px rgba(0,0,0,0.6), 0 0 ${90 * k}px ${GLOW}44; }
      .device img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: ${r - 12 * k}px; display: block; }
    </style></head><body>
      <header>${rule(rw, 34 * k, 4 * k)}<h1>${s.title}</h1><p>${s.sub}</p>${rule(rw, 34 * k, 4 * k)}</header>
      <div class="device"><img src="${imgUrl}"></div>
    </body></html>`;
  };

  // 1+2. per store/device: capture the app at that device's size, then frame it with a headline
  for (const t of TARGETS) {
    mkdirSync(t.out, { recursive: true });
    const raw = join(profile, `raw-${t.prefix}`);
    mkdirSync(raw);
    for (const s of scenes) {
      await send("Emulation.setDeviceMetricsOverride", { width: t.view.w, height: t.view.h, deviceScaleFactor: t.view.scale, mobile: t.view.mobile });
      await send("Page.navigate", { url: `http://localhost:${PORT}/` });
      await sleep(600);
      await evaluate(`localStorage.setItem('unf-companion-state-v1', ${JSON.stringify(JSON.stringify(s.state))});
        localStorage.setItem('unf-theme', '${s.theme}'); location.hash = '${s.route}';`);
      await send("Page.reload");
      await sleep(1000);
      await settle();
      if (s.prepare) { await evaluate(s.prepare); await settle(); }
      await shot(join(raw, `${s.id}.png`), { width: t.view.w, height: t.view.h, scale: t.view.scale });
    }
    console.log(`captured ${scenes.length} screens for ${t.prefix}`);

    for (const s of scenes) {
      writeFileSync(tpl, frameHtml(t, s, fileUrl(join(raw, `${s.id}.png`))));
      await send("Emulation.setDeviceMetricsOverride", { width: t.W, height: t.H, deviceScaleFactor: 1, mobile: false });
      await send("Page.navigate", { url: fileUrl(tpl) });
      await sleep(500);
      await settle();
      await shot(join(t.out, `${t.prefix}-${s.id}.png`), { width: t.W, height: t.H, scale: 1 }, t.jpg);
    }
    console.log(`wrote ${scenes.length} screenshots to ${t.out}/ (${t.W}x${t.H})`);
  }

  // 2b. App Store creative assets (product page header, search results, 16:9), built from the iPhone captures.
  // Specs: images without alpha; header 3840×1646 (21:9), search results 3840×2560 (3:2), 16:9 5244×2950.
  // Key content is kept centred so device-specific cropping can't cut it.
  const icon = fileUrl("assets/icon-1024.png");
  {
    const out = "store/app-store/creative";
    mkdirSync(out, { recursive: true });
    const iphoneRaw = (id) => fileUrl(join(profile, "raw-iphone", `${id}.png`));
    const page = (W, H, css, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}
      * { box-sizing: border-box; margin: 0; }
      body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; color: ${CREAM}; ${backdrop} }
      .phone { border-radius: 7.5% / 3.5%; padding: 1.4%; background: #0b1024; overflow: hidden;
               box-shadow: 0 0 0 6px ${CREAM}cc, 0 40px 110px rgba(0,0,0,0.65), 0 0 140px ${GLOW}44; }
      .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 6.5% / 3%; display: block; }
      .icon { border-radius: 18%; box-shadow: 0 30px 70px rgba(0,0,0,0.6); }
      h1 { font-family: Federant, serif; font-weight: 400; letter-spacing: 0.05em; text-transform: uppercase; -webkit-text-stroke: 3px ${CREAM}; }
      p { font-family: "EB Garamond", serif; font-style: italic; color: #cfd8ea; }
      ${css}</style></head><body>${body}</body></html>`;
    const phone = (id, w) => `<div class="phone" style="width:${w}px;height:${(w * 852) / 393}px"><img src="${iphoneRaw(id)}"></div>`;

    const creatives = [
      {
        // Product page header: one clear idea – the brand – centred.
        file: "header-21x9-3840x1646.png", W: 3840, H: 1646,
        html: page(3840, 1646, `
          .wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 140px; }
          .icon { width: 960px; height: 960px; }
          h1 { font-size: 210px; line-height: 1; }
          .rule { margin: 40px 0 34px; }
          p { font-size: 100px; }`,
          `<div class="wrap"><img class="icon" src="${icon}"><div><h1>Unfathomable<br>Companion</h1>
           <div class="rule">${rule(1700, 70, 8)}</div><p>Your guide aboard the Atlantica</p></div></div>`),
      },
      {
        // Search results: show the real interface.
        file: "search-results-3x2-3840x2560.png", W: 3840, H: 2560,
        html: page(3840, 2560, `
          header { position: absolute; top: 110px; left: 0; right: 0; text-align: center; }
          h1 { font-size: 170px; line-height: 1; }
          header p { margin-top: 26px; font-size: 92px; }
          .row { position: absolute; top: 560px; left: 0; right: 0; display: flex; justify-content: center; gap: 140px; }`,
          `<header><h1>Roles, dice &amp; monsters</h1><p>The Unfathomable companion for your table</p></header>
           <div class="row">${phone("02-roles", 880)}${phone("04-monsters", 880)}${phone("06-rules", 880)}</div>`),
      },
      {
        // 16:9 version: brand on the left, the interface on the right.
        file: "universal-16x9-5244x2950.png", W: 5244, H: 2950,
        html: page(5244, 2950, `
          .brand { position: absolute; left: 360px; top: 0; bottom: 0; width: 2150px; display: flex; flex-direction: column;
                   justify-content: center; }
          .icon { width: 1000px; height: 1000px; margin-bottom: 80px; }
          h1 { font-size: 230px; line-height: 1; }
          .rule { margin: 46px 0 40px; }
          p { font-size: 110px; }
          .row { position: absolute; right: 360px; top: 200px; display: flex; gap: 130px; }`,
          `<div class="brand"><img class="icon" src="${icon}"><h1>Unfathomable<br>Companion</h1>
           <div class="rule">${rule(1900, 76, 9)}</div><p>Your guide aboard the Atlantica</p></div>
           <div class="row">${phone("02-roles", 1150)}${phone("04-monsters", 1150)}</div>`),
      },
    ];

    for (const c of creatives) {
      writeFileSync(tpl, c.html);
      await send("Emulation.setDeviceMetricsOverride", { width: c.W, height: c.H, deviceScaleFactor: 1, mobile: false });
      await send("Page.navigate", { url: fileUrl(tpl) });
      await sleep(800);
      await settle();
      await shot(join(out, c.file), { width: c.W, height: c.H, scale: 1 });
      console.log("wrote", `${out}/${c.file}`);
    }
  }

  // 3. Google Play feature graphic 1024×500
  writeFileSync(tpl, `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}
    * { box-sizing: border-box; margin: 0; }
    body { width: 1024px; height: 500px; overflow: hidden; position: relative; color: ${CREAM};
           background: radial-gradient(circle at 22% 50%, ${GLOW}66, transparent 45%), linear-gradient(110deg, ${SKY} 0%, ${NIGHT} 65%); }
    .icon { position: absolute; left: 48px; top: 60px; width: 380px; height: 380px; border-radius: 18%;
            box-shadow: 0 18px 40px rgba(0,0,0,0.6); }
    .text { position: absolute; left: 470px; right: 36px; top: 96px; }
    h1 { font: 400 54px/1.05 Federant, serif; letter-spacing: 0.03em; text-transform: uppercase; -webkit-text-stroke: 1px ${CREAM}; }
    .rule { margin: 16px 0 14px; }
    p { font: italic 400 31px/1.2 "EB Garamond", serif; color: #cfd8ea; }
    small { display: block; margin-top: 16px; font: 400 19px/1.3 "EB Garamond", serif; color: #9aa6c4; }
  </style></head><body>
    <img class="icon" src="${icon}">
    <div class="text">
      <h1>Unfathomable<br>Companion</h1>
      <div class="rule">${rule(500, 26, 3)}</div>
      <p>Setup, titles, dice, monsters and rules, at your table.</p>
      <small>Unofficial fan-made helper for the board game Unfathomable</small>
    </div>
  </body></html>`);
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 500, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: fileUrl(tpl) });
  await sleep(500);
  await settle();
  mkdirSync("store/google-play", { recursive: true });
  await shot("store/google-play/feature-graphic.png", { width: 1024, height: 500, scale: 1 });
  console.log("wrote store/google-play/feature-graphic.png");
} finally {
  ws?.close();
  chrome.kill();
  server.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold files briefly */ }
}
