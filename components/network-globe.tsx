function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number; z: number };

export function NetworkGlobe() {
  const width = 960;
  const height = 640;
  const cx = 655;
  const cy = 318;
  const radius = 248;

  const project = (lat: number, lon: number): Point => {
    const latR = (lat * Math.PI) / 180;
    const lonR = (lon * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(latR) * Math.sin(lonR),
      y: cy - radius * Math.sin(latR),
      z: radius * Math.cos(latR) * Math.cos(lonR),
    };
  };

  const meridians: string[] = [];
  for (let lon = -90; lon <= 90; lon += 18) {
    const pts: Point[] = [];
    for (let lat = -90; lat <= 90; lat += 4) {
      const p = project(lat, lon);
      if (p.z > -18) pts.push(p);
    }
    if (pts.length > 1) {
      meridians.push(
        pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      );
    }
  }

  const parallels: string[] = [];
  for (let lat = -60; lat <= 60; lat += 18) {
    const pts: Point[] = [];
    for (let lon = -110; lon <= 110; lon += 4) {
      const p = project(lat, lon);
      if (p.z > -12) pts.push(p);
    }
    if (pts.length > 1) {
      parallels.push(
        pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      );
    }
  }

  const nodes: Point[] = [];
  for (let lat = -70; lat <= 70; lat += 16) {
    for (let lon = -80; lon <= 80; lon += 16) {
      const p = project(lat, lon);
      if (p.z > 20) nodes.push(p);
    }
  }

  const links: [Point, Point][] = [];
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j <= i) return;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 38 && dist < 92) links.push([a, b]);
    });
  });

  const rand = mulberry32(42);
  const field: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 70; i++) {
    field.push({
      x: 30 + rand() * 430,
      y: 40 + rand() * 560,
      r: 1.1 + rand() * 1.8,
    });
  }

  const fieldLinks: [typeof field[0], typeof field[0]][] = [];
  field.forEach((a, i) => {
    field.forEach((b, j) => {
      if (j <= i) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 78 && rand() > 0.55) fieldLinks.push([a, b]);
    });
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMaxYMid slice"
    >
      <defs>
        <radialGradient id="globeGlow" cx="68%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#1b4d8a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#0a192f" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0a192f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lineFade" x1="0" x2="1">
          <stop offset="0%" stopColor="#a2ff00" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#7ecbff" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="#0a192f" />
      <circle cx={cx} cy={cy} r={radius + 36} fill="url(#globeGlow)" />

      {fieldLinks.map(([a, b], i) => (
        <line
          key={`fl-${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="url(#lineFade)"
          strokeWidth="0.7"
        />
      ))}
      {field.map((n, i) => (
        <circle
          key={`fn-${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={i % 7 === 0 ? "#a2ff00" : "#6ea8ff"}
          opacity={i % 7 === 0 ? 0.85 : 0.35}
          className={i % 11 === 0 ? "node-pulse" : undefined}
        />
      ))}

      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#0c213d"
        fillOpacity="0.35"
        stroke="#4ea3ff"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {meridians.map((d, i) => (
        <path key={`m-${i}`} d={d} fill="none" stroke="#5eb0ff" strokeOpacity="0.28" strokeWidth="1" />
      ))}
      {parallels.map((d, i) => (
        <path key={`p-${i}`} d={d} fill="none" stroke="#7ec8ff" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      {links.map(([a, b], i) => (
        <line
          key={`l-${i}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#a2ff00"
          strokeOpacity="0.22"
          strokeWidth="0.8"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={i % 5 === 0 ? 3.2 : 2}
          fill={i % 5 === 0 ? "#a2ff00" : "#9ad4ff"}
          className={i % 5 === 0 ? "node-pulse" : undefined}
        />
      ))}
    </svg>
  );
}
