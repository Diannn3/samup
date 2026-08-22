import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sparkles, Sun, Shield, Rotate3d, Compass, Layers, Eye } from 'lucide-react';
import piuData from '../../data/piu_contour.json';

export const SamUp3DExperience: React.FC = () => {
  const [cameraMode, setCameraMode] = useState<'orbital' | 'frontal' | 'macro' | 'wireframe'>('orbital');
  const [lightingMode, setLightingMode] = useState<'gold' | 'cyber' | 'sunset'>('gold');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'pbr' | 'clay'>('pbr');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<any>(null);

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) {
      setIsAutoRotating(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initScene = async () => {
      try {
        const THREE = await import('three');
        if (!containerRef.current || isCancelled) return;

        const container = containerRef.current;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 700;

        // 1. Scene & Perspective Camera
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x080A0F, 0.022);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 10.5);

        // 2. High-Performance ACES Filmic WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;

        container.appendChild(renderer.domElement);

        // ========================================================
        // COMFYUI / EASYBAKENODE PROCEDURAL PBR MAP SYNTHESIS PIPELINE
        // ========================================================

        // A. Packed ORM Map (Red = AO, Green = Roughness, Blue = Metallic) (1024x1024)
        const ormCanvas = document.createElement('canvas');
        ormCanvas.width = 1024;
        ormCanvas.height = 1024;
        const ormCtx = ormCanvas.getContext('2d')!;
        const ormImgData = ormCtx.createImageData(1024, 1024);
        const ormData = ormImgData.data;

        for (let i = 0; i < ormData.length; i += 4) {
          const x = (i / 4) % 1024;
          const y = Math.floor((i / 4) / 1024);
          const cx = (x - 512) / 512;
          const cy = (y - 512) / 512;
          const radius = Math.sqrt(cx * cx + cy * cy);

          // R (Ambient Occlusion): Darker in inner recesses
          const ao = Math.min(255, Math.max(180, Math.floor(255 - radius * 40 + (Math.random() - 0.5) * 10)));
          
          // G (Roughness): High-frequency brushed noise + micro-scratches
          const angle = Math.atan2(cy, cx);
          const streak = Math.sin(radius * 120) * Math.cos(angle * 60) * 15;
          const roughness = Math.min(255, Math.max(30, Math.floor(55 + streak + (Math.random() - 0.5) * 20)));

          // B (Metallic): 240 for high reflective alloy
          const metallic = 235;

          ormData[i] = ao;
          ormData[i + 1] = roughness;
          ormData[i + 2] = metallic;
          ormData[i + 3] = 255;
        }
        ormCtx.putImageData(ormImgData, 0, 0);
        const ormTexture = new THREE.CanvasTexture(ormCanvas);
        ormTexture.wrapS = THREE.RepeatWrapping;
        ormTexture.wrapT = THREE.RepeatWrapping;

        // B. Anisotropic Brushed Micro-Normal Map (1024x1024)
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 1024;
        normalCanvas.height = 1024;
        const nCtx = normalCanvas.getContext('2d')!;
        const nImgData = nCtx.createImageData(1024, 1024);
        const nData = nImgData.data;

        for (let i = 0; i < nData.length; i += 4) {
          const x = (i / 4) % 1024;
          const y = Math.floor((i / 4) / 1024);
          const cx = (x - 512) / 512;
          const cy = (y - 512) / 512;
          const angle = Math.atan2(cy, cx);
          const dist = Math.sqrt(cx * cx + cy * cy);

          // Concentric circular micro-grain vector perturbation
          const perturbation = Math.sin(dist * 200) * 14 + (Math.random() - 0.5) * 8;
          const nx = Math.cos(angle + Math.PI / 2) * perturbation;
          const ny = Math.sin(angle + Math.PI / 2) * perturbation;

          nData[i] = Math.min(255, Math.max(0, Math.floor(128 + nx)));
          nData[i + 1] = Math.min(255, Math.max(0, Math.floor(128 + ny)));
          nData[i + 2] = 255;
          nData[i + 3] = 255;
        }
        nCtx.putImageData(nImgData, 0, 0);
        const goldNormalTex = new THREE.CanvasTexture(normalCanvas);
        goldNormalTex.wrapS = THREE.RepeatWrapping;
        goldNormalTex.wrapT = THREE.RepeatWrapping;

        // C. Obsidian Volcanic Micro-Crystalline Normal Map
        const obsidianCanvas = document.createElement('canvas');
        obsidianCanvas.width = 512;
        obsidianCanvas.height = 512;
        const obsCtx = obsidianCanvas.getContext('2d')!;
        const obsImgData = obsCtx.createImageData(512, 512);
        const obsData = obsImgData.data;

        for (let i = 0; i < obsData.length; i += 4) {
          const grain = (Math.random() - 0.5) * 18;
          obsData[i] = 128 + grain;
          obsData[i + 1] = 128 + grain;
          obsData[i + 2] = 245;
          obsData[i + 3] = 255;
        }
        obsCtx.putImageData(obsImgData, 0, 0);
        const obsidianNormalTex = new THREE.CanvasTexture(obsidianCanvas);
        obsidianNormalTex.wrapS = THREE.RepeatWrapping;
        obsidianNormalTex.wrapT = THREE.RepeatWrapping;

        // D. Sobel-Filtered Debossed Inlay Normal & Height Map (1024x128)
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 1024;
        textCanvas.height = 128;
        const tCtx = textCanvas.getContext('2d')!;
        tCtx.fillStyle = '#FFE600';
        tCtx.fillRect(0, 0, 1024, 128);
        tCtx.strokeStyle = '#000000';
        tCtx.lineWidth = 6;
        tCtx.strokeRect(4, 4, 1016, 120);
        tCtx.fillStyle = '#000000';
        tCtx.font = 'bold 30px "Cinzel", Georgia, serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText('★ SOCIETY OF APPLIED MATHEMATICS OF UPLB ★ 1984', 512, 64);
        const textAlbedoTex = new THREE.CanvasTexture(textCanvas);
        textAlbedoTex.wrapS = THREE.RepeatWrapping;

        // Generate Sobel Normal Displacement from the typography mask
        const textSrcData = tCtx.getImageData(0, 0, 1024, 128).data;
        const sobelCanvas = document.createElement('canvas');
        sobelCanvas.width = 1024;
        sobelCanvas.height = 128;
        const sCtx = sobelCanvas.getContext('2d')!;
        const sobelImgData = sCtx.createImageData(1024, 128);
        const sData = sobelImgData.data;

        const getLum = (px: number, py: number) => {
          const cx = Math.max(0, Math.min(1023, px));
          const cy = Math.max(0, Math.min(127, py));
          const idx = (cy * 1024 + cx) * 4;
          return (textSrcData[idx] * 0.299 + textSrcData[idx + 1] * 0.587 + textSrcData[idx + 2] * 0.114) / 255;
        };

        for (let py = 0; py < 128; py++) {
          for (let px = 0; px < 1024; px++) {
            const idx = (py * 1024 + px) * 4;
            // 3x3 Sobel Operator
            const gx = (-1 * getLum(px - 1, py - 1) + 1 * getLum(px + 1, py - 1) +
                        -2 * getLum(px - 1, py)     + 2 * getLum(px + 1, py) +
                        -1 * getLum(px - 1, py + 1) + 1 * getLum(px + 1, py + 1));
            const gy = (-1 * getLum(px - 1, py - 1) - 2 * getLum(px, py - 1) - 1 * getLum(px + 1, py - 1) +
                         1 * getLum(px - 1, py + 1) + 2 * getLum(px, py + 1) + 1 * getLum(px + 1, py + 1));

            const normalScale = 3.5;
            const nx = -gx * normalScale;
            const ny = -gy * normalScale;
            const nz = 1.0;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

            sData[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
            sData[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
            sData[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
            sData[idx + 3] = 255;
          }
        }
        sCtx.putImageData(sobelImgData, 0, 0);
        const debossedNormalTex = new THREE.CanvasTexture(sobelCanvas);
        debossedNormalTex.wrapS = THREE.RepeatWrapping;

        // E. Studio Environment Map
        const envCanvas = document.createElement('canvas');
        envCanvas.width = 512;
        envCanvas.height = 256;
        const envCtx = envCanvas.getContext('2d')!;
        envCtx.fillStyle = '#080A0F';
        envCtx.fillRect(0, 0, 512, 256);
        const grad1 = envCtx.createRadialGradient(380, 80, 10, 380, 80, 160);
        grad1.addColorStop(0, 'rgba(255, 230, 0, 0.7)');
        grad1.addColorStop(1, 'rgba(8, 10, 15, 0)');
        envCtx.fillStyle = grad1;
        envCtx.fillRect(0, 0, 512, 256);
        const envTexture = new THREE.CanvasTexture(envCanvas);
        envTexture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = envTexture;

        // 3. Studio 3-Point Lights
        const ambientLight = new THREE.AmbientLight(0x18202E, 1.6);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xFFFFFF, 4.4);
        keyLight.position.set(6, 7, 7);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x9BB6FF, 3.2);
        rimLight.position.set(-7, 5, -5);
        scene.add(rimLight);

        const coreLight = new THREE.PointLight(0xFFE600, 4.0, 12);
        coreLight.position.set(2.85, 0, 1.2);
        scene.add(coreLight);

        // 4. Physical Materials with EasyBake PBR Maps
        const yellowFaceMat = new THREE.MeshPhysicalMaterial({
          color: 0xFFEA00,
          emissive: 0x332E00,
          emissiveIntensity: 0.22,
          metalness: 0.28,
          roughness: 0.18,
          roughnessMap: ormTexture,
          normalMap: goldNormalTex,
          normalScale: new THREE.Vector2(0.4, 0.4),
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          reflectivity: 0.95
        });

        const blackSideMat = new THREE.MeshPhysicalMaterial({
          color: 0x05070A,
          metalness: 0.95,
          roughness: 0.12,
          normalMap: obsidianNormalTex,
          normalScale: new THREE.Vector2(0.3, 0.3),
          clearcoat: 0.95,
          clearcoatRoughness: 0.05
        });

        const clayMat = new THREE.MeshStandardMaterial({
          color: 0xDDDDDD,
          roughness: 0.7,
          metalness: 0.1
        });

        const goldWireMat = new THREE.MeshBasicMaterial({
          color: 0xFFE600,
          wireframe: true,
          transparent: true,
          opacity: 0.35
        });

        const obsidianWireMat = new THREE.MeshBasicMaterial({
          color: 0x94A3B8,
          wireframe: true,
          transparent: true,
          opacity: 0.2
        });

        // 5. Responsive Coordinate Offsets
        const getLogoOffset = (w: number) => {
          if (w >= 1024) return { x: 2.85, y: 0.1, z: 0, scale: 1.05 };
          if (w >= 768) return { x: 3.25, y: 0.05, z: -0.4, scale: 0.76 };
          return { x: 1.55, y: -1.55, z: -1.1, scale: 0.62 };
        };

        let currentOffset = getLogoOffset(width);

        // 6. Construct Piu Monolith
        const logoGroup = new THREE.Group();
        logoGroup.position.set(currentOffset.x, currentOffset.y, currentOffset.z);
        logoGroup.scale.setScalar(currentOffset.scale);
        scene.add(logoGroup);

        const piuShape = new THREE.Shape();
        piuData.outer.forEach((pt: { x: number; y: number }, i: number) => {
          if (i === 0) piuShape.moveTo(pt.x, pt.y);
          else piuShape.lineTo(pt.x, pt.y);
        });
        piuShape.closePath();

        if (piuData.hole && piuData.hole.length > 0) {
          const holePath = new THREE.Path();
          piuData.hole.forEach((pt: { x: number; y: number }, i: number) => {
            if (i === 0) holePath.moveTo(pt.x, pt.y);
            else holePath.lineTo(pt.x, pt.y);
          });
          holePath.closePath();
          piuShape.holes.push(holePath);
        }

        const piuGeo = new THREE.ExtrudeGeometry(piuShape, {
          steps: 2,
          depth: 0.42,
          bevelEnabled: true,
          bevelThickness: 0.085,
          bevelSize: 0.065,
          bevelSegments: 4
        });
        piuGeo.center();

        const piuMesh = new THREE.Mesh(piuGeo, [yellowFaceMat, blackSideMat]);
        logoGroup.add(piuMesh);

        // Concentric Torus Rings
        const outerRingGeo = new THREE.TorusGeometry(3.38, 0.09, 24, 80);
        const outerRing = new THREE.Mesh(outerRingGeo, blackSideMat);
        logoGroup.add(outerRing);

        const innerRingGeo = new THREE.TorusGeometry(2.38, 0.07, 24, 80);
        const innerRing = new THREE.Mesh(innerRingGeo, blackSideMat);
        logoGroup.add(innerRing);

        // Inlay Typography Ring with Sobel Debossed Displacement
        const inlayGeo = new THREE.CylinderGeometry(2.88, 2.88, 0.9, 64, 1, true);
        inlayGeo.rotateX(Math.PI / 2);
        const inlayMat = new THREE.MeshPhysicalMaterial({
          map: textAlbedoTex,
          normalMap: debossedNormalTex,
          normalScale: new THREE.Vector2(0.55, 0.55),
          metalness: 0.35,
          roughness: 0.22,
          clearcoat: 0.7,
          side: THREE.DoubleSide
        });
        const inlayBand = new THREE.Mesh(inlayGeo, inlayMat);
        logoGroup.add(inlayBand);

        // Gyroscopic Orbit Rings
        const orbitRings: any[] = [];
        const orbitMat = new THREE.MeshPhysicalMaterial({
          color: 0xFFE600,
          metalness: 0.88,
          roughness: 0.16,
          clearcoat: 0.85
        });
        [
          { r: 4.1, t: 0.022, rx: 0.6, ry: 0.4, sp: 0.2 },
          { r: 4.8, t: 0.018, rx: -0.7, ry: 0.6, sp: -0.15 }
        ].forEach(cfg => {
          const oGeo = new THREE.TorusGeometry(cfg.r, cfg.t, 16, 60);
          const oMesh = new THREE.Mesh(oGeo, orbitMat);
          oMesh.rotation.set(cfg.rx, cfg.ry, 0);
          logoGroup.add(oMesh);
          orbitRings.push({ mesh: oMesh, speed: cfg.sp, rx: cfg.rx });
        });

        // 7. Floating Mathematical Polyhedra
        const polyGroup = new THREE.Group();
        scene.add(polyGroup);

        const polyData = [
          { geo: new THREE.IcosahedronGeometry(0.7, 0), pos: [-5.5, 2.5, -2], rot: [0.2, 0.4], sp: 0.3, mat: goldWireMat },
          { geo: new THREE.OctahedronGeometry(0.55, 0), pos: [-3.8, -2.2, -1], rot: [-0.3, 0.2], sp: -0.25, mat: obsidianWireMat },
          { geo: new THREE.DodecahedronGeometry(0.65, 0), pos: [-6.8, -0.8, -3], rot: [0.1, -0.3], sp: 0.2, mat: goldWireMat },
          { geo: new THREE.TetrahedronGeometry(0.5, 0), pos: [-1.8, 3.2, -2.5], rot: [0.4, 0.1], sp: -0.35, mat: obsidianWireMat },
          { geo: new THREE.IcosahedronGeometry(0.8, 0), pos: [5.2, 3.0, -2.5], rot: [0.3, 0.5], sp: 0.18, mat: goldWireMat },
          { geo: new THREE.OctahedronGeometry(0.6, 0), pos: [6.5, -2.0, -1.5], rot: [-0.2, 0.3], sp: -0.22, mat: obsidianWireMat },
          { geo: new THREE.DodecahedronGeometry(0.5, 0), pos: [1.5, 2.8, -3], rot: [0.5, -0.2], sp: 0.28, mat: goldWireMat },
          { geo: new THREE.IcosahedronGeometry(0.45, 0), pos: [4.2, -3.2, -2], rot: [-0.4, 0.1], sp: -0.3, mat: obsidianWireMat }
        ];

        const floatingMeshes = polyData.map(p => {
          const mesh = new THREE.Mesh(p.geo, p.mat);
          mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
          mesh.rotation.set(p.rot[0], p.rot[1], 0);
          polyGroup.add(mesh);
          return { mesh, initialPos: [...p.pos], sp: p.sp };
        });

        // 8. Floating Golden Particle Field
        const particleCount = 180;
        const particleGeo = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
          particlePositions[i] = (Math.random() - 0.5) * 22;
          particlePositions[i + 1] = (Math.random() - 0.5) * 12;
          particlePositions[i + 2] = (Math.random() - 0.5) * 10 - 2;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0xFFE600,
          size: 0.05,
          transparent: true,
          opacity: 0.5
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // 9. Animation State
        let animationFrameId: number;
        let isVisible = true;
        let targetRotX = 0.05;
        let targetRotY = 0;
        let currRotX = 0.05;
        let currRotY = 0;
        let targetZ = 10.5;
        let currZ = 10.5;
        let isDragging = false;
        let prevPointer = { x: 0, y: 0 };
        let mouseParallax = { x: 0, y: 0 };
        let lastTime = performance.now();

        // Pointer interactions & parallax
        const dom = renderer.domElement;
        const onPointerDown = (e: PointerEvent) => {
          isDragging = true;
          prevPointer = { x: e.clientX, y: e.clientY };
        };
        const onPointerUp = () => { isDragging = false; };
        const onPointerMove = (e: PointerEvent) => {
          const normX = (e.clientX / window.innerWidth - 0.5) * 2;
          const normY = (e.clientY / window.innerHeight - 0.5) * 2;
          mouseParallax.x = normX * 0.35;
          mouseParallax.y = -normY * 0.25;

          if (isDragging) {
            const dx = e.clientX - prevPointer.x;
            const dy = e.clientY - prevPointer.y;
            targetRotY += dx * 0.008;
            targetRotX += dy * 0.008;
            targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX));
            prevPointer = { x: e.clientX, y: e.clientY };
          }
        };

        dom.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);

        // Resize handler
        const onResize = () => {
          if (!containerRef.current) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);

          currentOffset = getLogoOffset(w);
          logoGroup.position.set(currentOffset.x, currentOffset.y, currentOffset.z);
          logoGroup.scale.setScalar(currentOffset.scale);
          coreLight.position.set(currentOffset.x, currentOffset.y, 1.2);
        };
        window.addEventListener('resize', onResize);

        // Animation Loop
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animate = (timeNow: number) => {
          if (isVisible) {
            const delta = Math.min((timeNow - lastTime) / 1000, 0.1);
            lastTime = timeNow;
            const time = timeNow / 1000;

            if (isAutoRotating && !isDragging && !reduceMotion) {
              targetRotY += delta * 0.3;
            }

            currRotX += (targetRotX - currRotX) * 0.08;
            currRotY += (targetRotY - currRotY) * 0.08;
            currZ += (targetZ - currZ) * 0.06;

            logoGroup.rotation.x = currRotX;
            logoGroup.rotation.y = currRotY;

            if (!reduceMotion) {
              logoGroup.position.y = currentOffset.y + Math.sin(time * 1.2) * 0.12;

              // Camera parallax
              camera.position.x = mouseParallax.x;
              camera.position.y = mouseParallax.y;

              // Rotate orbit rings
              orbitRings.forEach((o) => {
                o.mesh.rotation.z = time * o.speed;
              });

              // Floating polyhedra movement
              floatingMeshes.forEach((fm, idx) => {
                fm.mesh.rotation.x += 0.004 * fm.sp;
                fm.mesh.rotation.y += 0.006 * fm.sp;
                fm.mesh.position.y = fm.initialPos[1] + Math.sin(time * 0.8 + idx) * 0.15;
              });

              // Drift particle field
              particles.rotation.y = time * 0.02;
              particles.rotation.x = time * 0.01;

              coreLight.intensity = 3.4 + Math.sin(time * 2.5) * 0.6;
            }

            camera.position.z = currZ;
            renderer.render(scene, camera);
          }
          animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        // Visibility Observer
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isVisible = entry.isIntersecting && document.visibilityState === 'visible';
          });
        }, { threshold: 0.05 });
        observer.observe(container);

        const onVisibilityChange = () => {
          isVisible = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Scene Instance Controls
        sceneInstanceRef.current = {
          setCamera: (mode: string) => {
            if (mode === 'orbital') { targetZ = 10.5; targetRotX = 0.05; }
            else if (mode === 'frontal') { targetZ = 9.2; targetRotX = 0; targetRotY = 0; }
            else if (mode === 'macro') { targetZ = 6.0; targetRotX = 0.2; targetRotY = 0.3; }
            else if (mode === 'wireframe') {
              targetZ = 9.8;
              yellowFaceMat.wireframe = true;
              blackSideMat.wireframe = true;
              return;
            }
            yellowFaceMat.wireframe = false;
            blackSideMat.wireframe = false;
          },
          setRenderMode: (mode: string) => {
            if (mode === 'clay') {
              piuMesh.material = [clayMat, clayMat];
            } else {
              piuMesh.material = [yellowFaceMat, blackSideMat];
            }
          },
          setLighting: (mode: string) => {
            if (mode === 'gold') {
              keyLight.color.setHex(0xFFFFFF);
              rimLight.color.setHex(0x9BB6FF);
            } else if (mode === 'cyber') {
              keyLight.color.setHex(0x00F0FF);
              rimLight.color.setHex(0xFF007F);
            } else if (mode === 'sunset') {
              keyLight.color.setHex(0xFF9900);
              rimLight.color.setHex(0xFFCC00);
            }
          },
          toggleRotation: (val: boolean) => {
            setIsAutoRotating(val);
          },
          cleanup: () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('resize', onResize);
            dom.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);

            // Dispose Three.js objects
            piuGeo.dispose();
            outerRingGeo.dispose();
            innerRingGeo.dispose();
            inlayGeo.dispose();
            yellowFaceMat.dispose();
            blackSideMat.dispose();
            clayMat.dispose();
            inlayMat.dispose();
            orbitMat.dispose();
            goldWireMat.dispose();
            obsidianWireMat.dispose();
            particleGeo.dispose();
            particleMat.dispose();
            ormTexture.dispose();
            goldNormalTex.dispose();
            obsidianNormalTex.dispose();
            textAlbedoTex.dispose();
            debossedNormalTex.dispose();
            envTexture.dispose();
            renderer.dispose();
            if (container.contains(dom)) {
              container.removeChild(dom);
            }
          }
        };
      } catch (err) {
        console.error('Failed to initialize full hero 3D scene:', err);
      }
    };

    initScene();

    return () => {
      isCancelled = true;
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.cleanup();
      }
    };
  }, []);

  const handleCameraChange = (mode: 'orbital' | 'frontal' | 'macro' | 'wireframe') => {
    setCameraMode(mode);
    sceneInstanceRef.current?.setCamera(mode);
  };

  const handleRenderModeChange = (mode: 'pbr' | 'clay') => {
    setRenderMode(mode);
    sceneInstanceRef.current?.setRenderMode(mode);
  };

  const handleLightingChange = (mode: 'gold' | 'cyber' | 'sunset') => {
    setLightingMode(mode);
    sceneInstanceRef.current?.setLighting(mode);
  };

  const handleRotationToggle = () => {
    if (prefersReducedMotion) return;
    const next = !isAutoRotating;
    setIsAutoRotating(next);
    sceneInstanceRef.current?.toggleRotation(next);
  };

  return (
    <div className="hero-3d-experience absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      {/* Three.js Canvas Mount */}
      <div ref={containerRef} aria-hidden="true" className="hero-3d-canvas w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls Pill */}
      <div className="hero-3d-controls absolute bottom-3 left-3 right-3 md:bottom-6 md:left-auto md:right-6 flex flex-wrap justify-center md:justify-end items-center gap-2 p-2.5 rounded-xl bg-[var(--surface)]/85 backdrop-blur-md border border-[var(--border)] text-xs z-30 shadow-lg pointer-events-auto">
        {/* Camera Presets */}
        <div role="group" aria-label="Camera Views" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleCameraChange('orbital')}
            aria-pressed={cameraMode === 'orbital'}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 rounded-md font-medium transition-colors ${
              cameraMode === 'orbital' ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Orbit
          </button>
          <button
            type="button"
            onClick={() => handleCameraChange('frontal')}
            aria-pressed={cameraMode === 'frontal'}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 rounded-md font-medium transition-colors ${
              cameraMode === 'frontal' ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => handleCameraChange('macro')}
            aria-pressed={cameraMode === 'macro'}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 rounded-md font-medium transition-colors ${
              cameraMode === 'macro' ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Macro
          </button>
          <button
            type="button"
            onClick={() => handleCameraChange('wireframe')}
            aria-pressed={cameraMode === 'wireframe'}
            className={`min-h-11 sm:min-h-0 px-2.5 py-1 rounded-md font-medium transition-colors ${
              cameraMode === 'wireframe' ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Wire
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

        {/* Shader Shading Mode (PBR vs Clay) */}
        <div role="group" aria-label="Material Shading" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleRenderModeChange('pbr')}
            aria-pressed={renderMode === 'pbr'}
            className={`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 px-2 py-1 rounded-md font-medium transition-colors ${
              renderMode === 'pbr' ? 'bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border-primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            title="Full PBR Textured"
          >
            PBR
          </button>
          <button
            type="button"
            onClick={() => handleRenderModeChange('clay')}
            aria-pressed={renderMode === 'clay'}
            className={`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 px-2 py-1 rounded-md font-medium transition-colors ${
              renderMode === 'clay' ? 'bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border-primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            title="Clay AO Shading"
          >
            Clay
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

        {/* Lighting Environments */}
        <div role="group" aria-label="Lighting Environments" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleLightingChange('gold')}
            aria-pressed={lightingMode === 'gold'}
            className={`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1.5 rounded-md transition-colors ${
              lightingMode === 'gold' ? 'bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border-primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            title="Studio Gold Lighting"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Studio Gold</span>
          </button>
          <button
            type="button"
            onClick={() => handleLightingChange('cyber')}
            aria-pressed={lightingMode === 'cyber'}
            className={`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1.5 rounded-md transition-colors ${
              lightingMode === 'cyber' ? 'bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border-primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            title="Cyber Lighting"
          >
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Cyber Obsidian</span>
          </button>
          <button
            type="button"
            onClick={() => handleLightingChange('sunset')}
            aria-pressed={lightingMode === 'sunset'}
            className={`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1.5 rounded-md transition-colors ${
              lightingMode === 'sunset' ? 'bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border-primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            title="Sunset Lighting"
          >
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">Sunset Horizon</span>
          </button>
        </div>

        <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />

        {/* Rotation Toggle */}
        <button
          type="button"
          onClick={handleRotationToggle}
          aria-pressed={isAutoRotating}
          disabled={prefersReducedMotion}
          title={prefersReducedMotion ? 'Rotation disabled because reduced motion is enabled' : undefined}
          className="flex items-center gap-1 min-h-11 sm:min-h-0 px-2 py-1 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--border-primary)] transition-colors"
        >
          {isAutoRotating ? (
            <Pause className="w-3 h-3" aria-hidden="true" />
          ) : (
            <Play className="w-3 h-3" aria-hidden="true" />
          )}
          <span>{isAutoRotating ? 'Pause' : 'Spin'}</span>
        </button>
      </div>
    </div>
  );
};
