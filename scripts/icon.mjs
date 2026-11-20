// App icon: Mother Hydra's head, drawn in flat shapes in the board game's colours, inside a cream
// art-nouveau frame like the one on the game box. Builds assets/icon.svg and renders every icon
// size into public/ with sharp. Run with `npm run app-icon`.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const C = {
  night: "#141a36", // box sky, deep
  sky: "#2c3d72", // box sky, light
  glow: "#2f7f8f", // sea-teal mist behind the head
  cream: "#efe4c4", // frame and lettering on the box
  skin: "#86c3c9", // Hydra, lit
  skinMid: "#4f98a6",
  skinDark: "#24596a", // Hydra, shadow
  mouth: "#5a1430",
  gum: "#d76f93",
  tooth: "#fbf6e6",
  eye: "#f6e7a8",
};

// ---------- Mother Hydra ----------

/** Rows of needle teeth along the lip curves (quadratic Béziers), pointing into the mouth. */
function teeth(p0, c, p1, n, length, dir) {
  const at = (t) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t ** 2 * p1[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t ** 2 * p1[1],
  ];
  let d = "";
  for (let i = 0; i < n; i++) {
    const t0 = 0.06 + (0.88 * i) / n;
    const t1 = 0.06 + (0.88 * (i + 1)) / n;
    const [ax, ay] = at(t0);
    const [bx, by] = at(t1);
    const mid = (t0 + t1) / 2;
    const [mx, my] = at(mid);
    // longer teeth towards the middle, short ones at the corners
    const len = length * (0.55 + 0.45 * Math.sin(Math.PI * mid));
    d += `M${ax.toFixed(1)},${ay.toFixed(1)} L${mx.toFixed(1)},${(my + dir * len).toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)} Z `;
  }
  return d;
}

/** The crest: spikes fanned along an arc over the head, tallest in the middle, tips hooked back. */
function crest({ cx, cy, rx, ry, n, from, to, length, width, hook }) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180; // 0 = straight up
    const centre = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); // 1 in the middle, 0 at the ends
    const len = length * (0.55 + 0.45 * centre);
    const bx = cx + rx * Math.sin(a);
    const by = cy - ry * Math.cos(a);
    const ux = Math.sin(a);
    const uy = -Math.cos(a);
    const px = -uy; // perpendicular
    const py = ux;
    const w = width * (0.75 + 0.25 * centre);
    const tipx = bx + ux * len + px * hook * Math.sign(a || 0.0001) * -1;
    const tipy = by + uy * len;
    const lx = bx - px * w;
    const ly = by - py * w;
    const r2x = bx + px * w;
    const r2y = by + py * w;
    // slightly concave sides, so the spikes read as horns rather than triangles
    const c1x = (lx + tipx) / 2 + px * w * 0.25;
    const c1y = (ly + tipy) / 2 + py * w * 0.25;
    const c2x = (r2x + tipx) / 2 - px * w * 0.25;
    const c2y = (r2y + tipy) / 2 - py * w * 0.25;
    d += `M${lx.toFixed(1)},${ly.toFixed(1)} Q${c1x.toFixed(1)},${c1y.toFixed(1)} ${tipx.toFixed(1)},${tipy.toFixed(1)} Q${c2x.toFixed(1)},${c2y.toFixed(1)} ${r2x.toFixed(1)},${r2y.toFixed(1)} Z `;
  }
  return d;
}

/** A shape outlined once around its whole silhouette: the outline is drawn underneath, then the fill. */
const outlined = (d, fill, width = 16) =>
  `<path fill="${C.night}" stroke="${C.night}" stroke-width="${width}" stroke-linejoin="round" d="${d}"/><path fill="${fill}" d="${d}"/>`;

/**
 * A tentacle: a filled shape along a chain of cubic Béziers, `w0` wide at the root narrowing to `w1`
 * at the tip, so it tapers instead of ending in a blunt stroke.
 */
function tentacle(segments, w0, w1) {
  const pts = [];
  segments.forEach(([p0, c1, c2, p3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= 24; i++) {
      const t = i / 24;
      const u = 1 - t;
      pts.push([
        u ** 3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p3[0],
        u ** 3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p3[1],
      ]);
    }
  });
  const left = [];
  const right = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = i / (pts.length - 1);
    const w = (w0 + (w1 - w0) * Math.pow(k, 0.8)) / 2;
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  });
  const f = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  return `M${left.map(f).join(" L")} L${right.reverse().map(f).join(" L")} Z`;
}

/** Horn spikes at given bases: [x, y, angle from vertical (deg, negative leans left), length, width]. */
function spikes(m, list) {
  return list
    .map(([x, y, deg, len, w]) => {
      // mirror the base point (and with it the lean) through m, then build the horn
      const [[bx, by]] = m([[x, y]])[0];
      const lean = bx === x ? deg : -deg;
      const a = (lean * Math.PI) / 180;
      const ux = Math.sin(a);
      const uy = -Math.cos(a);
      const px = -uy;
      const py = ux;
      const tip = [bx + ux * len, by + uy * len];
      const l = [bx - px * w, by - py * w];
      const r = [bx + px * w, by + py * w];
      const c1 = [(l[0] + tip[0]) / 2 + px * w * 0.25, (l[1] + tip[1]) / 2 + py * w * 0.25];
      const c2 = [(r[0] + tip[0]) / 2 - px * w * 0.25, (r[1] + tip[1]) / 2 - py * w * 0.25];
      const f = ([X, Y]) => `${X.toFixed(1)},${Y.toFixed(1)}`;
      return `M${f(l)} Q${f(c1)} ${f(tip)} Q${f(c2)} ${f(r)} Z`;
    })
    .join(" ");
}

/** Draw something on the left side and mirrored on the right: `draw` gets a function that maps its segments. */
const both = (draw) => {
  const same = (...segs) => segs;
  const mirror = (...segs) => segs.map((seg) => seg.map(([x, y]) => [1024 - x, y]));
  return draw(same) + draw(mirror);
};

const hydra = `
  <!-- back row of the crest, in shadow -->
  ${outlined(crest({ cx: 512, cy: 570, rx: 215, ry: 175, n: 9, from: -58, to: 58, length: 215, width: 46, hook: 0 }), C.skinMid)}
  <!-- front row -->
  ${outlined(crest({ cx: 512, cy: 570, rx: 165, ry: 150, n: 7, from: -50, to: 50, length: 160, width: 44, hook: 0 }), C.skin)}

  <!-- spikes along the shoulders, behind the body so only the horns show -->
  ${both((m) => outlined(spikes(m, [[150, 760, -58, 92, 36], [206, 700, -46, 118, 42], [270, 656, -32, 132, 44]]), C.skinMid, 14))}
  <!-- head running straight into broad, hunched shoulders -->
  <path fill="${C.skinMid}" stroke="${C.night}" stroke-width="10" stroke-linejoin="round" d="M70,900 C96,770 186,690 290,640 C282,492 384,402 512,398 C640,402 742,492 734,640 C838,690 928,770 954,900 Z"/>
  <!-- light along the top of the shoulders -->
  <path fill="none" stroke="${C.skin}" stroke-width="12" stroke-linecap="round" opacity="0.7" d="M150,790 C190,730 240,690 290,664 M874,790 C834,730 784,690 734,664"/>
  <!-- lit face -->
  <path fill="${C.skin}" d="M290,604 C290,488 392,428 512,426 C632,428 734,488 734,604 C730,734 642,830 512,838 C382,830 294,734 290,604 Z"/>
  <!-- forehead ridges -->
  <path fill="none" stroke="${C.skinMid}" stroke-width="12" stroke-linecap="round" d="M418,466 Q512,446 606,466 M396,496 Q512,472 628,496"/>

  <!-- one heavy brow ridge in a scowling V, down to the snout -->
  <path fill="${C.skinDark}" d="M316,508 C394,480 468,504 508,590 L516,590 C556,504 630,480 708,508 L702,542 C640,520 578,540 536,612 L488,612 C446,540 384,520 322,542 Z"/>
  <!-- shaded pouches under the eyes -->
  <path fill="${C.skinMid}" d="M360,572 C390,616 450,622 482,590 C470,640 380,644 360,572 Z"/>
  <path fill="${C.skinMid}" d="M664,572 C634,616 574,622 542,590 C554,640 644,644 664,572 Z"/>
  <!-- small deep-set eyes with slit pupils -->
  <path fill="${C.eye}" d="M374,556 C406,560 444,572 470,594 C434,604 394,596 374,556 Z"/>
  <path fill="${C.eye}" d="M650,556 C618,560 580,572 554,594 C590,604 630,596 650,556 Z"/>
  <ellipse cx="430" cy="584" rx="5" ry="11" fill="${C.night}"/>
  <ellipse cx="594" cy="584" rx="5" ry="11" fill="${C.night}"/>
  <!-- nostrils -->
  <path fill="${C.skinDark}" d="M486,622 q8,-10 16,0 q-8,8 -16,0 Z M522,622 q8,-10 16,0 q-8,8 -16,0 Z"/>

  <!-- a snarl, not a grin: the upper lip arches up, the corners pull down -->
  <path fill="${C.mouth}" d="M340,704 Q512,632 684,704 Q640,810 512,814 Q384,810 340,704 Z"/>
  <path fill="${C.gum}" d="M386,752 Q512,826 638,752 Q596,804 512,806 Q428,804 386,752 Z"/>
  <!-- gum along the top of the mouth -->
  <path fill="${C.gum}" d="M340,704 Q512,632 684,704 L672,722 Q512,658 352,722 Z"/>
  <path fill="${C.tooth}" d="${teeth([352, 722], [512, 658], [672, 722], 16, 44, 1)}"/>
  <path fill="${C.tooth}" d="${teeth([376, 744], [512, 850], [648, 744], 12, -34, 1)}"/>

  <!-- ribbed throat -->
  <path fill="none" stroke="${C.skinDark}" stroke-width="11" stroke-linecap="round"
        d="M384,852 Q512,886 640,852 M340,890 Q512,934 684,890"/>

  <!-- tentacles from the snout, hanging over the corners of the mouth -->
  ${both((m) => outlined(tentacle(m([[488, 640], [420, 636], [334, 652], [300, 724]], [[300, 724], [276, 784], [300, 846], [268, 878]], [[268, 878], [244, 896], [232, 866], [254, 856]]), 22, 3), C.skinDark, 8))}
  <!-- thinner tendrils from the cheeks -->
  ${both((m) => outlined(tentacle(m([[324, 596], [286, 588], [246, 600], [230, 642]], [[230, 642], [218, 676], [240, 694], [258, 678]]), 13, 2), C.skinDark, 6))}
  ${both((m) => outlined(tentacle(m([[316, 648], [278, 660], [252, 700], [252, 742]], [[252, 742], [252, 774], [276, 782], [284, 762]]), 12, 2), C.skinDark, 6))}
`;

// ---------- frame, after the box ----------

const S = 10; // stroke
const frame = `
  <g fill="none" stroke="${C.cream}" stroke-width="${S}" stroke-linecap="round">
    <!-- double rule -->
    <rect x="104" y="128" width="816" height="768" rx="6"/>
    <rect x="124" y="148" width="776" height="728" rx="4" stroke-width="${S / 2}"/>
    <!-- top corners: the side and top rules run past each other and curl, like the box -->
    <path d="M104,140 C104,96 92,72 66,70 C44,68 38,92 54,100"/>
    <path d="M116,128 C76,128 54,118 52,92"/>
    <path d="M920,140 C920,96 932,72 958,70 C980,68 986,92 970,100"/>
    <path d="M908,128 C948,128 970,118 972,92"/>
    <!-- bottom corners: smaller whiplash curls -->
    <path d="M104,884 C104,924 86,946 64,944 C46,942 44,922 58,918"/>
    <path d="M920,884 C920,924 938,946 960,944 C978,942 980,922 966,918"/>
  </g>
`;

const background = (id) => `
  <defs>
    <radialGradient id="${id}" cx="50%" cy="48%" r="70%">
      <stop offset="0" stop-color="${C.glow}"/>
      <stop offset="0.45" stop-color="${C.sky}"/>
      <stop offset="1" stop-color="${C.night}"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#${id})"/>
`;

/** Full icon: background, frame, Hydra. `scale` shrinks the art for maskable icons' safe zone. */
const svg = ({ scale = 1, withFrame = true, withBackground = true, withHydra = true } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  ${withBackground ? background("bg") : ""}
  <defs>
    <!-- the shoulders end at the inner frame rule -->
    <clipPath id="inside"><rect x="124" y="0" width="776" height="876"/></clipPath>
  </defs>
  <g transform="translate(${512 * (1 - scale)} ${512 * (1 - scale)}) scale(${scale})">
    <g clip-path="${withFrame ? "url(#inside)" : "none"}"><g transform="translate(0 20)">${withHydra ? hydra : ""}</g></g>
    ${withFrame ? frame : ""}
  </g>
</svg>`;

// ---------- render ----------

mkdirSync("assets", { recursive: true });
mkdirSync("public", { recursive: true });
writeFileSync("assets/icon.svg", svg());

const render = (source, size) => sharp(Buffer.from(source), { density: 72 * (size / 1024) * 4 }).resize(size, size).png().toBuffer();

/** ICO container holding PNG images (supported by all current browsers). From BSG Companion. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// Tiny sizes drop the frame: at 16-48px it would only be noise around a smaller head.
const small = svg({ withFrame: false, scale: 1.18 });
const full = svg();
const maskable = svg({ scale: 0.8 });

writeFileSync("public/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(small, size) })))));
writeFileSync("public/favicon-32.png", await render(small, 32));
writeFileSync("public/apple-touch-icon.png", await render(full, 180));
writeFileSync("public/icon-192.png", await render(full, 192));
writeFileSync("public/icon-512.png", await render(full, 512));
writeFileSync("public/icon-maskable-512.png", await render(maskable, 512));
writeFileSync("assets/icon-1024.png", await render(full, 1024));

// Sources for the native app icons and splash screens (`npx @capacitor/assets generate`, run by
// `npm run icons`), as in BSG Companion:
// - icon-only: iOS and legacy Android, the Hydra without the frame on the night sky
// - icon-foreground / icon-background: Android adaptive icon layers. Launchers mask the outer third,
//   so the foreground is the Hydra alone, large, on transparency (no frame).
// - splash / splash-dark: the framed Hydra on the night sky, 2732 px square.
// iOS (and legacy Android) get the same frameless, large Hydra as the Android adaptive icon, on the night sky.
// iOS rounds the corners itself and shows the whole square, so she can be a little larger than on Android.
writeFileSync("assets/icon-only.png", await render(svg({ scale: 1.25, withFrame: false }), 1024));
// The adaptive foreground has no frame: framed, it had to shrink to fit the mask and looked small on the
// home screen. The Hydra is drawn large instead; her shoulders run off the edge and the launcher's mask trims them.
writeFileSync("assets/icon-foreground.png", await render(svg({ scale: 0.9, withFrame: false, withBackground: false }), 1024));
writeFileSync("assets/icon-background.png", await render(svg({ withFrame: false, withBackground: true, withHydra: false }), 1024));
const splash = await sharp({ create: { width: 2732, height: 2732, channels: 4, background: C.night } })
  .composite([{ input: await render(svg({ scale: 1, withBackground: false }), 1100), gravity: "center" }])
  .png()
  .toBuffer();
writeFileSync("assets/splash.png", splash);
writeFileSync("assets/splash-dark.png", splash);
console.log("wrote assets/icon.svg, the native icon and splash sources in assets/, and the web icons in public/");
