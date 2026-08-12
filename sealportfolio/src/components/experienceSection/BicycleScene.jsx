import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * BicycleScene
 * ---------------------------------------------------------------
 * A small, stylized wireframe bicycle — built entirely from Three.js
 * primitives, no model file — that rides across the section on a
 * loop. Wheels actually rotate at a speed derived from travel speed
 * (rolling, not sliding), the pedals spin, and the whole thing glows
 * via additive-blended sprite halos plus a fading dust trail behind
 * each wheel.
 *
 * Color language:
 * - Dark mode: everything reads in one cool cyan glow.
 * - Light mode: the bike splits its accent — pink at the back,
 *   blue at the front — so as it rides across, the palette itself
 *   feels like it's in motion.
 *
 * This is a decorative layer only: aria-hidden, pointer-events none,
 * absolutely positioned to sit behind real content.
 *
 * Performance / accessibility, same philosophy as the other
 * background pieces in this project:
 * - Orthographic camera keyed to the container's own pixel size, so
 *   the bike is sized consistently across breakpoints instead of
 *   fighting perspective distortion.
 * - Render loop pauses when the tab is hidden.
 * - Respects prefers-reduced-motion: renders one static frame with
 *   the bike parked mid-scene, wheels un-rotated.
 * - Watches for OS color-scheme changes live (no reload needed) via
 *   a matchMedia listener, same pattern used elsewhere in this app.
 */

const PX_PER_UNIT = 62; // world-unit scale: 1 three.js unit ≈ this many CSS px
const WHEEL_RADIUS = 1.15;

function createGlowTexture(hex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(hex);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.45)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// A thin cylinder stretched + rotated to connect two 2D points — the
// building block for every straight "tube" in the frame.
function makeTube(p1, p2, radius, material) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  const geo = new THREE.CylinderGeometry(radius, radius, length, 8);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, 0);
  mesh.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
  return mesh;
}

function buildBicycle({ frontColor, rearColor }) {
  const group = new THREE.Group();

  const frontMat = new THREE.MeshBasicMaterial({ color: frontColor });
  const rearMat = new THREE.MeshBasicMaterial({ color: rearColor });
  const neutralMat = new THREE.MeshBasicMaterial({ color: frontColor });

  // ---- geometry keypoints (bike-space, +x = front of bike) ----
  const rearAxle = [-1.55, WHEEL_RADIUS];
  const frontAxle = [1.55, WHEEL_RADIUS];
  const bottomBracket = [-0.35, 0.55];
  const seatTop = [-1.05, WHEEL_RADIUS + 1.35];
  const headTube = [1.05, WHEEL_RADIUS + 0.95];
  const handlebar = [1.35, WHEEL_RADIUS + 1.55];

  const tubeR = 0.045;

  // rear triangle — tinted with rearColor
  group.add(makeTube(rearAxle, bottomBracket, tubeR, rearMat)); // chainstay
  group.add(makeTube(bottomBracket, seatTop, tubeR, rearMat)); // seat tube
  group.add(makeTube(seatTop, rearAxle, tubeR, rearMat)); // seat stay

  // front triangle + fork — tinted with frontColor
  group.add(makeTube(bottomBracket, headTube, tubeR, frontMat)); // down tube
  group.add(makeTube(seatTop, headTube, tubeR, frontMat)); // top tube
  group.add(makeTube(headTube, frontAxle, tubeR, frontMat)); // fork
  group.add(makeTube(headTube, handlebar, tubeR * 0.9, frontMat)); // stem

  // handlebar bar (small vertical-ish tube through the handlebar point)
  group.add(
    makeTube(
      [handlebar[0] - 0.16, handlebar[1] + 0.05],
      [handlebar[0] + 0.16, handlebar[1] - 0.05],
      tubeR * 0.8,
      frontMat
    )
  );

  // seat (tiny elongated box above seatTop)
  const seatGeo = new THREE.BoxGeometry(0.28, 0.07, 0.14);
  const seat = new THREE.Mesh(seatGeo, rearMat);
  seat.position.set(seatTop[0] - 0.05, seatTop[1] + 0.08, 0);
  group.add(seat);

  // ---- wheels (each its own group so it can spin independently) ----
  const makeWheel = (mat) => {
    const wheelGroup = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_RADIUS, 0.045, 8, 28), mat);
    wheelGroup.add(rim);
    const spokeCount = 5;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, WHEEL_RADIUS * 1.9, 5), mat);
      spoke.rotation.z = angle;
      wheelGroup.add(spoke);
    }
    return wheelGroup;
  };

  const rearWheel = makeWheel(rearMat);
  rearWheel.position.set(rearAxle[0], rearAxle[1], 0);
  const frontWheel = makeWheel(frontMat);
  frontWheel.position.set(frontAxle[0], frontAxle[1], 0);
  group.add(rearWheel, frontWheel);

  // ---- crank / pedals at the bottom bracket ----
  const crankGroup = new THREE.Group();
  crankGroup.position.set(bottomBracket[0], bottomBracket[1], 0);
  const crankArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 6), neutralMat);
  crankArm.rotation.z = Math.PI / 2;
  crankGroup.add(crankArm);
  const pedalA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.16), neutralMat);
  pedalA.position.set(0.31, 0, 0);
  const pedalB = pedalA.clone();
  pedalB.position.set(-0.31, 0, 0);
  crankGroup.add(pedalA, pedalB);
  group.add(crankGroup);

  return { group, rearWheel, frontWheel, crankGroup };
}

const BicycleScene = ({ className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let isDark = darkQuery.matches;

    const scene = new THREE.Scene();

    let width = container.clientWidth;
    let height = container.clientHeight;

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const CYAN = 0x22d3ee;
    const PINK = 0xf472b6;
    const BLUE = 0x38bdf8;

    const colorsFor = (dark) =>
      dark ? { front: CYAN, rear: CYAN, trail: CYAN } : { front: BLUE, rear: PINK, trail: PINK };

    let colors = colorsFor(isDark);

    let bike = buildBicycle({ frontColor: colors.front, rearColor: colors.rear });
    scene.add(bike.group);

    // halo behind the bike, additive-blended so it reads as glow, not a flat disc
    let glowTexture = createGlowTexture(colors.trail);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })
    );
    halo.scale.set(6.5, 4.2, 1);
    halo.position.set(0.2, WHEEL_RADIUS + 0.6, -0.5);
    scene.add(halo);

    // dust/spark trail: a small pool of sprites recycled over time
    const TRAIL_COUNT = 22;
    let trailTexture = createGlowTexture(colors.trail);
    const trailMaterial = new THREE.SpriteMaterial({
      map: trailTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const trailSprites = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const s = new THREE.Sprite(trailMaterial);
      s.scale.set(0, 0, 1);
      s.userData = { life: 0, active: false };
      scene.add(s);
      trailSprites.push(s);
    }
    let trailCursor = 0;

    const rebuildForTheme = (dark) => {
      isDark = dark;
      colors = colorsFor(isDark);

      scene.remove(bike.group);
      bike.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      bike = buildBicycle({ frontColor: colors.front, rearColor: colors.rear });
      scene.add(bike.group);
      bike.group.position.set(bikeX, bikeBaseY, 0);

      glowTexture.dispose();
      glowTexture = createGlowTexture(colors.trail);
      halo.material.map = glowTexture;
      halo.material.needsUpdate = true;

      trailTexture.dispose();
      trailTexture = createGlowTexture(colors.trail);
      trailMaterial.map = trailTexture;
      trailMaterial.needsUpdate = true;
    };

    const handleSchemeChange = (e) => rebuildForTheme(e.matches);
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', handleSchemeChange);
    else if (darkQuery.addListener) darkQuery.addListener(handleSchemeChange);

    let halfW = 1;
    let halfH = 1;
    let bikeBaseY = 0;
    let bikeX = 0;
    let travelSpan = 10;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      halfW = width / (2 * PX_PER_UNIT);
      halfH = height / (2 * PX_PER_UNIT);

      camera.left = -halfW;
      camera.right = halfW;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      bikeBaseY = -halfH * 0.42;
      travelSpan = halfW + 3;
      bike.group.position.y = bikeBaseY;
      halo.position.y = bikeBaseY + WHEEL_RADIUS + 0.6;
    };

    resize();
    window.addEventListener('resize', resize);

    bikeX = -travelSpan;
    bike.group.position.set(bikeX, bikeBaseY, 0);

    const SPEED = 1.7; // world units per second
    let lastTime = performance.now();
    let rafRef = null;
    let elapsed = 0;

    const spawnTrailParticle = (wx, wy) => {
      const s = trailSprites[trailCursor];
      trailCursor = (trailCursor + 1) % TRAIL_COUNT;
      s.position.set(wx, wy, -0.2);
      s.userData.life = 1;
      s.userData.active = true;
      const startScale = 0.35 + Math.random() * 0.2;
      s.userData.startScale = startScale;
      s.scale.set(startScale, startScale, 1);
      s.material.opacity = 0.75;
    };

    const renderStatic = () => {
      bike.group.position.set(0, bikeBaseY, 0);
      renderer.render(scene, camera);
    };

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      bikeX += SPEED * dt;
      if (bikeX > travelSpan) bikeX = -travelSpan;

      const bob = Math.sin(elapsed * 9) * 0.035;
      bike.group.position.set(bikeX, bikeBaseY + bob, 0);
      bike.group.rotation.z = Math.sin(elapsed * 9) * 0.012;

      const wheelSpin = (SPEED * dt) / WHEEL_RADIUS;
      bike.rearWheel.rotation.z -= wheelSpin * 4.2;
      bike.frontWheel.rotation.z -= wheelSpin * 4.2;
      bike.crankGroup.rotation.z -= wheelSpin * 2.4;

      halo.position.x = bikeX + 0.2;
      halo.material.opacity = 0.45 + 0.15 * Math.sin(elapsed * 2.2);

      if (Math.random() < 0.55) {
        spawnTrailParticle(
          bikeX - 1.6 + (Math.random() - 0.5) * 0.2,
          bikeBaseY + 0.15 + (Math.random() - 0.5) * 0.15
        );
      }

      trailSprites.forEach((s) => {
        if (!s.userData.active) return;
        s.userData.life -= dt * 1.1;
        if (s.userData.life <= 0) {
          s.userData.active = false;
          s.scale.set(0, 0, 1);
          return;
        }
        const t = s.userData.life;
        s.material.opacity = t * 0.6;
        const sc = s.userData.startScale * (1.6 - t * 0.6);
        s.scale.set(sc, sc, 1);
        s.position.x -= dt * 0.4;
      });

      renderer.render(scene, camera);
      rafRef = requestAnimationFrame(step);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef) cancelAnimationFrame(rafRef);
        rafRef = null;
      } else if (!prefersReducedMotion && !rafRef) {
        lastTime = performance.now();
        rafRef = requestAnimationFrame(step);
      }
    };

    if (prefersReducedMotion) {
      renderStatic();
    } else {
      rafRef = requestAnimationFrame(step);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (darkQuery.removeEventListener) darkQuery.removeEventListener('change', handleSchemeChange);
      else if (darkQuery.removeListener) darkQuery.removeListener(handleSchemeChange);
      if (rafRef) cancelAnimationFrame(rafRef);

      bike.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      trailSprites.forEach((s) => scene.remove(s));
      trailMaterial.dispose();
      trailTexture.dispose();
      halo.material.dispose();
      glowTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  );
};

export default BicycleScene;