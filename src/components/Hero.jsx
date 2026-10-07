import { useEffect, useRef, useState } from 'react';
import { HERO } from '../config.js';

const pad = (n) => String(n).padStart(4, '0');
const frameUrl = (seg, i) => `${HERO.basePath}/${seg}/${pad(i + 1)}.webp`;

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Loads every frame of a segment. A missing frame reuses the one before it.
async function loadSegment(name, count) {
  const imgs = await Promise.all(
    Array.from({ length: count }, (_, i) => loadImage(frameUrl(name, i)))
  );
  let last = imgs.find(Boolean) || null;
  return imgs.map((img) => (img ? (last = img) : last));
}

export default function Hero({ children }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const soundOnRef = useRef(false);
  const greetNowRef = useRef(() => {});
  const [soundOn, setSoundOn] = useState(false);
  const hasSound = Boolean(HERO.sound?.src);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frameMs = 1000 / HERO.fps;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const frames = {};
    // mode: poster -> idle -> play -> hold -> fade -> idle
    const s = {
      mode: 'poster', poster: null,
      seg: 'idle', idx: 0,
      idleIdx: 0, idleDir: 1,
      acc: 0, last: 0,
      holdUntil: 0, fadeStart: 0, cooldownUntil: 0,
      visible: true,
    };
    let raf = 0;
    let cancelled = false;
    let autoGreeted = false;
    let zoneTimer = 0;
    let committedZone = null;
    let pendingZone = null;

    // Draws an image like object-fit: cover, so mobile crops the sides, never the head.
    const drawImg = (img, alpha = 1) => {
      if (!img) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (s.mode === 'poster') return drawImg(s.poster);
      if (s.mode === 'idle') return drawImg(frames.idle[s.idleIdx]);
      if (s.mode === 'play' || s.mode === 'hold') return drawImg(frames[s.seg][s.idx]);
      if (s.mode === 'fade') {
        const p = Math.min(1, (now - s.fadeStart) / HERO.fadeMs);
        drawImg(frames.idle[s.idleIdx]);
        drawImg(frames[s.seg][s.idx], 1 - p);
      }
    };

    const advanceIdle = () => {
      const n = frames.idle.length;
      if (HERO.idleLoop === 'pingpong' && n > 1) {
        let next = s.idleIdx + s.idleDir;
        if (next >= n || next < 0) {
          s.idleDir *= -1;
          next = s.idleIdx + s.idleDir;
        }
        s.idleIdx = next;
      } else {
        s.idleIdx = (s.idleIdx + 1) % n;
      }
    };

    const backToIdle = () => {
      s.idleIdx = 0;
      s.idleDir = 1;
    };

    const step = (now) => {
      switch (s.mode) {
        case 'idle':
          advanceIdle();
          break;
        case 'play': {
          const seg = HERO.segments[s.seg];
          if (s.idx < frames[s.seg].length - 1) {
            s.idx++;
          } else if (seg.endsAtIdle) {
            s.mode = 'idle';
            backToIdle();
          } else {
            s.mode = 'hold';
            s.holdUntil = now + (seg.holdMs ?? 1500);
          }
          break;
        }
        case 'hold':
          if (now >= s.holdUntil) {
            s.mode = 'fade';
            s.fadeStart = now;
            backToIdle();
          }
          break;
        case 'fade':
          advanceIdle();
          if (now - s.fadeStart >= HERO.fadeMs) s.mode = 'idle';
          break;
      }
    };

    const tick = (now) => {
      raf = 0;
      if (!s.visible || document.hidden) return; // restarted by start()
      let dt = s.last ? now - s.last : frameMs;
      s.last = now;
      if (dt > 250) dt = frameMs; // don't fast-forward after the tab was hidden
      s.acc += dt;
      let changed = false;
      while (s.acc >= frameMs) {
        step(now);
        s.acc -= frameMs;
        changed = true;
      }
      if (changed || s.mode === 'fade') draw(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || reduced || s.mode === 'poster') return;
      s.last = 0;
      raf = requestAnimationFrame(tick);
    };

    const playSound = () => {
      const audio = audioRef.current;
      if (!audio || !soundOnRef.current) return;
      audio.currentTime = 0;
      audio.play().catch(() => {}); // blocked or missing file: stay silent
    };

    const play = (name, { ignoreCooldown = false } = {}) => {
      const f = frames[name];
      const now = performance.now();
      if (!f || !f[0] || s.mode !== 'idle') return false;
      if (name === 'greet') {
        if (!ignoreCooldown && now < s.cooldownUntil) return false;
        const hold = HERO.segments.greet.holdMs ?? 1500;
        s.cooldownUntil = now + f.length * frameMs + hold + HERO.fadeMs + HERO.greetCooldownMs;
      }
      s.mode = 'play';
      s.seg = name;
      s.idx = 0;
      if (name === 'greet') playSound();
      return true;
    };
    greetNowRef.current = () => play('greet', { ignoreCooldown: true });

    // Phones and tablets have no cursor: greet once when the hero is on screen.
    const maybeAutoGreet = () => {
      if (canHover || autoGreeted || !s.visible) return;
      if (play('greet')) autoGreeted = true;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      draw(performance.now());
    };

    // Cursor picks a zone; the character never follows the cursor directly.
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = section.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const zone = x < HERO.zones.left ? 'left' : x > HERO.zones.right ? 'right' : 'center';
      if (zone === committedZone) {
        clearTimeout(zoneTimer);
        pendingZone = null;
        return;
      }
      if (zone === pendingZone) return;
      clearTimeout(zoneTimer);
      pendingZone = zone;
      zoneTimer = setTimeout(() => {
        committedZone = zone;
        pendingZone = null;
        play(zone === 'center' ? 'greet' : zone);
      }, HERO.zoneDebounceMs);
    };

    const onLeave = () => {
      clearTimeout(zoneTimer);
      committedZone = null;
      pendingZone = null;
    };

    const onTap = () => play('greet');
    const onVisibility = () => {
      if (document.hidden) audioRef.current?.pause();
      else start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible) {
          start();
          maybeAutoGreet();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(section);
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onTap);
    document.addEventListener('visibilitychange', onVisibility);

    (async () => {
      const { idle, greet, left, right } = HERO.segments;

      if (reduced) {
        // One still frame: the final greeting pose, or the first idle frame.
        s.poster = (greet.count && (await loadImage(frameUrl('greet', greet.count - 1)))) ||
          (await loadImage(frameUrl('idle', 0)));
        if (!cancelled) draw(performance.now());
        return;
      }

      s.poster = await loadImage(frameUrl('idle', 0));
      if (cancelled) return;
      draw(performance.now());

      frames.idle = await loadSegment('idle', idle.count);
      if (cancelled || !frames.idle[0]) return;
      s.mode = 'idle';
      start();

      for (const [name, seg] of [['greet', greet], ['left', left], ['right', right]]) {
        if (!seg?.count) continue;
        const loaded = await loadSegment(name, seg.count);
        if (cancelled) return;
        if (loaded[0]) frames[name] = loaded;
        if (name === 'greet') maybeAutoGreet();
      }
    })();

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      cancelAnimationFrame(raf);
      clearTimeout(zoneTimer);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onTap);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!hasSound) return;
    const audio = new Audio(HERO.sound.src);
    audio.preload = 'auto';
    audio.volume = HERO.sound.volume ?? 0.8;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [hasSound]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundOnRef.current = next;
    if (next) greetNowRef.current(); // greet right away so the visitor hears it
    else audioRef.current?.pause();
  };

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-media">
        <div className="hero-stage">
          <canvas ref={canvasRef} className="hero-canvas" role="img" aria-label={HERO.alt} />
        </div>
        {hasSound && !reducedMotion && (
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={soundOn}
            onClick={toggleSound}
          >
            {soundOn ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                <path d="M17 9.5l5 5M22 9.5l-5 5" fill="none" />
              </svg>
            )}
            <span>{soundOn ? 'Turn sound off' : 'Turn sound on'}</span>
          </button>
        )}
      </div>
      <div className="hero-copy">{children}</div>
    </section>
  );
}
