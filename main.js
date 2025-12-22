import * as THREE from "./assets/lib.three.js";
import { OrbitControls } from "./assets/lib.orbit.js";
import { GLTFLoader } from "./assets/lib.loader.js";

const config = {
  modelUrl: "./assets/yin.glb",
  rotationSpeed: 0.6,
  colors: {
    white: 0xffffff,
    black: 0x000000,
  },
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  22,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2.5, 7);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enablePan = false;

// scene.add( new THREE.AmbientLight( 0x404040, 20 ) );
// scene.add(new THREE.AmbientLight(0xffffff, 0.95));

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(4, 6, 4);
keyLight.castShadow = true;

keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -4;
keyLight.shadow.camera.right = 4;
keyLight.shadow.camera.top = 4;
keyLight.shadow.camera.bottom = -4;

scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(-4, 2, -4);
scene.add(rimLight);

const whiteGroup = new THREE.Group();
const blackGroup = new THREE.Group();

scene.add(whiteGroup, blackGroup);

const loader = new GLTFLoader();

loader.load(config.modelUrl, (gltf) => {
  const half = gltf.scene;

  half.traverse((n) => {
    if (!n.isMesh) return;

    n.castShadow = true;
    n.receiveShadow = true;

    n.material = new THREE.MeshStandardMaterial({
      color: config.colors.white,
      //   roughness: 0.85,
      metalness: 0.9,
    });
  });

  const mirrored = half.clone(true);
  mirrored.traverse((n) => {
    if (!n.isMesh) return;

    n.material = n.material.clone();
    n.material.color.set(config.colors.black);
  });

  // Rotate the mirrored half to complete the symbol
  mirrored.rotation.y = Math.PI;

  whiteGroup.add(half);
  blackGroup.add(mirrored);

  // Align both halves once
  whiteGroup.rotation.x = Math.PI / 2;
  blackGroup.rotation.x = Math.PI / 2;

  blackGroup.rotation.z = Math.PI / 2;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const spin = clock.getDelta() * config.rotationSpeed;

  whiteGroup.rotation.y -= spin;
  blackGroup.rotation.x += spin;

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
