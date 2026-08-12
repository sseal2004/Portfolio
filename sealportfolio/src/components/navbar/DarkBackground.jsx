import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * DarkBackground
 * ---------------------------------------------------------------
 * A hardcoded (no video file) replacement for dark_bg.mp4, rebuilt
 * in Three.js: a dense field of glowing amber embers, tumbling
 * angular "glass" shards catching light, a diagonal volumetric
 * light ray, and — new — a yellow/orange network-graph layer:
 * drifting nodes that connect with pulsing lines whenever they
 * pass near each other, like a live constellation of data.
 *
 * Performance notes:
 * - Particle/node counts scale down on small/low-power screens.
 * - The render loop pauses completely when the tab is hidden.
 * - Respects prefers-reduced-motion (renders one static frame).
 * - Renderer pixel ratio capped at 1.75 to protect fill-rate.
 * - Embers: 1 draw call (points). Shards: 1 draw call (instanced).
 *   Network: 2 draw calls (points + line segments). Five total.
 */

const EMBER_VERT = `
  attribute float aSize;
  attribute float aSeed;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.45 + 0.55 * sin(uTime * (1.1 + aSpeed) + aSeed * 17.0);
    float flare = smoothstep(0.965, 1.0, sin(uTime * 0.35 + aSeed * 41.0));
    vAlpha = clamp(tw + flare * 1.4, 0.0, 1.6);
    vSeed = aSeed;
    gl_PointSize = aSize * uPixelRatio * (260.0 / -mvPosition.z) * (1.0 + flare * 0.9);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const EMBER_FRAG = `
  uniform sampler2D uTexture;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(tex.rgb, clamp(tex.a * vAlpha, 0.0, 1.0));
  }
`;

const NODE_VERT = `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float pulse = 0.55 + 0.45 * sin(uTime * 1.6 + aSeed * 23.0);
    vAlpha = pulse;
    gl_PointSize = aSize * uPixelRatio * (260.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const NODE_FRAG = `
  uniform sampler2D uTexture;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(tex.rgb, clamp(tex.a * vAlpha, 0.0, 1.0));
  }
`;

function createEmberTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,245,222,1)');
  grad.addColorStop(0.12, 'rgba(255,205,130,0.95)');
  grad.addColorStop(0.38, 'rgba(255,140,45,0.5)');
  grad.addColorStop(0.75, 'rgba(255,90,20,0.12)');
  grad.addColorStop(1, 'rgba(255,60,10,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createShardTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(255,235,195,0.95)');
  grad.addColorStop(0.45, 'rgba(255,150,60,0.55)');
  grad.addColorStop(1, 'rgba(90,30,8,0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, 4);
  ctx.lineTo(size - 4, size - 6);
  ctx.lineTo(4, size * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,210,0.85)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createRayTexture() {
  const w = 256;
  const h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(255,190,110,0.85)');
  grad.addColorStop(0.5, 'rgba(255,150,70,0.28)');
  grad.addColorStop(1, 'rgba(255,120,50,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const vgrad = ctx.createLinearGradient(0, 0, 0, h);
  vgrad.addColorStop(0, 'rgba(0,0,0,0)');
  vgrad.addColorStop(0.5, 'rgba(255,255,255,1)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createNodeTexture() {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,250,235,1)');
  grad.addColorStop(0.2, 'rgba(255,220,110,1)');
  grad.addColorStop(0.55, 'rgba(255,160,40,0.5)');
  grad.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function shardGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([0, 1, 0, 0.85, -0.6, 0, -0.75, -0.5, 0]);
  const uvs = new Float32Array([0.5, 1, 1, 0, 0, 0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

const BOUNDS = { x: 46, yTop: 32, yBottom: -32, zNear: 14, zFar: -34 };

// Network graph tuning
const NODE_LINK_DIST = 11;
const YELLOW = new THREE.Color(0xffe08a);
const ORANGE = new THREE.Color(0xff7a1a);

const DarkBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSmallScreen = window.innerWidth < 760;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200);
    camera.position.set(0, 0, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const emberTexture = createEmberTexture();
    const shardTexture = createShardTexture();
    const rayTexture = createRayTexture();
    const nodeTexture = createNodeTexture();

    const emberCountFor = (w, h) => {
      const area = w * h;
      const count = Math.round(area / (isSmallScreen ? 2600 : 1500));
      return Math.max(180, Math.min(count, isSmallScreen ? 420 : 950));
    };
    const shardCountFor = (w, h) => {
      const area = w * h;
      const count = Math.round(area / (isSmallScreen ? 26000 : 15000));
      return Math.max(18, Math.min(count, isSmallScreen ? 40 : 95));
    };
    const nodeCountFor = (w, h) => {
      const area = w * h;
      const count = Math.round(area / (isSmallScreen ? 22000 : 13000));
      return Math.max(24, Math.min(count, isSmallScreen ? 46 : 80));
    };

    let emberCount = emberCountFor(window.innerWidth, window.innerHeight);
    let shardCount = shardCountFor(window.innerWidth, window.innerHeight);
    let nodeCount = nodeCountFor(window.innerWidth, window.innerHeight);

    const spawnPoint = (arr, i) => {
      arr.pos[i * 3] = (Math.random() * 2 - 1) * BOUNDS.x;
      arr.pos[i * 3 + 1] = BOUNDS.yBottom + Math.random() * (BOUNDS.yTop - BOUNDS.yBottom);
      arr.pos[i * 3 + 2] = BOUNDS.zFar + Math.random() * (BOUNDS.zNear - BOUNDS.zFar);
    };

    // ---- Embers ----
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSizes = new Float32Array(emberCount);
    const emberSeeds = new Float32Array(emberCount);
    const emberSpeeds = new Float32Array(emberCount);
    const emberVel = new Float32Array(emberCount * 3);

    const emberStore = { pos: emberPositions };
    for (let i = 0; i < emberCount; i++) {
      spawnPoint(emberStore, i);
      const depth01 = (emberPositions[i * 3 + 2] - BOUNDS.zFar) / (BOUNDS.zNear - BOUNDS.zFar);
      emberSizes[i] = (0.5 + Math.random() * 1.6) * (0.4 + depth01 * 1.1);
      emberSeeds[i] = Math.random() * 100;
      emberSpeeds[i] = Math.random();
      emberVel[i * 3] = (Math.random() - 0.5) * 0.02;
      emberVel[i * 3 + 1] = 0.02 + Math.random() * 0.05;
      emberVel[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
    }

    const emberGeometry = new THREE.BufferGeometry();
    emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    emberGeometry.setAttribute('aSize', new THREE.BufferAttribute(emberSizes, 1));
    emberGeometry.setAttribute('aSeed', new THREE.BufferAttribute(emberSeeds, 1));
    emberGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(emberSpeeds, 1));

    const emberMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
        uTexture: { value: emberTexture },
      },
      vertexShader: EMBER_VERT,
      fragmentShader: EMBER_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const emberPoints = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(emberPoints);

    // ---- Glass shards ----
    const shardMesh = new THREE.InstancedMesh(
      shardGeometry(),
      new THREE.MeshBasicMaterial({
        map: shardTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
      shardCount
    );
    scene.add(shardMesh);

    const dummy = new THREE.Object3D();
    const shardData = [];
    for (let i = 0; i < shardCount; i++) {
      const store = { pos: new Float32Array(3) };
      spawnPoint(store, 0);
      const depth01 = (store.pos[2] - BOUNDS.zFar) / (BOUNDS.zNear - BOUNDS.zFar);
      shardData.push({
        x: store.pos[0],
        y: store.pos[1],
        z: store.pos[2],
        vx: (Math.random() - 0.5) * 0.015,
        vy: 0.015 + Math.random() * 0.035,
        vz: (Math.random() - 0.5) * 0.004,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        rvx: (Math.random() - 0.5) * 0.012,
        rvy: (Math.random() - 0.5) * 0.012,
        rvz: (Math.random() - 0.5) * 0.018,
        scale: (1.1 + Math.random() * 2.6) * (0.5 + depth01),
      });
    }

    // ---- Volumetric ray ----
    const rayGroup = new THREE.Group();
    const rayConfigs = [
      { w: 90, h: 14, x: -18, y: 14, rot: -0.62, opacity: 0.5 },
      { w: 70, h: 9, x: -14, y: 10, rot: -0.55, opacity: 0.35 },
      { w: 110, h: 20, x: -22, y: 16, rot: -0.68, opacity: 0.22 },
    ];
    rayConfigs.forEach((cfg) => {
      const geo = new THREE.PlaneGeometry(cfg.w, cfg.h);
      const mat = new THREE.MeshBasicMaterial({
        map: rayTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        opacity: cfg.opacity,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.x, cfg.y, -10);
      mesh.rotation.z = cfg.rot;
      mesh.userData.baseOpacity = cfg.opacity;
      rayGroup.add(mesh);
    });
    scene.add(rayGroup);

    const glowTexture = createEmberTexture();
    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
      })
    );
    glowSprite.scale.set(50, 50, 1);
    glowSprite.position.set(-20, 16, -8);
    scene.add(glowSprite);

    // ---- Network graph: nodes ----
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeSizes = new Float32Array(nodeCount);
    const nodeSeeds = new Float32Array(nodeCount);
    const nodeVel = new Float32Array(nodeCount * 3);

    const nodeStore = { pos: nodePositions };
    for (let i = 0; i < nodeCount; i++) {
      spawnPoint(nodeStore, i);
      nodePositions[i * 3 + 2] = -6 + Math.random() * 14; // keep nodes mid-depth, readable
      nodeSizes[i] = 2.4 + Math.random() * 2.2;
      nodeSeeds[i] = Math.random() * 100;
      nodeVel[i * 3] = (Math.random() - 0.5) * 0.028;
      nodeVel[i * 3 + 1] = (Math.random() - 0.5) * 0.028;
      nodeVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('aSize', new THREE.BufferAttribute(nodeSizes, 1));
    nodeGeometry.setAttribute('aSeed', new THREE.BufferAttribute(nodeSeeds, 1));

    const nodeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
        uTexture: { value: nodeTexture },
      },
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodePoints);

    // ---- Network graph: connecting lines ----
    const maxLinks = nodeCount * 6;
    const linkPositions = new Float32Array(maxLinks * 2 * 3);
    const linkColors = new Float32Array(maxLinks * 2 * 3);

    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3).setUsage(THREE.DynamicDrawUsage));
    linkGeometry.setAttribute('color', new THREE.BufferAttribute(linkColors, 3).setUsage(THREE.DynamicDrawUsage));
    linkGeometry.setDrawRange(0, 0);

    const linkMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    });

    const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial);
    scene.add(linkLines);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const pr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h);
      emberMaterial.uniforms.uPixelRatio.value = pr;
      nodeMaterial.uniforms.uPixelRatio.value = pr;
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0, y: 0 };
    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove);

    let rafRef = null;
    let elapsed = 0;
    let lastTime = performance.now();
    const camTarget = { x: 0, y: 0 };
    const mixColor = new THREE.Color();

    const renderStatic = () => {
      emberMaterial.uniforms.uTime.value = 0;
      nodeMaterial.uniforms.uTime.value = 0;
      renderer.render(scene, camera);
    };

    const step = (now) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      elapsed += dt;
      const t = elapsed * 0.001;
      const dtFactor = dt / 16.7;

      emberMaterial.uniforms.uTime.value = t;
      nodeMaterial.uniforms.uTime.value = t;

      const posAttr = emberGeometry.attributes.position;
      for (let i = 0; i < emberCount; i++) {
        const ix = i * 3;
        emberPositions[ix] += emberVel[ix] * dtFactor + Math.sin(t * 0.3 + emberSeeds[i]) * 0.004;
        emberPositions[ix + 1] += emberVel[ix + 1] * dtFactor;
        emberPositions[ix + 2] += emberVel[ix + 2] * dtFactor;
        if (emberPositions[ix + 1] > BOUNDS.yTop) {
          emberPositions[ix + 1] = BOUNDS.yBottom;
          emberPositions[ix] = (Math.random() * 2 - 1) * BOUNDS.x;
        }
        if (emberPositions[ix] > BOUNDS.x) emberPositions[ix] = -BOUNDS.x;
        if (emberPositions[ix] < -BOUNDS.x) emberPositions[ix] = BOUNDS.x;
      }
      posAttr.needsUpdate = true;

      for (let i = 0; i < shardCount; i++) {
        const s = shardData[i];
        s.x += s.vx * dtFactor;
        s.y += s.vy * dtFactor;
        s.z += s.vz * dtFactor;
        s.rx += s.rvx * dtFactor;
        s.ry += s.rvy * dtFactor;
        s.rz += s.rvz * dtFactor;
        if (s.y > BOUNDS.yTop) {
          s.y = BOUNDS.yBottom;
          s.x = (Math.random() * 2 - 1) * BOUNDS.x;
        }
        if (s.x > BOUNDS.x) s.x = -BOUNDS.x;
        if (s.x < -BOUNDS.x) s.x = BOUNDS.x;

        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.set(s.rx, s.ry, s.rz);
        const flicker = 0.85 + 0.3 * Math.sin(t * 1.4 + i * 3.1);
        dummy.scale.setScalar(s.scale * flicker);
        dummy.updateMatrix();
        shardMesh.setMatrixAt(i, dummy.matrix);
      }
      shardMesh.instanceMatrix.needsUpdate = true;

      rayGroup.children.forEach((mesh, idx) => {
        mesh.material.opacity = mesh.userData.baseOpacity * (0.75 + 0.25 * Math.sin(t * 0.4 + idx * 2));
        mesh.rotation.z += Math.sin(t * 0.15 + idx) * 0.00015;
      });
      glowSprite.material.opacity = 0.4 + 0.15 * Math.sin(t * 0.6);

      // -- update network nodes --
      const nPosAttr = nodeGeometry.attributes.position;
      for (let i = 0; i < nodeCount; i++) {
        const ix = i * 3;
        nodePositions[ix] += nodeVel[ix] * dtFactor;
        nodePositions[ix + 1] += nodeVel[ix + 1] * dtFactor;
        nodePositions[ix + 2] += nodeVel[ix + 2] * dtFactor;
        if (nodePositions[ix] > BOUNDS.x || nodePositions[ix] < -BOUNDS.x) nodeVel[ix] *= -1;
        if (nodePositions[ix + 1] > BOUNDS.yTop || nodePositions[ix + 1] < BOUNDS.yBottom) nodeVel[ix + 1] *= -1;
        if (nodePositions[ix + 2] > 8 || nodePositions[ix + 2] < -6) nodeVel[ix + 2] *= -1;
      }
      nPosAttr.needsUpdate = true;

      // -- rebuild network links each frame (nodeCount is small, brute force is cheap) --
      let linkVertex = 0;
      for (let i = 0; i < nodeCount && linkVertex < maxLinks * 2; i++) {
        const ix = i * 3;
        for (let j = i + 1; j < nodeCount && linkVertex < maxLinks * 2; j++) {
          const jx = j * 3;
          const dx = nodePositions[ix] - nodePositions[jx];
          const dy = nodePositions[ix + 1] - nodePositions[jx + 1];
          const dz = nodePositions[ix + 2] - nodePositions[jx + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < NODE_LINK_DIST) {
            const strength = 1 - dist / NODE_LINK_DIST;
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i * 7.3 + j * 3.1);
            mixColor.copy(ORANGE).lerp(YELLOW, strength);
            mixColor.multiplyScalar(strength * (0.35 + 0.65 * pulse));

            const a = linkVertex * 3;
            const b = a + 3;
            linkPositions[a] = nodePositions[ix];
            linkPositions[a + 1] = nodePositions[ix + 1];
            linkPositions[a + 2] = nodePositions[ix + 2];
            linkPositions[b] = nodePositions[jx];
            linkPositions[b + 1] = nodePositions[jx + 1];
            linkPositions[b + 2] = nodePositions[jx + 2];

            linkColors[a] = mixColor.r;
            linkColors[a + 1] = mixColor.g;
            linkColors[a + 2] = mixColor.b;
            linkColors[b] = mixColor.r;
            linkColors[b + 1] = mixColor.g;
            linkColors[b + 2] = mixColor.b;

            linkVertex += 2;
          }
        }
      }
      linkGeometry.setDrawRange(0, linkVertex);
      linkGeometry.attributes.position.needsUpdate = true;
      linkGeometry.attributes.color.needsUpdate = true;

      camTarget.x = mouse.x * 4 + Math.sin(t * 0.08) * 2;
      camTarget.y = -mouse.y * 3 + Math.cos(t * 0.06) * 1.4;
      camera.position.x += (camTarget.x - camera.position.x) * 0.02;
      camera.position.y += (camTarget.y - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

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
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (rafRef) cancelAnimationFrame(rafRef);

      emberGeometry.dispose();
      emberMaterial.dispose();
      emberTexture.dispose();
      shardMesh.geometry.dispose();
      shardMesh.material.dispose();
      shardTexture.dispose();
      rayGroup.children.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      rayTexture.dispose();
      glowSprite.material.dispose();
      glowTexture.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      nodeTexture.dispose();
      linkGeometry.dispose();
      linkMaterial.dispose();
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
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Soft blurred glow shapes — yellow/orange "shadow" blobs sitting
          above the WebGL canvas. Pure CSS (radial-gradient + blur), so
          they cost nothing on the render loop and don't touch Three.js.
          Each one slowly breathes in scale/opacity via the keyframes
          below, so the glow feels alive instead of pasted on. */}
      <style>{`
        @keyframes dbgGlowPulseA {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes dbgGlowPulseB {
          0%, 100% { opacity: 0.75; transform: scale(1.05); }
          50% { opacity: 1; transform: scale(0.95); }
        }
        @keyframes dbgGlowPulseC {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 0.95; transform: scale(1.08); }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          top: '-16%',
          left: '-12%',
          width: '60%',
          height: '60%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,205,95,0.4) 0%, rgba(255,205,95,0.22) 35%, rgba(255,205,95,0) 75%)',
          filter: 'blur(110px)',
          mixBlendMode: 'screen',
          animation: 'dbgGlowPulseA 7s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-18%',
          right: '-10%',
          width: '62%',
          height: '62%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,110,20,0.48) 0%, rgba(255,110,20,0) 70%)',
          filter: 'blur(85px)',
          mixBlendMode: 'screen',
          animation: 'dbgGlowPulseB 9s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '52%',
          width: '46%',
          height: '46%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,224,150,0.34) 0%, rgba(255,224,150,0) 75%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
          animation: 'dbgGlowPulseC 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '8%',
          width: '32%',
          height: '32%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,160,50,0.32) 0%, rgba(255,160,50,0) 72%)',
          filter: 'blur(55px)',
          mixBlendMode: 'screen',
          animation: 'dbgGlowPulseA 10s ease-in-out infinite',
        }}
      />

      {/* Yellow/orange contrast pass — layered overlay-blended gradients
          that punch warm tones into highlights and deepen the shadows,
          rather than sitting flatly on top like a tint. Two passes for
          more separation between the amber and orange ends. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(255,210,100,0.34) 0%, rgba(255,120,30,0.22) 45%, rgba(0,0,0,0.4) 100%)',
          mixBlendMode: 'overlay',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 20% 20%, rgba(255,230,160,0.28) 0%, rgba(255,230,160,0) 45%), radial-gradient(ellipse at 80% 85%, rgba(255,90,20,0.26) 0%, rgba(255,90,20,0) 50%)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 12% 15%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};

export default DarkBackground;