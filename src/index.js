import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from "three/addons";

const SECRET_CODE = [1, 1, 1];
let isUnlocked = false;

// SCENE & RENDER
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.08);
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 1, 4.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setAnimationLoop( animate );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2.5;
controls.maxDistance = 5;
controls.enablePan = false;
controls.rotateSpeed = 0.5;
controls.update();

// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
frontLight.position.set(0, 2, 8);
scene.add(frontLight);

const safeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a5c63,
    roughness: 0.55,
    metalness: 0.7
});

const darkMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3c42,
    roughness: 0.7,
    metalness: 0.5
});

const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9,
    side: THREE.DoubleSide
});

// OBJECTS
const envGroup = new THREE.Group();
scene.add(envGroup);

// Pedestal
const pedestalGeometry = new THREE.BoxGeometry(3.5, 2, 2.5);
const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1c23, roughness: 0.9, metalness: 0.1 });
const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestal.position.set(0, -2.3, 0);
pedestal.receiveShadow = true;
pedestal.castShadow = true;
envGroup.add(pedestal);

// floor
const floorGeometry = new THREE.PlaneGeometry(40, 40);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.5 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.3;
floor.receiveShadow = true;
envGroup.add(floor);

// wall
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 1.0 });
const Wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMaterial);
Wall.position.set(0, 5, -5);
Wall.receiveShadow = true;
envGroup.add(Wall);

// neon
const neonColor = 0x0077ff;
const wallLight1 = new THREE.PointLight(neonColor, 4, 15);
wallLight1.position.set(-3, -2, -3);
envGroup.add(wallLight1);

const wallLight2 = new THREE.PointLight(neonColor, 4, 15);
wallLight2.position.set(3, -2, -3);
envGroup.add(wallLight2);

const laserGeometry = new THREE.CylinderGeometry(0.008, 0.008, 20, 8);
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.7 });

for(let i = 0; i < 8; i++) {
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 0.5,
        (Math.random() - 0.5) * 8 + 2
    );
    // Orientations aléatoires
    laser.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    envGroup.add(laser);
}

// safe
const safeGroup = new THREE.Group();
scene.add(safeGroup);

const t = 0.2; // Épaisseur des murs
const w = 2.4, h = 2.8, d = 2.0;

const wallGeoSides = new RoundedBoxGeometry(t, h, d, 4, 0.02);
const wallGeoTopBottom = new RoundedBoxGeometry(w - 2*t, t, d, 4, 0.02);
const wallGeoBack = new RoundedBoxGeometry(w - 2*t, h - 2*t, t, 4, 0.02);

const leftWall = new THREE.Mesh(wallGeoSides, safeMaterial);
leftWall.position.set(-w/2 + t/2, 0, 0);
leftWall.castShadow = true; leftWall.receiveShadow = true;
safeGroup.add(leftWall);

const rightWall = new THREE.Mesh(wallGeoSides, safeMaterial);
rightWall.position.set(w/2 - t/2, 0, 0);
rightWall.castShadow = true; rightWall.receiveShadow = true;
safeGroup.add(rightWall);

const topWall = new THREE.Mesh(wallGeoTopBottom, safeMaterial);
topWall.position.set(0, h/2 - t/2, 0);
topWall.castShadow = true; topWall.receiveShadow = true;
safeGroup.add(topWall);

const bottomWall = new THREE.Mesh(wallGeoTopBottom, safeMaterial);
bottomWall.position.set(0, -h/2 + t/2, 0);
bottomWall.castShadow = true; bottomWall.receiveShadow = true;
safeGroup.add(bottomWall);

const backWall = new THREE.Mesh(wallGeoBack, darkMetalMaterial);
backWall.position.set(0, 0, -d/2 + t/2);
backWall.receiveShadow = true;
safeGroup.add(backWall);

const innerLight = new THREE.PointLight(0xffeeba, 2, 4);
innerLight.position.set(0, 0, -0.5);
safeGroup.add(innerLight);

const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.25, metalness: 0.8 });
const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.2, metalness: 0.8 });
const cashMaterial = new THREE.MeshStandardMaterial({ color: 0x85bb65, roughness: 0.9, metalness: 0.1 });

const ingotGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.15);
for (let y = 0; y < 4; y++) {
    const numIngots = 4 - y;
    for (let x = 0; x < numIngots; x++) {
        const ingot = new THREE.Mesh(ingotGeometry, goldMaterial);
        ingot.position.set(x * 0.32 - 0.6, -1.2 + 0.05 + y * 0.1, -0.4);
        ingot.castShadow = true; ingot.receiveShadow = true;
        safeGroup.add(ingot);
    }
}

for (let y = 0; y < 3; y++) {
    const numIngots = 3 - y;
    for (let x = 0; x < numIngots; x++) {
        const ingot = new THREE.Mesh(ingotGeometry, silverMaterial);
        ingot.position.set(x * 0.32 + 0.2, -1.2 + 0.05 + y * 0.1, -0.3);
        ingot.castShadow = true; ingot.receiveShadow = true;
        safeGroup.add(ingot);
    }
}

const cashGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.4);
for (let i = 0; i < 12; i++) {
    const cash = new THREE.Mesh(cashGeometry, cashMaterial);
    cash.position.set(
        (Math.random() - 0.5),
        -1.2 + 0.05 + (i % 4) * 0.1,
        (Math.random() - 0.5) * 0.3 + 0.2
    );
    cash.rotation.y = (Math.random() - 0.5) * Math.PI;
    cash.castShadow = true; cash.receiveShadow = true;
    safeGroup.add(cash);
}

const doorHinge = new THREE.Group();
doorHinge.position.set(-1.05, 0, 1);
scene.add(doorHinge);

const doorGeometry = new RoundedBoxGeometry(2.1, 2.5, 0.15, 4, 0.04);
const doorMesh = new THREE.Mesh(doorGeometry, safeMaterial);
doorMesh.position.set(1.05, 0, 0);
doorMesh.castShadow = true;
doorMesh.receiveShadow = true;
doorHinge.add(doorMesh);

const interactiveObjects = [];
const digitButtons = [];

const panelGeometry = new RoundedBoxGeometry(1.4, 0.9, 0.05, 2, 0.02);
const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
controlPanel.position.set(0, 0.35, 0.08);
doorMesh.add(controlPanel);

const screenGeometry = new THREE.PlaneGeometry(0.25, 0.35);
const arrowUpGeo = new THREE.BufferGeometry();
const upVertices = new Float32Array([
    -1, -1, 0,
    1, -1, 0,
    0, 1, 0
]);
arrowUpGeo.setAttribute('position', new THREE.BufferAttribute(upVertices, 3));
const arrowDownGeo = new THREE.BufferGeometry();
const downVertices = new Float32Array([
    -1, -1, 0,
    1, -1, 0,
    0, 1, 0
]);
arrowDownGeo.setAttribute('position', new THREE.BufferAttribute(downVertices, 3));
// const arrowUpGeo = new THREE.ConeGeometry(0.04, 0.08, 16);
// const arrowDownGeo = new THREE.ConeGeometry(0.04, 0.08, 16);
arrowDownGeo.rotateX(Math.PI);
const ledGeometry = new THREE.SphereGeometry(0.015, 16, 16);

for (let i = 0; i < 3; i++) {
    const xPos = (i - 1) * 0.4;

    const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(xPos, 0.40, 0.03);
    controlPanel.add(led);

    // L'écran d'affichage LCD
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a24 });
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(xPos, 0, 0.03);
    screenMesh.userData = { type: 'screen_digit', index: i, value: 1, status: 'NEUTRAL', ledMesh: led };

    updateButtonTexture(screenMesh);
    controlPanel.add(screenMesh);
    digitButtons.push(screenMesh);

    const btnUp = new THREE.Mesh(arrowUpGeo, chromeMaterial);
    btnUp.scale.set(0.05, 0.05, 0.05);
    btnUp.position.set(xPos, 0.26, 0.03);
    btnUp.userData = { type: 'static_up', targetIndex: i };
    controlPanel.add(btnUp);
    interactiveObjects.push(btnUp);

    const btnDown = new THREE.Mesh(arrowDownGeo, chromeMaterial);
    btnDown.scale.set(0.05, 0.05, 0.05);
    btnDown.position.set(xPos, -0.26, 0.03);
    btnDown.userData = { type: 'static_down', targetIndex: i };
    controlPanel.add(btnDown);
    interactiveObjects.push(btnDown);
}

const handleGroup = new THREE.Group();
handleGroup.position.set(0, -0.4, 0.1);
doorMesh.add(handleGroup);

const handleCenterGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
handleCenterGeometry.rotateX(Math.PI / 2);
const handleCenter = new THREE.Mesh(handleCenterGeometry, chromeMaterial);
handleCenter.position.set(0, -0.1, 0);
handleGroup.add(handleCenter);
interactiveObjects.push(handleCenter);
handleCenter.userData = { type: 'handle' };

const spokeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
const tipGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const radiusCenter = 0.12;
const spokeDistance = radiusCenter + 0.125;
const tipDistance = radiusCenter + 0.25;

for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;

    const spoke = new THREE.Mesh(spokeGeometry, chromeMaterial);
    spoke.rotation.z = angle - Math.PI / 2;
    spoke.position.x = Math.cos(angle) * spokeDistance;
    spoke.position.y = Math.sin(angle) * spokeDistance - 0.1;

    const tip = new THREE.Mesh(tipGeometry, chromeMaterial);
    tip.position.x = Math.cos(angle) * tipDistance;
    tip.position.y = Math.sin(angle) * tipDistance - 0.1;

    handleGroup.add(spoke);
    handleGroup.add(tip);

    spoke.userData = { type: 'handle' };
    tip.userData = { type: 'handle' };
    interactiveObjects.push(spoke);
    interactiveObjects.push(tip);
}

function updateButtonTexture(btn) {
    // Créer un canvas 2D si le bouton n'en a pas encore
    if (!btn.userData.canvas) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 128;
        btn.userData.canvas = canvas;
        btn.userData.texture = new THREE.CanvasTexture(canvas);
        btn.userData.texture.colorSpace = THREE.SRGBColorSpace;
        btn.material.map = btn.userData.texture;
    }

    const ctx = btn.userData.canvas.getContext('2d');
    const { value, status } = btn.userData;

    let bg = '#111111';
    if (status === 'CORRECT') bg = '#2ec4b6';
    else if (status === 'MISPLACED') bg = '#ff9f1c';
    else if (status === 'ABSENT') bg = '#e71d36';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 64, 128);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'Bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), 32, 64);

    btn.userData.texture.needsUpdate = true;
}

function validateCombination() {
    const currentCode = digitButtons.map(b => b.userData.value);
    const results = checkCode(currentCode, SECRET_CODE);

    let correctCount = 0;
    digitButtons.forEach((btn, index) => {
        btn.userData.status = results[index];
        updateButtonTexture(btn);

        const led = btn.userData.ledMesh;
        if (results[index] === 'CORRECT') {
            led.material.color.setHex(0x2ec4b6);
            correctCount++;
        }
        else if (results[index] === 'MISPLACED')
            led.material.color.setHex(0xff9f1c);
        else
            led.material.color.setHex(0xe71d36);
    });

    if (correctCount === SECRET_CODE.length)
        isUnlocked = true;
}

function checkCode(userCode, secretCode) {
    const result = new Array(userCode.length).fill('ABSENT');
    const secretUsed = new Array(secretCode.length).fill(false);
    const userUsed = new Array(userCode.length).fill(false);

    for (let i = 0; i < userCode.length; i++) {
        if (userCode[i] === secretCode[i]) {
            result[i] = 'CORRECT';
            secretUsed[i] = true;
            userUsed[i] = true;
        }
    }
    for (let i = 0; i < userCode.length; i++) {
        if (userUsed[i]) continue;
        for (let j = 0; j < secretCode.length; j++) {
            if (!secretUsed[j] && userCode[i] === secretCode[j]) {
                result[i] = 'MISPLACED';
                secretUsed[j] = true;
                break;
            }
        }
    }
    return result;
}

// ANIMATION
let isAnimatingCamera = false;
let handleVelocity = 0;
const targetCameraPos = new THREE.Vector3();
const targetControlsTarget = new THREE.Vector3();

function focusOnObject(targetMesh, offsetZ = 2.5) {
    targetMesh.getWorldPosition(targetControlsTarget);

    // Calcule la position cible légèrement reculée sur l'axe Z par rapport à l'objet
    targetCameraPos.set(
        targetControlsTarget.x,
        targetControlsTarget.y,
        targetControlsTarget.z + offsetZ
    );

    isAnimatingCamera = true;
}

// HANDLE CLICK
const raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 0.02;
const mouse = new THREE.Vector2();
let startX = 0;
let startY = 0;

window.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
});

window.addEventListener('pointerup', (event) => {
    const deltaX = Math.abs(event.clientX - startX);
    const deltaY = Math.abs(event.clientY - startY);
    if (deltaX > 5 || deltaY > 5) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, false);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        if (obj.userData.type === 'static_up' || obj.userData.type === 'static_down') {
            const targetScreen = digitButtons[obj.userData.targetIndex];

            focusOnObject(targetScreen.parent, 2.5);

            if (obj.userData.type === 'static_up' && targetScreen.userData.value < 9)
                targetScreen.userData.value++;
            else if (obj.userData.type === 'static_down' && targetScreen.userData.value > 1)
                targetScreen.userData.value--;

            targetScreen.userData.status = 'NEUTRAL';
            updateButtonTexture(targetScreen);

            obj.position.z -= 0.02;
            setTimeout(() => { if (obj) obj.position.z += 0.02; }, 100);
        } else if (obj.userData.type === 'handle') {
            handleVelocity = 0.25;
            validateCombination();
        }
    }
});

function resizeRendererToDisplaySize(renderer, maxPixelCount=3840*2160) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;

    let width  = Math.floor( canvas.clientWidth  * pixelRatio );
    let height = Math.floor( canvas.clientHeight * pixelRatio );

    const pixelCount = width * height;
    const renderScale = pixelCount > maxPixelCount ? Math.sqrt(maxPixelCount / pixelCount) : 1;

    width = Math.floor(width * renderScale);
    height = Math.floor(height * renderScale);

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize)
        renderer.setSize(width, height, false);
    return needResize;
}

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    if (isUnlocked && doorHinge.rotation.y > -Math.PI * 0.6)
        doorHinge.rotation.y = THREE.MathUtils.lerp(doorHinge.rotation.y, -Math.PI * 0.6, 0.03);

    if (handleVelocity > 0.001) {
        handleGroup.rotation.z -= handleVelocity;
        handleVelocity *= 0.94;
    } else
        handleVelocity = 0;

    if (isAnimatingCamera) {
        controls.target.lerp(targetControlsTarget, 0.08);
        camera.position.lerp(targetCameraPos, 0.08);
        controls.update();

        if (camera.position.distanceTo(targetCameraPos) < 0.01)
            isAnimatingCamera = false;
    }

    renderer.render( scene, camera );
}