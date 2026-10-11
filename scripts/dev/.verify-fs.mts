// node verify.mts <slug> <props.json> <outDir> [sigma]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderFrames, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
const ROOT = "/Users/srisomanaath/Desktop/snapcn/snapcn-main/snapcn";
const { decodePng } = await import(path.join(ROOT, "lib/motion-check/png.ts"));
const { tsconfigWebpackAlias } = await import(path.join(ROOT, "scripts/tsconfig-webpack-alias.mts"));
const SP = "/private/tmp/claude-501/-Users-srisomanaath-Desktop-snapcn-snapcn-main-snapcn/e088f197-9933-4952-bc75-ab906bb56cb0/scratchpad";
const [slug, propsFile, outDir, sigArg] = process.argv.slice(2);
const SIG = Number(sigArg ?? 0.65), K = 4, W = 638, H = 358, FS = W * H * 1.5;
const inputProps = JSON.parse(readFileSync(propsFile, "utf8"));
mkdirSync(outDir, { recursive: true });
const ref = readFileSync(path.join(SP, "ref/ref.yuv"));
const pts = readFileSync(path.join(SP, "ref/pts.txt"), "utf8").trim().split("\n").map(s => Number(s.replace(/,$/, "")));
const nRef = ref.length / FS;
// pts has a hole (frame 28 printed oddly) — rebuild from neighbours if NaN
for (let i = 0; i < pts.length; i++) if (!Number.isFinite(pts[i])) pts[i] = (pts[i - 1] + pts[i + 1]) / 2;
const at = (n: number) => Math.floor(pts[n] * 30 + 1e-3);
await ensureBrowser();
const proBarrel = path.join(ROOT, "registry/snap-cn-pro/__index__.tsx");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "src/remotion/dev-entry.ts"), publicDir: path.join(ROOT, "public"), ignoreRegisterRootWarning: true,
  webpackOverride: (raw) => { const c = enableTailwind(raw); const ex = Object.entries(c.resolve?.alias ?? {}).map(([n, a]) => ({ name: n.replace(/\$$/, ""), alias: a as string, onlyModule: n.endsWith("$") }));
    return { ...c, resolve: { ...c.resolve, alias: [{ name: "@/registry/snap-cn-pro/__index__", alias: existsSync(proBarrel) ? proBarrel : path.join(ROOT, "src/remotion/no-pro.ts"), onlyModule: true }, ...ex, ...tsconfigWebpackAlias(ROOT)] } }; },
});
const sel = await selectComposition({ serveUrl, id: slug, inputProps });
const last = at(nRef - 1);
const comp = { ...sel, width: W, height: H, durationInFrames: Math.max(sel.durationInFrames, last + 1) };
const mine = new Map<number, Buffer>();
await renderFrames({ serveUrl, composition: comp, inputProps, imageFormat: "png", outputDir: null, scale: K, frameRange: [0, last],
  onFrameBuffer: (b, f) => { mine.set(f, b); }, concurrency: 4, onStart: () => {}, onFrameUpdate: () => {} });
function gauss(s: number) { const r = Math.max(1, Math.ceil(s * 3)), k: number[] = []; let t = 0; for (let i = -r; i <= r; i++) { const v = Math.exp(-i * i / (2 * s * s)); k.push(v); t += v; } return k.map(v => v / t); }
function blur(a: Float32Array, w: number, h: number, s: number) { if (s < 0.05) return a; const k = gauss(s), r = (k.length - 1) / 2, t = new Float32Array(w * h), o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let i = -r; i <= r; i++) v += a[y * w + Math.min(w - 1, Math.max(0, x + i))] * k[i + r]; t[y * w + x] = v; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let i = -r; i <= r; i++) v += t[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + r]; o[y * w + x] = v; } return o; }
const lin = (c: number) => c; // compare in gamma-encoded space (capture downscale is in sRGB)
function toYUV(png: Buffer) { const r = decodePng(png); const ch = r.channels, w = r.width / K, h = r.height / K;
  const R = new Float32Array(w * h), G = new Float32Array(w * h), B = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let a = 0, b = 0, c = 0; for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) { const p = ((y * K + j) * r.width + x * K + i) * ch; a += lin(r.data[p]); b += lin(r.data[p + 1]); c += lin(r.data[p + 2]); } R[y * w + x] = a / K / K; G[y * w + x] = b / K / K; B[y * w + x] = c / K / K; }
  const Rb = blur(R, w, h, SIG), Gb = blur(G, w, h, SIG), Bb = blur(B, w, h, SIG);
  const Y = new Float32Array(w * h), U = new Float32Array(w * h), V = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) { const y = 0.2126 * Rb[i] + 0.7152 * Gb[i] + 0.0722 * Bb[i]; Y[i] = 16 + 219 * y / 255; U[i] = 128 + 224 * (Bb[i] - y) / 1.8556 / 255; V[i] = 128 + 224 * (Rb[i] - y) / 1.5748 / 255; }
  return { Y, U, V }; }
const rows: string[] = []; const per: Record<number, number> = {};
const BAND = [120, 240]; // text band rows for the focused score
let tot = 0, totB = 0;
for (let n = 0; n < nRef; n++) {
  const f = at(n); const m = toYUV(mine.get(f)!); const o = n * FS;
  let e = 0, eb = 0, nb = 0, ec = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, d = m.Y[i] - ref[o + i]; e += d * d; if (y >= BAND[0] && y < BAND[1]) { eb += d * d; nb++; } }
  for (let y = 0; y < H / 2; y++) for (let x = 0; x < W / 2; x++) { const i = y * W / 2 + x; const mu = (m.U[2 * y * W + 2 * x] + m.U[2 * y * W + 2 * x + 1] + m.U[(2 * y + 1) * W + 2 * x] + m.U[(2 * y + 1) * W + 2 * x + 1]) / 4; const mv = (m.V[2 * y * W + 2 * x] + m.V[2 * y * W + 2 * x + 1] + m.V[(2 * y + 1) * W + 2 * x] + m.V[(2 * y + 1) * W + 2 * x + 1]) / 4; ec += (mu - ref[o + W * H + i]) ** 2 + (mv - ref[o + W * H * 1.25 + i]) ** 2; }
  const rm = Math.sqrt(e / (W * H)), rb = Math.sqrt(eb / nb), rc = Math.sqrt(ec / (W * H / 2));
  tot += rm; totB += rb; rows.push(`${String(n).padStart(2)} t=${pts[n].toFixed(3)} f=${String(f).padStart(2)}  Y ${rm.toFixed(2)}  Yband ${rb.toFixed(2)}  C ${rc.toFixed(2)}`);
  // side-by-side pgm: ref band / mine band / diff
  const crop = (src: (i: number) => number) => { const a: number[] = []; for (let y = BAND[0]; y < BAND[1]; y++) for (let x = 0; x < W; x++) a.push(Math.max(0, Math.min(255, Math.round(src(y * W + x))))); return a; };
  const img = [...crop(i => ref[o + i]), ...crop(i => m.Y[i]), ...crop(i => 128 + 2 * (m.Y[i] - ref[o + i]))];
  writeFileSync(path.join(outDir, `n${String(n).padStart(2, "0")}.pgm`), Buffer.concat([Buffer.from(`P5 ${W} ${(BAND[1] - BAND[0]) * 3} 255\n`), Buffer.from(img)]));
}
writeFileSync(path.join(outDir, "report.txt"), rows.join("\n") + `\nmean Y ${(tot / nRef).toFixed(3)}  mean Yband ${(totB / nRef).toFixed(3)}\n`);
console.log(rows.join("\n")); console.log(`mean Y ${(tot / nRef).toFixed(3)}  mean Yband ${(totB / nRef).toFixed(3)}`);
