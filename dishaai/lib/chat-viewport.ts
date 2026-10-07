interface ViewportMetrics {
  layoutHeight: number;
  visualHeight: number;
  referenceHeight: number;
  scale: number;
  touch: boolean;
  focused: boolean;
}

/** Follow the visible phone viewport without mistaking pinch zoom for a keyboard. */
export function chatViewport({ layoutHeight, visualHeight, referenceHeight, scale, touch, focused }: ViewportMetrics) {
  if (!Number.isFinite(layoutHeight) || layoutHeight <= 0) return { height: null, keyboardOpen: false };
  const visual = scale === 1 && Number.isFinite(visualHeight) && visualHeight > 0
    ? Math.min(layoutHeight, visualHeight)
    : layoutHeight;
  const reference = Number.isFinite(referenceHeight) ? Math.max(referenceHeight, layoutHeight) : layoutHeight;
  return {
    height: Math.floor(visual),
    keyboardOpen: touch && focused && scale === 1 && reference - visual > 120,
  };
}
