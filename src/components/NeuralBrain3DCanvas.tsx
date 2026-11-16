import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ReadingCategory } from '../types/chronicles';
import {
  attachStudioLighting,
  checkWebGLAvailable,
  createMedievalRenderer,
  createSoftFrameScheduler,
  detectSoftwareWebGL,
  disposeObject3D,
  prefersReducedMotion,
} from '../utils/threeRuntime';

interface NeuralBrain3DCanvasProps {
  brainXp: number;
  categoryCounts: Record<ReadingCategory, number>;
}

const AXON_PATHS: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
  // Intra-hemisfericas esquerda (X < 0)
  [new THREE.Vector3(-0.32, 0.56, 0.25), new THREE.Vector3(-0.62, 0.36, 0.08), new THREE.Vector3(-0.46, 0.12, -0.35)],
  [new THREE.Vector3(-0.18, 0.62, -0.18), new THREE.Vector3(-0.56, 0.45, -0.22), new THREE.Vector3(-0.42, 0.05, 0.32)],
  [new THREE.Vector3(-0.54, 0.22, 0.22), new THREE.Vector3(-0.66, 0.16, -0.05), new THREE.Vector3(-0.28, 0.08, -0.45)],
  [new THREE.Vector3(-0.22, 0.32, 0.48), new THREE.Vector3(-0.48, 0.52, 0.15), new THREE.Vector3(-0.25, 0.44, -0.42)],
  [new THREE.Vector3(-0.42, -0.04, 0.18), new THREE.Vector3(-0.55, 0.25, 0.28), new THREE.Vector3(-0.15, 0.58, 0.12)],
  // Intra-hemisfericas direita (X > 0)
  [new THREE.Vector3(0.32, 0.56, 0.25), new THREE.Vector3(0.62, 0.36, 0.08), new THREE.Vector3(0.46, 0.12, -0.35)],
  [new THREE.Vector3(0.18, 0.62, -0.18), new THREE.Vector3(0.56, 0.45, -0.22), new THREE.Vector3(0.42, 0.05, 0.32)],
  [new THREE.Vector3(0.54, 0.22, 0.22), new THREE.Vector3(0.66, 0.16, -0.05), new THREE.Vector3(0.28, 0.08, -0.45)],
  [new THREE.Vector3(0.22, 0.32, 0.48), new THREE.Vector3(0.48, 0.52, 0.15), new THREE.Vector3(0.25, 0.44, -0.42)],
  [new THREE.Vector3(0.42, -0.04, 0.18), new THREE.Vector3(0.55, 0.25, 0.28), new THREE.Vector3(0.15, 0.58, 0.12)],
  // Pontes do corpo caloso (inter-hemisfericas)
  [new THREE.Vector3(-0.36, 0.46, 0.24), new THREE.Vector3(0.0, 0.54, 0.16), new THREE.Vector3(0.36, 0.46, 0.24)],
  [new THREE.Vector3(-0.34, 0.48, -0.18), new THREE.Vector3(0.0, 0.52, -0.15), new THREE.Vector3(0.34, 0.48, -0.18)],
  [new THREE.Vector3(-0.44, 0.24, 0.02), new THREE.Vector3(0.0, 0.34, 0.02), new THREE.Vector3(0.44, 0.24, 0.02)],
  [new THREE.Vector3(-0.26, 0.16, 0.38), new THREE.Vector3(0.0, 0.28, 0.32), new THREE.Vector3(0.26, 0.16, 0.38)],
  // Conexoes ao tronco encefalico
  [new THREE.Vector3(0.0, -0.45, -0.04), new THREE.Vector3(-0.18, 0.02, 0.05), new THREE.Vector3(-0.38, 0.42, 0.14)],
  [new THREE.Vector3(0.0, -0.45, -0.04), new THREE.Vector3(0.18, 0.02, 0.05), new THREE.Vector3(0.38, 0.42, 0.14)],
];

function createCorticalLobeGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.52, 42, 34);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Flatten medial face facing longitudinal fissure
    if (side === -1 && v.x > 0.05) {
      v.x = 0.05 + (v.x - 0.05) * 0.18;
    } else if (side === 1 && v.x < -0.05) {
      v.x = -0.05 + (v.x + 0.05) * 0.18;
    }

    // Elongate anterior-posterior (Z) and slightly sculpt temporal lower curve
    v.z *= 1.32;
    v.y *= 0.94;
    if (v.y < -0.12 && v.z > 0.05) {
      v.y += 0.08 * Math.min(1, v.z * 1.4);
    }

    // Procedural cortical gyri & sulci folding ripples
    const gyriA = Math.sin(v.x * 13.5 + v.z * 9.0) * Math.cos(v.y * 12.0 + v.x * 5.0);
    const gyriB = Math.sin(v.z * 15.0 - v.y * 10.5) * 0.55;
    const ridge = (gyriA + gyriB) * 0.032;

    const dir = v.clone().normalize();
    v.addScaledVector(dir, ridge);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

export function NeuralBrain3DCanvas({
  brainXp,
  categoryCounts,
}: NeuralBrain3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ brainXp, categoryCounts });
  propsRef.current = { brainXp, categoryCounts };

  const [webglSupported] = useState(() => checkWebGLAvailable());
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotion = prefersReducedMotion();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      50
    );
    camera.position.set(1.95, 1.15, 2.75);

    const renderer = createMedievalRenderer(container, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const disposeEnv = attachStudioLighting(scene, renderer, {
      keyColor: 0xffe4a0,
      keyIntensity: 2.35,
      rimColor: 0xf59e0b,
      rimIntensity: 1.35,
      isSoftwareGl,
    });

    // Warm golden point light inside brain core
    const coreLight = new THREE.PointLight(0xfde047, 1.8, 4.5, 2);
    coreLight.position.set(0, 0.34, 0.05);
    scene.add(coreLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.85;
    controls.minPolarAngle = Math.PI * 0.24;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(0, 0.22, 0);
    controls.update();

    // Main Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Contact Shadow Disc & Medieval Brass/Iron Pedestal
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.12, 36),
      new THREE.MeshBasicMaterial({
        color: 0x050608,
        transparent: true,
        opacity: 0.55,
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.68;
    rootGroup.add(shadowDisc);

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1e232b,
      metalness: 0.85,
      roughness: 0.35,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd99b26,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0x5c3804,
      emissiveIntensity: 0.35,
    });

    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.88, 0.1, 8), ironMat);
    basePlate.position.y = -0.62;
    basePlate.receiveShadow = !isSoftwareGl;
    rootGroup.add(basePlate);

    const brassTrim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.022, 10, 48), brassMat);
    brassTrim.rotation.x = Math.PI / 2;
    brassTrim.position.y = -0.57;
    rootGroup.add(brassTrim);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.14, 16), brassMat);
    collar.position.y = -0.51;
    rootGroup.add(collar);

    // 2. Brain Stem & Cerebellum
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x7c5821,
      metalness: 0.62,
      roughness: 0.34,
      emissive: 0x452403,
      emissiveIntensity: 0.3,
    });
    const brainStem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.44, 16), stemMat);
    brainStem.position.set(0, -0.26, -0.05);
    brainStem.rotation.x = -0.15;
    rootGroup.add(brainStem);

    const cerebGeo = new THREE.SphereGeometry(0.22, 20, 16);
    const cerebLeft = new THREE.Mesh(cerebGeo, stemMat);
    cerebLeft.scale.set(1.05, 0.72, 0.86);
    cerebLeft.position.set(-0.18, -0.12, -0.34);
    rootGroup.add(cerebLeft);

    const cerebRight = new THREE.Mesh(cerebGeo, stemMat);
    cerebRight.scale.set(1.05, 0.72, 0.86);
    cerebRight.position.set(0.18, -0.12, -0.34);
    rootGroup.add(cerebRight);

    // 3. Sculpted Cortical Hemispheres (Translucent Amber-Gold Metallic Cortex + Inner Core)
    const brainGroup = new THREE.Group();
    brainGroup.position.set(0, 0.3, 0);
    rootGroup.add(brainGroup);

    const cortexMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2b200d,
      metalness: 0.68,
      roughness: 0.28,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      emissive: 0x92400e,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.84,
    });

    const leftHemisphere = new THREE.Mesh(createCorticalLobeGeometry(-1), cortexMaterial);
    leftHemisphere.position.set(-0.26, 0.02, 0);
    leftHemisphere.castShadow = !isSoftwareGl;
    brainGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(createCorticalLobeGeometry(1), cortexMaterial);
    rightHemisphere.position.set(0.26, 0.02, 0);
    rightHemisphere.castShadow = !isSoftwareGl;
    brainGroup.add(rightHemisphere);

    // Glowing Golden Thalamus / Wisdom Core inside the hemispheres
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.1,
    });
    const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.19, 1), innerCoreMat);
    innerCore.position.set(0, 0.02, 0.02);
    brainGroup.add(innerCore);

    // 4. Axonal Curves & Tubes
    const curves = AXON_PATHS.map((pts) => new THREE.CatmullRomCurve3(pts));
    const axonTubeMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      metalness: 0.4,
      roughness: 0.25,
      transparent: true,
      opacity: 0.68,
    });

    curves.forEach((curve) => {
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.011, 6, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, axonTubeMat);
      brainGroup.add(tubeMesh);
    });

    // 5. Instanced Synaptic Soma Nodes
    const nodePositions: THREE.Vector3[] = [];
    curves.forEach((curve) => {
      nodePositions.push(curve.getPointAt(0.08));
      nodePositions.push(curve.getPointAt(0.92));
    });

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.9,
      roughness: 0.18,
      metalness: 0.2,
    });
    const nodeMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.028, 12, 10),
      nodeMat,
      nodePositions.length
    );
    const dummy = new THREE.Object3D();
    nodePositions.forEach((p, idx) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(idx, dummy.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    brainGroup.add(nodeMesh);

    // 6. Instanced Traveling Electric Synapse Sparks along Axonal Splines
    const sparkCount = 24;
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
    });
    const sparkMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.022, 8, 8),
      sparkMat,
      sparkCount
    );
    brainGroup.add(sparkMesh);

    // 7. Tilted Runic Astrolabe Ring surrounding Brain
    const astrolabeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.96, 0.012, 8, 64),
      brassMat
    );
    astrolabeRing.rotation.set(Math.PI * 0.42, 0.25, 0);
    brainGroup.add(astrolabeRing);

    // Pre-allocated scratch vectors for zero-GC animation loop
    const _sparkPos = new THREE.Vector3();
    const _sparkDummy = new THREE.Object3D();

    const handleContextLost = (ev: Event) => {
      ev.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver(() => {
      const w = Math.max(container.clientWidth, 120);
      const h = Math.max(container.clientHeight, 120);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const pacer = createSoftFrameScheduler(renderer, isSoftwareGl);
    let disposed = false;

    const updateFrame = () => {
      const elapsed = reducedMotion ? 0 : clock.getElapsedTime();
      const { brainXp: curXp, categoryCounts: cats } = propsRef.current;
      const totalSessions =
        (cats.espiritual || 0) +
        (cats.literatura || 0) +
        (cats.tcc || 0) +
        (cats.direito || 0);
      const energy = Math.min(1, 0.22 + curXp / 800 + totalSessions * 0.035);

      // Update glowing materials dynamically without allocation
      cortexMaterial.emissiveIntensity = 0.28 + energy * 0.55 + Math.sin(elapsed * 2.1) * 0.08;
      axonTubeMat.emissiveIntensity = 0.55 + energy * 1.15;
      axonTubeMat.opacity = 0.45 + energy * 0.4;
      innerCoreMat.emissiveIntensity = 1.4 + energy * 2.2 + Math.sin(elapsed * 3.0) * 0.35;
      coreLight.intensity = 1.2 + energy * 2.4;

      innerCore.rotation.y = elapsed * 0.6;
      innerCore.rotation.x = elapsed * 0.35;
      astrolabeRing.rotation.z = elapsed * 0.22;
      brainGroup.position.y = 0.3 + Math.sin(elapsed * 1.4) * 0.025;

      // Animate synaptic nodes gentle breathing
      for (let i = 0; i < nodePositions.length; i++) {
        const pulse = 0.78 + 0.36 * Math.sin(elapsed * (2.2 + energy * 1.4) + i * 0.7);
        _sparkDummy.position.copy(nodePositions[i]);
        _sparkDummy.scale.setScalar(pulse * (0.8 + energy * 0.35));
        _sparkDummy.updateMatrix();
        nodeMesh.setMatrixAt(i, _sparkDummy.matrix);
      }
      nodeMesh.instanceMatrix.needsUpdate = true;

      // Animate electric spark impulses gliding along curved axons
      const sparkSpeed = 0.28 + energy * 0.55;
      for (let i = 0; i < sparkCount; i++) {
        const curve = curves[i % curves.length];
        const t = (elapsed * sparkSpeed + i / sparkCount) % 1;
        curve.getPointAt(t, _sparkPos);
        _sparkDummy.position.copy(_sparkPos);
        const arc = Math.sin(t * Math.PI);
        _sparkDummy.scale.setScalar(0.55 + arc * (0.75 + energy * 0.55));
        _sparkDummy.updateMatrix();
        sparkMesh.setMatrixAt(i, _sparkDummy.matrix);
      }
      sparkMesh.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    const tick = () => {
      if (disposed) return;
      updateFrame();
      if (!reducedMotion) {
        pacer.scheduleNext(tick);
      }
    };

    if (reducedMotion) {
      updateFrame();
    } else {
      pacer.scheduleNext(tick);
    }

    return () => {
      disposed = true;
      pacer.cancel();
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeObject3D(scene);
      disposeEnv();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-lg overflow-hidden bg-radial from-[#221909] via-[#111318] to-[#0a0b0e] border border-[#eab308]/35">
      {webglSupported && !contextLost ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Cérebro 3D dourado interativo com sinapses elétricas e conexões axonais"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="font-epic text-sm text-[#fde047]">
            Córtex Neural Iluminado
          </div>
          <p className="text-xs text-[#a89982] mt-1 font-mono-num">
            {brainXp.toLocaleString('pt-BR')} XP Cerebral ativo nas 4 frentes
          </p>
        </div>
      )}

      {/* Legenda tática discreta nas bordas sem blur sobre o WebGL */}
      <div className="pointer-events-none absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono-num">
        <span className="px-2 py-0.5 rounded bg-[#0c0d10]/85 border border-[#eab308]/40 text-[#fde047]">
          SINAPSES 3D ATIVAS
        </span>
        <span className="px-2 py-0.5 rounded bg-[#0c0d10]/85 border border-white/10 text-[#9e9380]">
          Arraste para orbitar
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-3 right-3 grid grid-cols-4 gap-1.5 text-[10px] font-mono-num">
        <div className="px-1.5 py-1 rounded bg-[#0c0d10]/85 border border-[#fde047]/30 text-[#fde047] truncate text-center">
          Esp. {categoryCounts.espiritual}
        </div>
        <div className="px-1.5 py-1 rounded bg-[#0c0d10]/85 border border-[#38bdf8]/30 text-[#38bdf8] truncate text-center">
          Lit. {categoryCounts.literatura}
        </div>
        <div className="px-1.5 py-1 rounded bg-[#0c0d10]/85 border border-[#c084fc]/30 text-[#c084fc] truncate text-center">
          TCC {categoryCounts.tcc}
        </div>
        <div className="px-1.5 py-1 rounded bg-[#0c0d10]/85 border border-[#34d399]/30 text-[#34d399] truncate text-center">
          Dir. {categoryCounts.direito}
        </div>
      </div>
    </div>
  );
}
