export default function QRCodeSVG({ value, size = 128 }) {
  const N = 21;
  const cs = size / N;
  const cells = [];

  const inFinder = (r, c, fr, fc) => r >= fr && r <= fr + 6 && c >= fc && c <= fc + 6;
  const finderFilled = (r, c, fr, fc) => {
    const dr = r - fr, dc = c - fc;
    return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
  };

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let filled = false;
      if (inFinder(r, c, 0, 0)) filled = finderFilled(r, c, 0, 0);
      else if (inFinder(r, c, 0, 14)) filled = finderFilled(r, c, 0, 14);
      else if (inFinder(r, c, 14, 0)) filled = finderFilled(r, c, 14, 0);
      else {
        const h = (value.charCodeAt((r * N + c) % Math.max(1, value.length)) * 31 + r * 17 + c * 13) % 5;
        filled = h < 2;
      }
      if (filled) cells.push([r, c]);
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" rx="4" />
      {cells.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={c * cs + 0.5} y={r * cs + 0.5}
          width={cs - 1} height={cs - 1}
          fill="#1B4332" rx="1"
        />
      ))}
    </svg>
  );
}