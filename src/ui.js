const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
let statusTimer = null;

export function showStatus(msg, autoHideMs) {
  statusEl.innerHTML = msg;
  statusEl.classList.add('show');
  if (statusTimer) clearTimeout(statusTimer);
  if (autoHideMs) statusTimer = setTimeout(hideStatus, autoHideMs);
}

export function hideStatus() {
  statusEl.classList.remove('show');
}

export function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.add('show');
}

export function setFrozen(frozen) {
  document.body.dataset.frozen = frozen;
  document.getElementById('freezeBtn').textContent = frozen ? 'Pokračovat' : 'Zmrazit';
}

export function updateColorPanel(r, g, b, name, hex) {
  document.getElementById('swatch').style.background = hex;
  document.getElementById('colorName').textContent = name;
  document.getElementById('colorDetail').textContent = `RGB ${r} · ${g} · ${b}   ${hex.toUpperCase()}`;
}

export function showTextResult(text) {
  document.getElementById('textContent').textContent = text;
  document.getElementById('textResult').classList.add('show');
}

export function hideTextResult() {
  document.getElementById('textResult').classList.remove('show');
}

export function showTranslation(original, translated) {
  const content = document.getElementById('textContent');
  content.innerHTML = '';
  const orig = document.createElement('div');
  orig.textContent = original;
  content.appendChild(orig);
  const tr = document.createElement('div');
  tr.className = 'translation';
  tr.textContent = translated;
  content.appendChild(tr);
}
