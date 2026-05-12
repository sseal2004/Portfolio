import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function initBee(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 🌟 Brighter, warmer lighting setup
  const light = new THREE.DirectionalLight(0xfff8cc, 1.2);
  light.position.set(5, 10, 7);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xfff6e0, 0.5);
  scene.add(ambientLight);

  let bee = null;
  let mixer = null; // 🐝 Animation mixer
  const clock = new THREE.Clock();

  const loader = new GLTFLoader();
  loader.load("/animated_flying_fluttering_butterfly.glb", (gltf) => {
    bee = gltf.scene;
    bee.scale.set(1.0, 1.0, 1.0); // 🐝 slightly bigger
    scene.add(bee);

    // 🌟 Make bee colors richer & shinier
    bee.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = new THREE.Color(0x222200);
        child.material.emissiveIntensity = 0.25;
        child.material.metalness = 0.6; // shiny look
        child.material.roughness = 0.35; // smoother reflections
        child.material.needsUpdate = true;
      }
    });

    // 🎬 Setup animations
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bee);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  });

  // 🎯 Track target mouse position
  let targetX = 0,
    targetY = 0;

  const handleMouseMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetX = x * 5;
    targetY = y * 3;
  };
  window.addEventListener("mousemove", handleMouseMove);

  // 📱 Handle mobile resize
  const handleResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Pull camera back a bit on small screens
    if (window.innerWidth < 768) {
      camera.position.z = 12;
      if (bee) {
        bee.position.set(0, -0.5, 0); // adjust bee slightly lower/centered for mobile
      }
    } else {
      camera.position.z = 10;
      if (bee) {
        bee.position.set(0, 0, 0); // reset for desktop
      }
    }
  };
  window.addEventListener("resize", handleResize);
  handleResize(); // run once initially

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (bee) {
      // 🐝 Smooth position follow
      bee.position.x += (targetX - bee.position.x) * 0.06;
      bee.position.y += (targetY - bee.position.y) * 0.06;

      // 🐝 Smooth rotation follow with quaternion slerp (realistic turns)
      const targetRotY = targetX * 0.2; // lean left/right
      const targetRotX = targetY * 0.2; // tilt up/down
      const targetRotZ = targetX * -0.06; // subtle roll

      const targetQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(targetRotX, targetRotY, targetRotZ, "XYZ")
      );

      bee.quaternion.slerp(targetQuaternion, 0.1); // smoother interpolation
    }

    renderer.render(scene, camera);
  }
  animate();

  // Cleanup
  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", handleResize);
    container.removeChild(renderer.domElement);
  };
}
