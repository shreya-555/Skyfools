import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFrameLoader} from '../src/frameLoader.js';

function harness() {
  const requests = [];
  let changes = 0;
  const loader = createFrameLoader({
    urlForFrame: n => `frame-${n}.jpg`, lastFrame: 604,
    getSettings: () => ({concurrency: 3, cacheLimit: 6, offsets: [0, 2, 5, -2]}),
    onChange: () => changes++,
    createImage: () => {
      const image = {removeAttribute: () => { image.cancelled = true; }};
      Object.defineProperty(image, 'src', {set(value) { image.url = value; requests.push(image); }});
      return image;
    }
  });
  const finish = image => { image.settled = true; image.onload(); };
  const flush = () => {
    let budget = 100;
    while (requests.some(image => !image.settled)) {
      assert.ok(budget-- > 0, 'Preloading must settle instead of reloading evicted frames');
      finish(requests.find(image => !image.settled));
    }
  };
  return {loader, requests, finish, flush, changes: () => changes};
}

test('delayed mobile requests survive continuous swipes and catch up to the latest target', () => {
  const h = harness();
  h.loader.request(1);
  for (let n = 20; n <= 280; n += 20) h.loader.request(n);
  assert.equal(h.requests.length, 3, 'A swipe must not start replacement downloads before existing ones finish');
  assert.ok(h.requests.every(image => !image.cancelled));
  h.finish(h.requests[0]);
  assert.equal(h.loader.nearest().number, 1);
  assert.equal(h.requests[3].url, 'frame-280.jpg', 'Finished slots must request the current scroll target');
  h.finish(h.requests[3]);
  assert.equal(h.loader.nearest().number, 280);
  assert.ok(h.loader.stats().pending <= 3);
  h.loader.dispose();
});

test('forward and reverse journeys keep decoded images bounded and preloading settles', () => {
  const h = harness();
  for (const n of [1, 25, 80, 160, 240, 300, 480, 604, 200, 90, 1]) {
    h.loader.request(n, n < 200 ? -1 : 1);
    h.flush();
    assert.equal(h.loader.nearest().number, n);
    assert.ok(h.loader.stats().cached <= 6);
    assert.equal(h.loader.stats().pending, 0);
  }
  h.loader.dispose();
});

test('unmount cancels only outstanding work and ignores late image callbacks', () => {
  const h = harness();
  h.loader.request(1);
  const lateCallback = h.requests[0].onload;
  h.loader.dispose();
  lateCallback();
  assert.equal(h.changes(), 0);
  assert.ok(h.requests.every(image => image.cancelled));
  assert.deepEqual(h.loader.stats(), {cached: 0, pending: 0});
});
