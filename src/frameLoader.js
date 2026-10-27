// Native Image loading works on iOS without Blob/ImageBitmap decoding or video playback.
// Requests already in flight must finish: cancelling them during a fast swipe can
// otherwise leave the first frame visible for the entire journey on a mobile network.
export function createFrameLoader({urlForFrame, lastFrame, getSettings, onChange, onError,
  createImage = () => new Image()}) {
  const cache = new Map(), pending = new Map(), failed = new Set();
  let alive = true, target = 1, direction = 1, displayed = 0;

  const wanted = () => getSettings().offsets.map(offset => target + direction * offset)
    .filter(n => n >= 1 && n <= lastFrame);
  const trim = () => {
    const preferred = new Set(wanted());
    const candidates = [...cache.keys()].filter(n => n !== target && n !== displayed)
      .sort((a, b) => Number(preferred.has(a)) - Number(preferred.has(b)) || Math.abs(b - target) - Math.abs(a - target));
    while (cache.size > getSettings().cacheLimit && candidates.length) cache.delete(candidates.shift());
  };
  const pump = () => {
    if (!alive) return;
    for (const number of wanted()) {
      if (pending.size >= getSettings().concurrency) break;
      if (cache.has(number) || pending.has(number) || failed.has(number)) continue;
      const image = createImage();
      pending.set(number, image);
      image.decoding = 'async';
      image.fetchPriority = number === target ? 'high' : 'low';
      image.onload = () => {
        if (!alive) return;
        pending.delete(number);
        image.onload = image.onerror = null;
        cache.set(number, image);
        trim();
        onChange();
        pump();
      };
      image.onerror = () => {
        if (!alive) return;
        pending.delete(number);
        image.onload = image.onerror = null;
        failed.add(number);
        onError?.(number);
        pump();
      };
      image.src = urlForFrame(number);
    }
  };
  return {
    request(number, nextDirection = direction) {
      if (!alive) return;
      target = number; direction = nextDirection;
      trim(); pump();
    },
    nearest() {
      let number = cache.has(target) ? target : 0;
      if (!number) for (const candidate of cache.keys()) {
        if (!number || Math.abs(candidate - target) < Math.abs(number - target)) number = candidate;
      }
      if (!number) return null;
      displayed = number;
      const image = cache.get(number);
      trim();
      return {number, image};
    },
    stats: () => ({cached: cache.size, pending: pending.size}),
    retry() { failed.clear(); pump(); },
    dispose() {
      alive = false;
      for (const image of pending.values()) { image.onload = image.onerror = null; image.removeAttribute('src'); }
      pending.clear(); cache.clear();
    }
  };
}
