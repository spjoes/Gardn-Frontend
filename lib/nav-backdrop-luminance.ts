/**
 * Sample approximate sRGB luminance of the content visually behind the navbar so we can
 * pick light vs dark foreground. mix-blend-mode is unreliable here because it blends
 * against the glass layer, not the distant hero image.
 */

const SAMPLE_CTX =
  typeof document !== "undefined"
    ? document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
      })
    : null;

function linearizeChannel(c: number) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance (sRGB), 0–1 */
export function relativeLuminance(r: number, g: number, b: number) {
  const R = linearizeChannel(r);
  const G = linearizeChannel(g);
  const B = linearizeChannel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function parseCssColor(css: string): { r: number; g: number; b: number; a: number } | null {
  const v = css.trim();
  if (!v || v === "transparent") return null;
  const probe = SAMPLE_CTX;
  if (!probe) return null;
  try {
    probe.fillStyle = "#000000";
    probe.fillStyle = v;
    const out = probe.fillStyle;
    if (typeof out !== "string") return null;
    if (out.startsWith("#")) {
      const hex = out.slice(1);
      const expand =
        hex.length === 3
          ? hex
              .split("")
              .map((c) => c + c)
              .join("")
          : hex;
      if (expand.length !== 6) return null;
      const r = parseInt(expand.slice(0, 2), 16);
      const g = parseInt(expand.slice(2, 4), 16);
      const b = parseInt(expand.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    const m = out.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (m) {
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: m[4] !== undefined ? Number(m[4]) : 1,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function isLikelyLiquidGlCanvas(el: Element): boolean {
  if (!(el instanceof HTMLCanvasElement)) return false;
  const { width, height } = el;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const vw = window.innerWidth * dpr;
  const vh = window.innerHeight * dpr;
  return width >= vw * 0.8 && height >= vh * 0.8;
}

function sampleImgBitmap(img: HTMLImageElement): number | null {
  if (!SAMPLE_CTX || !img.complete || img.naturalWidth === 0) return null;
  try {
    SAMPLE_CTX.canvas.width = 1;
    SAMPLE_CTX.canvas.height = 1;
    SAMPLE_CTX.drawImage(img, 0, 0, 1, 1);
    const [r, g, b, a] = SAMPLE_CTX.getImageData(0, 0, 1, 1).data;
    if (a < 8) return null;
    return relativeLuminance(r, g, b);
  } catch {
    return null;
  }
}

function sampleVideoFrame(vid: HTMLVideoElement): number | null {
  if (!SAMPLE_CTX || vid.readyState < 2) return null;
  try {
    SAMPLE_CTX.canvas.width = 1;
    SAMPLE_CTX.canvas.height = 1;
    SAMPLE_CTX.drawImage(vid, 0, 0, 1, 1);
    const [r, g, b, a] = SAMPLE_CTX.getImageData(0, 0, 1, 1).data;
    if (a < 8) return null;
    return relativeLuminance(r, g, b);
  } catch {
    return null;
  }
}

function surfaceLuminanceFromElement(el: Element): number | null {
  if (el instanceof HTMLImageElement) return sampleImgBitmap(el);
  if (el instanceof HTMLVideoElement) return sampleVideoFrame(el);
  if (!(el instanceof HTMLElement)) return null;

  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const parsed = parseCssColor(bg);
  if (parsed && parsed.a > 0.04) {
    return relativeLuminance(parsed.r, parsed.g, parsed.b);
  }
  return null;
}

/**
 * Average relative luminance (0–1) of pixels behind `navRoot` at sample y and xs.
 * Skips the nav subtree and full-viewport WebGL canvases used by liquidGL.
 */
export function averageBackdropLuminanceBehindNav(
  navRoot: HTMLElement,
  xs: number[],
  y: number,
): number {
  const values: number[] = [];

  for (const x of xs) {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (navRoot.contains(el)) continue;
      if (isLikelyLiquidGlCanvas(el)) continue;
      const L = surfaceLuminanceFromElement(el);
      if (L !== null) {
        values.push(L);
        break;
      }
    }
  }

  if (values.length === 0) return 0.94;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Use light foreground when the sampled backdrop is fairly dark */
export function shouldUseLightNavText(avgLuminance: number, threshold = 0.48) {
  return avgLuminance < threshold;
}

export const NAV_CONTRAST_UPDATE = "gardn-nav-contrast-update";

export function notifyNavContrastUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NAV_CONTRAST_UPDATE));
}
