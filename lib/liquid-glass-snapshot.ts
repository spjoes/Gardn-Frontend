type LiquidGLRenderer = {
  captureSnapshot?: () => Promise<boolean>;
};

/**
 * Re-run liquidGL’s full-page snapshot after lazy or remote images finish loading.
 * Safe to call even if the navbar / liquidGL has not mounted yet.
 */
export function refreshLiquidGlassSnapshot() {
  if (typeof window === "undefined") return;
  const renderer = (window as Window & { __liquidGLRenderer__?: LiquidGLRenderer })
    .__liquidGLRenderer__;
  void renderer?.captureSnapshot?.();
}
