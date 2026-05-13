/**
 * User-resizable selection rectangle for OCR target area.
 * Lives in display-pixel coordinates inside .camera-wrap.
 * On scan, getSelectionVideoRect() maps to video source pixels, accounting
 * for object-fit: cover (which crops the video to fill the display).
 */

const box = document.getElementById('selectBox');
const wrap = document.querySelector('.camera-wrap');

// State in display pixels relative to .camera-wrap
let state = { x: 0, y: 0, w: 0, h: 0 };

const MIN_W = 100;
const MIN_H = 60;

function applyState() {
  box.style.left = state.x + 'px';
  box.style.top = state.y + 'px';
  box.style.width = state.w + 'px';
  box.style.height = state.h + 'px';
}

function setDefault() {
  const r = wrap.getBoundingClientRect();
  state.w = Math.round(r.width * 0.9);
  state.h = Math.round(r.height * 0.4);
  state.x = Math.round((r.width - state.w) / 2);
  state.y = Math.round((r.height - state.h) / 2);
  applyState();
}

export function initSelection() {
  setDefault();
  attachHandlers();

  // Re-default on viewport resize (orientation change, browser chrome shifts)
  window.addEventListener('resize', () => {
    const r = wrap.getBoundingClientRect();
    // Clamp current state to new bounds
    state.w = Math.min(state.w, r.width);
    state.h = Math.min(state.h, r.height);
    state.x = Math.max(0, Math.min(state.x, r.width - state.w));
    state.y = Math.max(0, Math.min(state.y, r.height - state.h));
    applyState();
  });
}

function attachHandlers() {
  let drag = null;       // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  let startX, startY, startState;

  box.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    drag = handle ? handle.dataset.handle : 'move';
    startX = e.clientX;
    startY = e.clientY;
    startState = { ...state };
    (handle || box).setPointerCapture(e.pointerId);
    box.classList.add('touched'); // hide hint after first touch
    e.preventDefault();
    e.stopPropagation();
  });

  function onMove(e) {
    if (!drag) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const r = wrap.getBoundingClientRect();

    let { x, y, w, h } = startState;

    if (drag === 'move') {
      x = startState.x + dx;
      y = startState.y + dy;
    } else {
      if (drag.includes('l')) { x = startState.x + dx; w = startState.w - dx; }
      if (drag.includes('r')) { w = startState.w + dx; }
      if (drag.includes('t')) { y = startState.y + dy; h = startState.h - dy; }
      if (drag.includes('b')) { h = startState.h + dy; }
    }

    // Minimum size — if we'd undershoot, snap back to the anchor edge
    if (w < MIN_W) {
      if (drag.includes('l')) x = startState.x + startState.w - MIN_W;
      w = MIN_W;
    }
    if (h < MIN_H) {
      if (drag.includes('t')) y = startState.y + startState.h - MIN_H;
      h = MIN_H;
    }

    // Clamp inside camera-wrap
    if (x < 0) { w += x; x = 0; }
    if (y < 0) { h += y; y = 0; }
    if (x + w > r.width) w = r.width - x;
    if (y + h > r.height) h = r.height - y;

    state = { x, y, w, h };
    applyState();
  }

  function onEnd() { drag = null; }

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onEnd);
  document.addEventListener('pointercancel', onEnd);
}

/**
 * Maps the selection box (display pixels) to video source pixels.
 * Accounts for object-fit: cover, which scales+crops the video so it fills
 * the container — the displayed video region != the full source frame.
 */
export function getSelectionVideoRect(video) {
  const wrapRect = wrap.getBoundingClientRect();
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const displayAspect = wrapRect.width / wrapRect.height;
  const videoAspect = vw / vh;

  // Visible portion of the source frame after object-fit: cover
  let sourceW, sourceH, sourceOffsetX, sourceOffsetY;
  if (videoAspect > displayAspect) {
    // Video wider than display → horizontal crop
    sourceH = vh;
    sourceW = Math.round(vh * displayAspect);
    sourceOffsetX = Math.round((vw - sourceW) / 2);
    sourceOffsetY = 0;
  } else {
    // Video taller than display → vertical crop
    sourceW = vw;
    sourceH = Math.round(vw / displayAspect);
    sourceOffsetX = 0;
    sourceOffsetY = Math.round((vh - sourceH) / 2);
  }

  const scaleX = sourceW / wrapRect.width;
  const scaleY = sourceH / wrapRect.height;

  return {
    x: Math.round(sourceOffsetX + state.x * scaleX),
    y: Math.round(sourceOffsetY + state.y * scaleY),
    w: Math.round(state.w * scaleX),
    h: Math.round(state.h * scaleY),
  };
}
