import type html2canvas from "html2canvas";

/** Props html2canvas may try to parse that can contain oklab/oklch from modern browsers or Tailwind v4. */
const COLOR_PROPS = [
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "caret-color",
  "column-rule-color",
  "flood-color",
  "lighting-color",
  "stop-color",
  "-webkit-text-stroke-color",
] as const;

function containsModernColorFn(value: string) {
  return (
    /\bok(lab|lch)\b/i.test(value) ||
    /\bcolor\s*\(\s*srgb/i.test(value) ||
    /\bcolor\s*\(\s*display-p3/i.test(value)
  );
}

/**
 * html2canvas 1.x cannot parse oklab/oklch. The canvas fillStyle setter converts any CSS color the
 * engine understands into rgb/hex, which we write back as inline styles on the clone before capture.
 */
function normalizeSubtree(doc: Document) {
  const view = doc.defaultView;
  if (!view) return;

  const probe = view.document.createElement("canvas").getContext("2d");
  if (!probe) return;

  const toSerializableColor = (value: string): string | null => {
    const v = value.trim();
    if (!v || v === "transparent") return null;
    if (!containsModernColorFn(v)) return null;
    try {
      probe.fillStyle = "#000000";
      probe.fillStyle = v;
      return String(probe.fillStyle);
    } catch {
      return null;
    }
  };

  const fixInlineColorProp = (el: HTMLElement, prop: string, value: string) => {
    const next = toSerializableColor(value);
    if (next) el.style.setProperty(prop, next);
  };

  const walk = (node: Element) => {
    if (node instanceof view.HTMLElement) {
      const cs = view.getComputedStyle(node);

      for (const prop of COLOR_PROPS) {
        const raw = cs.getPropertyValue(prop);
        if (raw && containsModernColorFn(raw)) {
          fixInlineColorProp(node, prop, raw);
        }
      }

      const shadow = cs.getPropertyValue("box-shadow");
      if (shadow && shadow !== "none" && containsModernColorFn(shadow)) {
        node.style.boxShadow =
          "0 12px 40px rgba(56, 57, 39, 0.06)";
      }

      const bgImg = cs.getPropertyValue("background-image");
      if (bgImg && bgImg !== "none" && containsModernColorFn(bgImg)) {
        node.style.backgroundImage = "none";
      }

      const filterVal = cs.getPropertyValue("filter");
      if (filterVal && filterVal !== "none" && containsModernColorFn(filterVal)) {
        node.style.filter = "none";
      }

      const textShadow = cs.getPropertyValue("text-shadow");
      if (
        textShadow &&
        textShadow !== "none" &&
        containsModernColorFn(textShadow)
      ) {
        node.style.textShadow = "none";
      }
    }

    if (node instanceof view.SVGElement) {
      const cs = view.getComputedStyle(node);
      for (const prop of ["fill", "stroke"] as const) {
        const raw = cs.getPropertyValue(prop);
        if (raw && !raw.startsWith("url(") && containsModernColorFn(raw)) {
          const next = toSerializableColor(raw);
          if (next) node.style.setProperty(prop, next);
        }
      }
    }

    for (const child of node.children) walk(child);
  };

  if (doc.documentElement) walk(doc.documentElement);
}

/**
 * liquidGL calls html2canvas without an onclone hook — wrap so snapshots survive Tailwind v4 / modern color serialization.
 */
export function wrapHtml2CanvasForLiquidGlass(
  base: typeof html2canvas,
): typeof html2canvas {
  const wrapped = ((
    element: HTMLElement,
    options?: Parameters<typeof base>[1],
  ) => {
    const userOnClone = options?.onclone;
    return base(element, {
      ...options,
      onclone(doc, element) {
        normalizeSubtree(doc);
        userOnClone?.(doc, element);
      },
    });
  }) as typeof base;

  return wrapped;
}
