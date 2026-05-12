const PALETTE = [
  ['černá', 0, 0, 0], ['bílá', 255, 255, 255],
  ['tmavě šedá', 64, 64, 64], ['šedá', 128, 128, 128], ['světle šedá', 200, 200, 200],
  ['červená', 220, 30, 30], ['tmavě červená', 130, 20, 20], ['světle červená', 255, 120, 120],
  ['oranžová', 255, 140, 0], ['tmavě oranžová', 200, 100, 0],
  ['žlutá', 250, 220, 30], ['tmavě žlutá', 200, 170, 0], ['světle žlutá', 255, 245, 150],
  ['zelená', 40, 180, 60], ['tmavě zelená', 20, 100, 30], ['světle zelená', 150, 230, 150],
  ['olivová', 130, 130, 30], ['tyrkysová', 30, 200, 200],
  ['modrá', 30, 90, 220], ['tmavě modrá', 20, 40, 130], ['světle modrá', 130, 180, 250],
  ['fialová', 130, 50, 200], ['tmavě fialová', 70, 20, 110], ['světle fialová', 200, 160, 230],
  ['růžová', 255, 130, 180], ['tmavě růžová', 200, 60, 120],
  ['hnědá', 110, 60, 20], ['světle hnědá', 180, 130, 80], ['béžová', 230, 210, 170],
  ['tělová', 240, 200, 170], ['krémová', 250, 240, 220],
];

export function nameColor(r, g, b) {
  let best = PALETTE[0], bestD = Infinity;
  for (const p of PALETTE) {
    const dr = r - p[1], dg = g - p[2], db = b - p[3];
    const d = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best[0];
}

export function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
