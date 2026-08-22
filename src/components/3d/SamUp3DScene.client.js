import * as THREE from 'three';
import piuData from '../../data/piu_contour.json';

export class SamUp3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // 3D Objects
    this.logoGroup = null;
    this.piuMesh = null;
    this.outerRing = null;
    this.innerRing = null;
    this.inlayBand = null;
    this.orbitRings = [];
    this.particles = null;
    this.polyhedra = [];
    
    // Lighting
    this.keyLight = null;
    this.rimLight = null;
    this.coreLight = null;
    this.ambientLight = null;
    
    // Animation state
    this.clock = new THREE.Clock();
    this.isUserInteracting = false;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.35;
    this.cameraMode = 'orbital'; // orbital, frontal, macro, wireframe
    this.lightingMode = 'studio_gold'; // studio_gold, cyber_obsidian, golden_hour
    
    // Mouse / Touch interaction
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0.05;
    this.targetRotationY = 0;
    this.currentRotationX = 0.05;
    this.currentRotationY = 0;
    this.targetZoom = 9.2;
    this.currentZoom = 9.2;
    
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090D, 0.035);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0.8, 9.5);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Environment Map
    this.setupEnvironment();

    // 5. Lights
    this.setupLights();

    // 6. Build Authentic 3D SAM-UP Logo & Scene
    this.build3DLogo();
    this.buildOrbitalsAndParticles();
    this.buildFloorGrid();

    // 7. Event listeners
    this.setupEvents();

    // 8. Start loop
    this.animate();
  }

  setupEnvironment() {
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const ctx = envCanvas.getContext('2d');

    // Base dark background
    ctx.fillStyle = '#06080C';
    ctx.fillRect(0, 0, envCanvas.width, envCanvas.height);

    // Bright yellow/gold studio key softbox (top right)
    const grad1 = ctx.createRadialGradient(750, 150, 10, 750, 150, 320);
    grad1.addColorStop(0, 'rgba(255, 245, 120, 1.0)');
    grad1.addColorStop(0.3, 'rgba(255, 230, 0, 0.65)');
    grad1.addColorStop(1, 'rgba(6, 8, 12, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, envCanvas.width, envCanvas.height);

    // Cool rim light (top left)
    const grad2 = ctx.createRadialGradient(250, 180, 10, 250, 180, 260);
    grad2.addColorStop(0, 'rgba(210, 230, 255, 0.85)');
    grad2.addColorStop(0.4, 'rgba(100, 150, 255, 0.35)');
    grad2.addColorStop(1, 'rgba(6, 8, 12, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, envCanvas.width, envCanvas.height);

    // Luminous horizon glow
    const grad3 = ctx.createLinearGradient(0, 200, 0, 350);
    grad3.addColorStop(0, 'rgba(255, 230, 0, 0.3)');
    grad3.addColorStop(1, 'rgba(6, 8, 12, 0)');
    ctx.fillStyle = grad3;
    ctx.fillRect(0, 200, envCanvas.width, 150);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = envTexture;
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0x1A1F2B, 1.3);
    this.scene.add(this.ambientLight);

    // Key Light (Crisp White-Warm Light to show true yellow colors)
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.8);
    this.keyLight.position.set(5, 6, 6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // Rim Light (Cool Electric Accent)
    this.rimLight = new THREE.DirectionalLight(0x9BB6FF, 2.5);
    this.rimLight.position.set(-6, 4, -4);
    this.scene.add(this.rimLight);

    // Internal Core Glow Light (Vibrant Yellow)
    this.coreLight = new THREE.PointLight(0xFFE600, 3.2, 8);
    this.coreLight.position.set(0, 0, 0.8);
    this.scene.add(this.coreLight);
  }

  createPiuYellowFaceMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xFFEA00, // Vibrant Official SAM-UP Yellow
      emissive: 0x332E00,
      emissiveIntensity: 0.3,
      metalness: 0.15,
      roughness: 0.22,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xFFFFDD)
    });
  }

  createBlackBevelMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0x05070A, // Deep Pitch Black Obsidian
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0
    });
  }

  createGoldRingMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xFFE600,
      emissive: 0x2A2400,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12
    });
  }

  build3DLogo() {
    this.logoGroup = new THREE.Group();
    this.scene.add(this.logoGroup);

    // 1. Build the Authentic Extruded Piu Monolith with Yellow Face and Black Bevel Sides
    this.buildAuthenticPiuMesh();

    // 2. Concentric Dual Rings matching the official SAM-UP Seal
    const blackMat = this.createBlackBevelMaterial();
    const yellowMat = this.createGoldRingMaterial();

    const outerRingGeo = new THREE.TorusGeometry(3.38, 0.10, 32, 120);
    this.outerRing = new THREE.Mesh(outerRingGeo, blackMat);
    this.outerRing.castShadow = true;
    this.logoGroup.add(this.outerRing);

    const innerRingGeo = new THREE.TorusGeometry(2.38, 0.08, 32, 120);
    this.innerRing = new THREE.Mesh(innerRingGeo, blackMat);
    this.innerRing.castShadow = true;
    this.logoGroup.add(this.innerRing);

    // 3. Inlay Band with Authentic Vibrant Yellow and Black Engraved Seal Typography
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 2048;
    textCanvas.height = 256;
    const tCtx = textCanvas.getContext('2d');

    // Vibrant Yellow Background per the Official Seal
    tCtx.fillStyle = '#FFE600';
    tCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    // Black Border Accents
    tCtx.strokeStyle = '#000000';
    tCtx.lineWidth = 10;
    tCtx.beginPath();
    tCtx.moveTo(0, 10);
    tCtx.lineTo(textCanvas.width, 10);
    tCtx.moveTo(0, textCanvas.height - 10);
    tCtx.lineTo(textCanvas.width, textCanvas.height - 10);
    tCtx.stroke();

    // Bold Black Typography matching the Official Seal
    tCtx.fillStyle = '#000000';
    tCtx.font = 'bold 56px "Cinzel", "Times New Roman", serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    
    const text1 = '★   SOCIETY OF APPLIED MATHEMATICS OF UPLB   ★';
    const text2 = '★   1984   ★   EST. IMSP CAS UPLB   ★';
    
    tCtx.fillText(text1, textCanvas.width * 0.28, textCanvas.height / 2);
    tCtx.fillText(text2, textCanvas.width * 0.78, textCanvas.height / 2);

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.wrapS = THREE.RepeatWrapping;
    textTexture.wrapT = THREE.ClampToEdgeWrapping;

    const inlayGeo = new THREE.CylinderGeometry(2.88, 2.88, 0.92, 96, 1, true);
    inlayGeo.rotateX(Math.PI / 2);
    
    const inlayMat = new THREE.MeshPhysicalMaterial({
      map: textTexture,
      bumpMap: textTexture,
      bumpScale: 0.04,
      metalness: 0.2,
      roughness: 0.35,
      clearcoat: 0.6,
      side: THREE.DoubleSide
    });
    
    this.inlayBand = new THREE.Mesh(inlayGeo, inlayMat);
    this.logoGroup.add(this.inlayBand);

    // 4. Twin Guiding 3D Stars in Black & Gold
    const starShape = new THREE.Shape();
    const starPoints = 5;
    const outerRadius = 0.22;
    const innerRadius = 0.10;
    for (let i = 0; i < starPoints * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / starPoints - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starExtrudeSettings = {
      steps: 1,
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3
    };
    const starGeo = new THREE.ExtrudeGeometry(starShape, starExtrudeSettings);
    starGeo.center();

    // Left Star
    const leftStar = new THREE.Mesh(starGeo, blackMat);
    leftStar.position.set(-2.88, 0, 0.14);
    this.logoGroup.add(leftStar);

    // Right Star
    const rightStar = new THREE.Mesh(starGeo, blackMat);
    rightStar.position.set(2.88, 0, 0.14);
    this.logoGroup.add(rightStar);
  }

  buildAuthenticPiuMesh() {
    // Construct the exact Three.js shape from normalized polygon data
    const piuShape = new THREE.Shape();

    piuData.outer.forEach((pt, i) => {
      if (i === 0) piuShape.moveTo(pt.x, pt.y);
      else piuShape.lineTo(pt.x, pt.y);
    });
    piuShape.closePath();

    if (piuData.hole && piuData.hole.length > 0) {
      const holePath = new THREE.Path();
      piuData.hole.forEach((pt, i) => {
        if (i === 0) holePath.moveTo(pt.x, pt.y);
        else holePath.lineTo(pt.x, pt.y);
      });
      holePath.closePath();
      piuShape.holes.push(holePath);
    }

    const extrudeSettings = {
      steps: 2,
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.05,
      bevelSegments: 4
    };

    const piuGeo = new THREE.ExtrudeGeometry(piuShape, extrudeSettings);
    piuGeo.center();

    // Multi-material setup: [Face Material (Yellow), Sides & Bevel Material (Black)]
    const yellowFaceMat = this.createPiuYellowFaceMaterial();
    const blackSideMat = this.createBlackBevelMaterial();

    this.piuMesh = new THREE.Mesh(piuGeo, [yellowFaceMat, blackSideMat]);
    this.piuMesh.castShadow = true;
    this.piuMesh.receiveShadow = true;
    this.logoGroup.add(this.piuMesh);
  }

  buildOrbitalsAndParticles() {
    const yellowOrbitMat = this.createGoldRingMaterial();

    // 1. Gyroscopic Harmonic Orbital Rings
    const orbitConfigs = [
      { radius: 4.1, tube: 0.025, rotX: 0.6, rotY: 0.4, speed: 0.25 },
      { radius: 4.6, tube: 0.02, rotX: -0.8, rotY: 0.7, speed: -0.18 },
      { radius: 5.2, tube: 0.018, rotX: 0.3, rotY: -0.9, speed: 0.15 }
    ];

    orbitConfigs.forEach(cfg => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const mesh = new THREE.Mesh(geo, yellowOrbitMat);
      mesh.rotation.set(cfg.rotX, cfg.rotY, 0);
      this.scene.add(mesh);
      this.orbitRings.push({ mesh, speed: cfg.speed, baseRotX: cfg.rotX, baseRotY: cfg.rotY });
    });

    // 2. Floating Mathematical Polyhedra
    const polyMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFE600,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      metalness: 0.8
    });

    const geometries = [
      new THREE.IcosahedronGeometry(0.35, 0),
      new THREE.DodecahedronGeometry(0.4, 0),
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.IcosahedronGeometry(0.28, 1)
    ];

    for (let i = 0; i < 14; i++) {
      const geo = geometries[i % geometries.length];
      const mesh = new THREE.Mesh(geo, polyMat);
      
      const angle = (i / 14) * Math.PI * 2 + (Math.random() * 0.4);
      const dist = 3.8 + Math.random() * 2.8;
      const height = (Math.random() - 0.5) * 4.5;
      
      mesh.position.set(
        Math.cos(angle) * dist,
        height,
        Math.sin(angle) * dist + (Math.random() - 0.5) * 2
      );
      
      this.scene.add(mesh);
      this.polyhedra.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.8,
        rotSpeedY: (Math.random() - 0.5) * 0.8,
        floatSpeed: 0.5 + Math.random() * 0.8,
        initialY: height
      });
    }

    // 3. Golden/Yellow Luminous Dust Particles
    const particleCount = 650;
    const posArray = new Float32Array(particleCount * 3);
    const scaleArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 12;
      posArray[i + 2] = (Math.random() - 0.5) * 12;
      scaleArray[i / 3] = Math.random();
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 180, 1.0)');
    pGrad.addColorStop(0.3, 'rgba(255, 230, 0, 0.85)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);

    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: pTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  buildFloorGrid() {
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d');

    const fGrad = fCtx.createRadialGradient(256, 256, 10, 256, 256, 256);
    fGrad.addColorStop(0, 'rgba(255, 230, 0, 0.10)');
    fGrad.addColorStop(0.4, 'rgba(15, 20, 28, 0.4)');
    fGrad.addColorStop(1, 'rgba(7, 9, 13, 1)');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 512, 512);

    const floorTexture = new THREE.CanvasTexture(floorCanvas);

    const floorMat = new THREE.MeshBasicMaterial({
      map: floorTexture,
      transparent: true,
      opacity: 0.8
    });

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -3.8;
    this.scene.add(floorMesh);
  }

  setupEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    const dom = this.renderer.domElement;
    
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.isUserInteracting = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      setTimeout(() => { this.isUserInteracting = false; }, 2500);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;
        this.targetRotationX = Math.max(-1.1, Math.min(1.1, this.targetRotationX));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouseX = normX * 0.3;
        this.mouseY = normY * 0.2;
      }
    });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.isUserInteracting = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      setTimeout(() => { this.isUserInteracting = false; }, 2500);
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetRotationY += deltaX * 0.009;
        this.targetRotationX += deltaY * 0.009;

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('samup:camera-mode', (e) => {
      this.setCameraMode(e.detail.mode);
    });

    window.addEventListener('samup:lighting-mode', (e) => {
      this.setLightingMode(e.detail.mode);
    });

    window.addEventListener('samup:toggle-rotation', () => {
      this.autoRotate = !this.autoRotate;
    });
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === 'orbital') {
      this.targetZoom = 9.2;
      this.autoRotate = true;
    } else if (mode === 'frontal') {
      this.targetZoom = 8.5;
      this.targetRotationX = 0;
      this.targetRotationY = 0;
      this.autoRotate = false;
    } else if (mode === 'macro') {
      this.targetZoom = 4.8;
      this.targetRotationX = 0.2;
      this.targetRotationY = 0.35;
      this.autoRotate = false;
    } else if (mode === 'wireframe') {
      this.targetZoom = 8.8;
      this.toggleWireframe(true);
      return;
    }
    this.toggleWireframe(false);
  }

  toggleWireframe(enable) {
    if (this.piuMesh) {
      if (Array.isArray(this.piuMesh.material)) {
        this.piuMesh.material.forEach(m => m.wireframe = enable);
      } else {
        this.piuMesh.material.wireframe = enable;
      }
    }
    if (this.outerRing) this.outerRing.material.wireframe = enable;
    if (this.innerRing) this.innerRing.material.wireframe = enable;
  }

  setLightingMode(mode) {
    this.lightingMode = mode;
    if (mode === 'studio_gold') {
      this.keyLight.color.setHex(0xFFFFFF);
      this.keyLight.intensity = 3.8;
      this.rimLight.color.setHex(0x9BB6FF);
      this.renderer.toneMappingExposure = 1.3;
    } else if (mode === 'cyber_obsidian') {
      this.keyLight.color.setHex(0x00F0FF);
      this.keyLight.intensity = 2.8;
      this.rimLight.color.setHex(0xFF007F);
      this.renderer.toneMappingExposure = 1.4;
    } else if (mode === 'golden_hour') {
      this.keyLight.color.setHex(0xFF9900);
      this.keyLight.intensity = 4.0;
      this.rimLight.color.setHex(0xFFCC00);
      this.renderer.toneMappingExposure = 1.35;
    }
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.autoRotate && !this.isUserInteracting) {
      this.targetRotationY += delta * this.autoRotateSpeed;
    }

    this.currentRotationX += (this.targetRotationX + this.mouseY - this.currentRotationX) * 0.06;
    this.currentRotationY += (this.targetRotationY + this.mouseX - this.currentRotationY) * 0.06;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.05;

    if (this.logoGroup) {
      this.logoGroup.rotation.x = this.currentRotationX;
      this.logoGroup.rotation.y = this.currentRotationY;
      this.logoGroup.position.y = Math.sin(time * 1.2) * 0.15;
    }

    this.camera.position.z = this.currentZoom;

    this.orbitRings.forEach((orbit, idx) => {
      orbit.mesh.rotation.z = time * orbit.speed;
      orbit.mesh.rotation.x = orbit.baseRotX + Math.sin(time * 0.5 + idx) * 0.08;
    });

    this.polyhedra.forEach((poly) => {
      poly.mesh.rotation.x += poly.rotSpeedX * delta;
      poly.mesh.rotation.y += poly.rotSpeedY * delta;
      poly.mesh.position.y = poly.initialY + Math.sin(time * poly.floatSpeed) * 0.35;
    });

    if (this.particles) {
      this.particles.rotation.y = time * 0.03;
      this.particles.rotation.x = Math.sin(time * 0.02) * 0.05;
    }

    if (this.coreLight) {
      this.coreLight.intensity = 2.8 + Math.sin(time * 2.5) * 0.6;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
