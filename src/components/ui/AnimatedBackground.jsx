'use client';

import { useEffect, useRef } from 'react';
import { LAND_MASK_B64, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from './landMask';

/*
 * App-wide animated backdrop: a rotating "digital planet Earth" — a
 * dot-matrix globe with a glowing atmosphere, an orbit ring and glowing
 * payment routes between cities — in the palette
 * #F2E6FF / #FFCCF2 / #977DFF / #00033D. Drawn on one fixed canvas behind
 * everything, so the frosted-glass cards blur it.
 *
 * Kept cheap: ~30fps, pauses while the tab is hidden, DPR capped at 2,
 * and a single still frame under prefers-reduced-motion.
 */

const DEG = Math.PI / 180;
const POINT_COUNT = 60000; // dense enough for a screen-filling planet
const OCEAN_EVERY = 14; // keep 1 in N ocean points for a faint "digital" grid
const SPIN_SPEED = 0.035; // radians per second
const TILT = -0.6; // south pole leans in: Africa mid-screen, Europe on the horizon
const FRAME_MS = 1000 / 30;

const PALETTES = {
  dark: {
    land: [242, 230, 255], // #F2E6FF
    landDeep: [90, 70, 190], // dimmed #977DFF toward the limb
    landAlpha: [0.18, 0.62], // [at the limb, facing the viewer]
    ocean: 'rgba(151, 125, 255, 0.10)',
    bodyInner: '#0a0a0a', // the planet is solid near-black
    bodyOuter: '#121214', // faint lift toward the limb so it still reads as a sphere
    rim: 'rgba(151, 125, 255, 0.45)',
    atmosphere: 'rgba(151, 125, 255, 0.16)',
    sheen: 'rgba(255, 204, 242, 0.04)',
    route: 'rgba(255, 204, 242, 0.16)',
    pulse: [255, 204, 242], // #FFCCF2
    pulseAlpha: 0.75,
    city: [255, 204, 242],
    orbit: 'rgba(242, 230, 255, 0.14)',
    star: [242, 230, 255],
    starAlpha: 0.45,
    starCount: 160,
  },
  light: {
    land: [0, 3, 61], // #00033D
    landDeep: [107, 78, 240],
    landAlpha: [0.3, 0.85],
    ocean: 'rgba(0, 3, 61, 0.12)',
    bodyInner: 'rgba(214, 214, 218, 0.5)',
    bodyOuter: 'rgba(170, 170, 178, 0.55)',
    rim: 'rgba(107, 78, 240, 0.85)',
    atmosphere: 'rgba(151, 125, 255, 0.12)',
    sheen: 'rgba(255, 255, 255, 0.1)',
    route: 'rgba(107, 78, 240, 0.30)',
    pulse: [107, 78, 240],
    pulseAlpha: 0.9,
    city: [107, 78, 240],
    orbit: 'rgba(0, 3, 61, 0.2)',
    star: [107, 78, 240],
    starAlpha: 0.5,
    starCount: 70,
  },
};

// [lat, lon] — Kimana's corridors, Africa-centred.
const CITIES = {
  lagos: [6.5, 3.4],
  accra: [5.6, -0.2],
  nairobi: [-1.3, 36.8],
  johannesburg: [-26.2, 28.0],
  cairo: [30.0, 31.2],
  london: [51.5, -0.1],
  paris: [48.9, 2.35],
  newYork: [40.7, -74.0],
  saoPaulo: [-23.5, -46.6],
  dubai: [25.2, 55.3],
  mumbai: [19.0, 72.8],
  shanghai: [31.2, 121.5],
};

const ROUTES = [
  ['lagos', 'london'],
  ['nairobi', 'dubai'],
  ['accra', 'newYork'],
  ['johannesburg', 'shanghai'],
  ['lagos', 'nairobi'],
  ['cairo', 'paris'],
  ['london', 'newYork'],
  ['dubai', 'mumbai'],
  ['lagos', 'saoPaulo'],
  ['nairobi', 'london'],
  ['johannesburg', 'lagos'],
];

function decodeMask() {
  const bin = atob(LAND_MASK_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return (lat, lon) => {
    const x = Math.min(LAND_MASK_WIDTH - 1, Math.floor(((lon + 180) / 360) * LAND_MASK_WIDTH));
    const y = Math.min(LAND_MASK_HEIGHT - 1, Math.floor(((90 - lat) / 180) * LAND_MASK_HEIGHT));
    const bit = y * LAND_MASK_WIDTH + x;
    return (bytes[bit >> 3] >> (7 - (bit & 7))) & 1;
  };
}

function toVec(latDeg, lonDeg) {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}

function buildPoints() {
  const isLand = decodeMask();
  const land = [];
  const ocean = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (2 * (i + 0.5)) / POINT_COUNT;
    const r = Math.sqrt(1 - y * y);
    const t = i * golden;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    const lat = Math.asin(y) / DEG;
    const lon = Math.atan2(x, z) / DEG;
    if (isLand(lat, lon)) land.push(x, y, z);
    else if (i % OCEAN_EVERY === 0) ocean.push(x, y, z);
  }
  return { land: new Float32Array(land), ocean: new Float32Array(ocean) };
}

// Great-circle path lifted off the surface, as 3D points.
function buildRoute(a, b, steps = 56) {
  const va = toVec(...a);
  const vb = toVec(...b);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  const sinO = Math.sin(omega) || 1;
  const lift = 0.06 + 0.3 * (omega / Math.PI);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ka = Math.sin((1 - t) * omega) / sinO;
    const kb = Math.sin(t * omega) / sinO;
    const h = 1 + lift * Math.sin(Math.PI * t);
    pts.push([(ka * va[0] + kb * vb[0]) * h, (ka * va[1] + kb * vb[1]) * h, (ka * va[2] + kb * vb[2]) * h]);
  }
  return pts;
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;

    const { land, ocean } = buildPoints();
    const routes = ROUTES.map(([a, b], i) => ({
      pts: buildRoute(CITIES[a], CITIES[b]),
      phase: (i * 0.37) % 1,
      speed: 0.12 + ((i * 7) % 5) * 0.025,
    }));
    const cityVecs = Object.values(CITIES).map(([lat, lon]) => toVec(lat, lon));
    const rand = seeded(42);
    const stars = Array.from({ length: 160 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.1,
      tw: rand() * Math.PI * 2,
    }));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let spin = -20 * DEG; // start with Africa facing the viewer
    let elapsed = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    // Full-screen: a planet far bigger than the viewport, centred low, so
    // it fills the screen and its glowing horizon arcs across the top.
    function layout() {
      const R = Math.max(width * 0.8, height * 1.05);
      const horizon = height * (width < 640 ? 0.26 : 0.2); // top of the planet
      return { cx: width * 0.5, cy: horizon + R, R };
    }

    function draw() {
      const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const p = PALETTES[theme];
      const { cx, cy, R } = layout();
      const cosS = Math.cos(spin);
      const sinS = Math.sin(spin);
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);

      // rotate (Y axis, spin) then tilt (X axis); returns [sx, sy, depth]
      const project = (x, y, z) => {
        const x1 = x * cosS + z * sinS;
        const z1 = -x * sinS + z * cosS;
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;
        return [cx + x1 * R, cy - y2 * R, z2];
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // stars
      for (let i = 0; i < p.starCount; i++) {
        const s = stars[i];
        const a = p.starAlpha * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * 1.3 + s.tw)));
        ctx.fillStyle = `rgba(${p.star[0]}, ${p.star[1]}, ${p.star[2]}, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // atmosphere glow
      const atm = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.38);
      atm.addColorStop(0, p.atmosphere);
      atm.addColorStop(1, 'rgba(151, 125, 255, 0)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.38, 0, Math.PI * 2);
      ctx.fill();

      // orbit ring — back half (behind the planet)
      const orbitRx = R * 1.28;
      const orbitRy = R * 0.3;
      const orbitRot = -0.38;
      ctx.strokeStyle = p.orbit;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRx, orbitRy, orbitRot, Math.PI, Math.PI * 2);
      ctx.stroke();

      // planet body: dark core with violet rim light
      const body = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
      body.addColorStop(0, p.bodyInner);
      body.addColorStop(1, p.bodyOuter);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.rim;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ocean grid dots (front only)
      ctx.fillStyle = p.ocean;
      for (let i = 0; i < ocean.length; i += 3) {
        const [sx, sy, d] = project(ocean[i], ocean[i + 1], ocean[i + 2]);
        if (d > 0 && sx >= 0 && sx <= width && sy >= 0 && sy <= height) ctx.fillRect(sx - 0.7, sy - 0.7, 1.4, 1.4);
      }

      // land dots: brighter and larger toward the viewer. Depth is bucketed
      // so each colour string is built once per frame, not once per dot.
      const dotBase = Math.max(1.3, Math.min(2.6, R / 420));
      const BUCKETS = 12;
      const styles = [];
      for (let bkt = 0; bkt < BUCKETS; bkt++) {
        const k = (bkt + 0.5) / BUCKETS;
        const r = Math.round(p.landDeep[0] + (p.land[0] - p.landDeep[0]) * k);
        const g = Math.round(p.landDeep[1] + (p.land[1] - p.landDeep[1]) * k);
        const b = Math.round(p.landDeep[2] + (p.land[2] - p.landDeep[2]) * k);
        const a = p.landAlpha[0] + (p.landAlpha[1] - p.landAlpha[0]) * k;
        styles.push(`rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`);
      }
      let current = -1;
      for (let i = 0; i < land.length; i += 3) {
        const [sx, sy, d] = project(land[i], land[i + 1], land[i + 2]);
        if (d <= 0.02 || sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
        const bkt = Math.min(BUCKETS - 1, Math.floor(d * BUCKETS));
        if (bkt !== current) {
          ctx.fillStyle = styles[bkt];
          current = bkt;
        }
        const sz = dotBase * (0.7 + 0.6 * d);
        ctx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
      }

      // sheen on the lit side
      const sheen = ctx.createRadialGradient(cx - R * 0.45, cy - R * 0.5, 0, cx - R * 0.45, cy - R * 0.5, R * 0.9);
      sheen.addColorStop(0, p.sheen);
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheen;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // routes: faint path + travelling pulse
      const visible = (pt) => pt[2] > 0 || Math.hypot(pt[0] - cx, pt[1] - cy) > R;
      ctx.lineCap = 'round';
      for (const route of routes) {
        const proj = route.pts.map(([x, y, z]) => project(x, y, z));
        ctx.strokeStyle = p.route;
        ctx.lineWidth = 1;
        ctx.beginPath();
        let pen = false;
        for (const pt of proj) {
          if (visible(pt)) {
            if (pen) ctx.lineTo(pt[0], pt[1]);
            else ctx.moveTo(pt[0], pt[1]);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();

        const head = (route.phase + elapsed * route.speed) % 1.4; // pause between pulses
        if (head <= 1) {
          const n = proj.length - 1;
          const hi = Math.floor(head * n);
          const tail = Math.max(0, hi - 12);
          for (let i = tail; i < hi; i++) {
            const a = proj[i];
            const b = proj[i + 1];
            if (!visible(a) || !visible(b)) continue;
            const f = (i - tail + 1) / (hi - tail);
            ctx.strokeStyle = `rgba(${p.pulse[0]}, ${p.pulse[1]}, ${p.pulse[2]}, ${p.pulseAlpha * f})`;
            ctx.lineWidth = 2.2 * f + 0.4;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
        }
      }

      // city nodes with a soft pulse
      for (let i = 0; i < cityVecs.length; i++) {
        const [sx, sy, d] = project(...cityVecs[i]);
        if (d <= 0.05) continue;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2 + i);
        ctx.fillStyle = `rgba(${p.city[0]}, ${p.city[1]}, ${p.city[2]}, ${0.15 + 0.2 * pulse})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${p.city[0]}, ${p.city[1]}, ${p.city[2]}, 0.95)`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // orbit ring — front half, with a satellite
      ctx.strokeStyle = p.orbit;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRx, orbitRy, orbitRot, 0, Math.PI);
      ctx.stroke();
      const sa = elapsed * 0.35;
      if (Math.sin(sa) > 0) {
        const ex = orbitRx * Math.cos(sa);
        const ey = orbitRy * Math.sin(sa);
        const satX = cx + ex * Math.cos(orbitRot) - ey * Math.sin(orbitRot);
        const satY = cy + ex * Math.sin(orbitRot) + ey * Math.cos(orbitRot);
        ctx.fillStyle = `rgba(${p.pulse[0]}, ${p.pulse[1]}, ${p.pulse[2]}, 0.95)`;
        ctx.beginPath();
        ctx.arc(satX, satY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      spin += SPIN_SPEED * dt;
      elapsed += dt;
      draw();
    }

    function start() {
      cancelAnimationFrame(raf);
      last = 0;
      if (reduceMotion.matches || document.hidden) draw();
      else raf = requestAnimationFrame(frame);
    }

    function onResize() {
      resize();
      draw();
    }

    resize();
    start();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', start);
    reduceMotion.addEventListener('change', start);
    // redraw immediately when the theme toggles (matters for the still frame)
    const themeObserver = new MutationObserver(() => draw());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', start);
      reduceMotion.removeEventListener('change', start);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
