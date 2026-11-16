import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MedicalExamStatus } from '../types/chronicles';
import {
  attachStudioLighting,
  checkWebGLAvailable,
  createMedievalRenderer,
  createSoftFrameScheduler,
  detectSoftwareWebGL,
  disposeObject3D,
  prefersReducedMotion,
} from '../utils/threeRuntime';

interface VolumetricHeart3DCanvasProps {
  status: MedicalExamStatus;
  bpm?: number;
}

function getStatusPalette(status: MedicalExamStatus): {
  baseColor: number;
  emissiveColor: number;
  ringColor: number;
  label: string;
  textClass: string;
} {
  if (status === 'atencao') {
    return {
      baseColor: 0x8b1e24,
      emissiveColor: 0xef4444,
      ringColor: 0xf87171,
      label: 'Atenção',
      textClass: 'text-red-300',
    };
  }
  if (status === 'acompanhar') {
    return {
      baseColor: 0x991b22,
      emissiveColor: 0xf59e0b,
      ringColor: 0xfbbf24,
      label: 'Acompanhar',
      textClass: 'text-amber-300',
    };
  }
  return {
    baseColor: 0x88131d,
    emissiveColor: 0xd97706,
    ringColor: 0x34d399,
    label: 'Estável',
    textClass: 'text-emerald-300',
  };
}

function createHeartBodyGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.58);
  shape.bezierCurveTo(-0.18, -0.44, -0.62, -0.1, -0.62, 0.25);
  shape.bezierCurveTo(-0.62, 0.56, -0.32, 0.66, -0.14, 0.52);
  shape.bezierCurveTo(-0.05, 0.44, -0.02, 0.36, 0, 0.32);
  shape.bezierCurveTo(0.02, 0.36, 0.05, 0.44, 0.14, 0.52);
  shape.bezierCurveTo(0.32, 0.66, 0.62, 0.56, 0.62, 0.25);
  shape.bezierCurveTo(0.62, -0.1, 0.18, -0.44, 0, -0.58);

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 2,
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.19,
    bevelSegments: 10,
    curveSegments: 32,
  });
  geo.center();
  return geo;
}

export function VolumetricHeart3DCanvas({
  status,
  bpm = 60,
}: VolumetricHeart3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ status, bpm });
  propsRef.current = { status, bpm };

  const [webglSupported] = useState(() => checkWebGLAvailable());
  const [contextLost, setContextLost] = useState(false);

  const palette = getStatusPalette(status);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotion = prefersReducedMotion();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      40
    );
    camera.position.set(0.7, 0.55, 2.55);

    const renderer = createMedievalRenderer(container, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const disposeEnv = attachStudioLighting(scene, renderer, {
      keyColor: 0xffe4b8,
      keyIntensity: 2.35,
      rimColor: 0xfb7185,
      rimIntensity: 1.25,
      isSoftwareGl,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.7;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.64;
    controls.target.set(0, 0.14, 0);
    controls.update();

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Pedestal & Contact Shadow
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.95, 32),
      new THREE.MeshBasicMaterial({ color: 0x050608, transparent: true, opacity: 0.55 })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.76;
    rootGroup.add(shadowDisc);

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1c2028,
      metalness: 0.88,
      roughness: 0.34,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.92,
      roughness: 0.2,
      emissive: 0x573403,
      emissiveIntensity: 0.35,
    });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.09, 8), ironMat);
    plinth.position.y = -0.7;
    plinth.receiveShadow = !isSoftwareGl;
    rootGroup.add(plinth);

    const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.018, 10, 40), goldMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = -0.65;
    rootGroup.add(plinthRing);

    // Heart Composite Group
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, 0.16, 0);
    rootGroup.add(heartGroup);

    const muscleMat = new THREE.MeshPhysicalMaterial({
      color: palette.baseColor,
      metalness: 0.74,
      roughness: 0.24,
      clearcoat: 0.72,
      clearcoatRoughness: 0.18,
      emissive: palette.emissiveColor,
      emissiveIntensity: 0.35,
    });

    const heartMesh = new THREE.Mesh(createHeartBodyGeometry(), muscleMat);
    heartMesh.rotation.z = -0.09; // subtle anatomical apex tilt
    heartMesh.castShadow = !isSoftwareGl;
    heartGroup.add(heartMesh);

    // Aortic Arch & Pulmonary Trunk Vessels
    const aorticCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.36, 0.02),
      new THREE.Vector3(-0.08, 0.68, 0.02),
      new THREE.Vector3(0.1, 0.82, -0.05),
      new THREE.Vector3(0.24, 0.64, -0.14),
    ]);
    const aorticArch = new THREE.Mesh(
      new THREE.TubeGeometry(aorticCurve, 24, 0.085, 12, false),
      goldMat
    );
    heartGroup.add(aorticArch);

    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.34, 0.08),
      new THREE.Vector3(0.26, 0.62, 0.06),
      new THREE.Vector3(0.42, 0.68, -0.02),
    ]);
    const pulmTrunk = new THREE.Mesh(
      new THREE.TubeGeometry(pulmCurve, 18, 0.06, 10, false),
      ironMat
    );
    heartGroup.add(pulmTrunk);

    // Sculpted Gold Coronary Relief Branches on Anterior Wall
    const leftCoronaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.32, 0.34),
      new THREE.Vector3(-0.14, 0.12, 0.37),
      new THREE.Vector3(-0.26, -0.14, 0.33),
      new THREE.Vector3(-0.08, -0.42, 0.27),
    ]);
    const leftCoronary = new THREE.Mesh(
      new THREE.TubeGeometry(leftCoronaryCurve, 20, 0.018, 8, false),
      goldMat
    );
    heartGroup.add(leftCoronary);

    const rightCoronaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.28, 0.34),
      new THREE.Vector3(0.26, 0.08, 0.35),
      new THREE.Vector3(0.22, -0.18, 0.31),
    ]);
    const rightCoronary = new THREE.Mesh(
      new THREE.TubeGeometry(rightCoronaryCurve, 16, 0.016, 8, false),
      goldMat
    );
    heartGroup.add(rightCoronary);

    // Medieval Reliquary Band cradling heart
    const filigreeBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.015, 8, 52),
      goldMat
    );
    filigreeBand.rotation.set(0.32, 0.45, 0);
    heartGroup.add(filigreeBand);

    // Responsive Status Telemetry Halo Ring
    const haloMat = new THREE.MeshStandardMaterial({
      color: palette.ringColor,
      emissive: palette.ringColor,
      emissiveIntensity: 1.5,
      metalness: 0.3,
      roughness: 0.2,
    });
    const statusRing = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.014, 8, 64), haloMat);
    statusRing.rotation.x = Math.PI * 0.48;
    statusRing.position.y = -0.32;
    rootGroup.add(statusRing);

    const _targetColor = new THREE.Color();

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
      const { status: curStatus, bpm: curBpm } = propsRef.current;
      const curPalette = getStatusPalette(curStatus);

      // Update colors dynamically without creating Color objects
      _targetColor.setHex(curPalette.emissiveColor);
      muscleMat.emissive.lerp(_targetColor, 0.12);

      _targetColor.setHex(curPalette.ringColor);
      haloMat.color.lerp(_targetColor, 0.12);
      haloMat.emissive.lerp(_targetColor, 0.12);

      // Realistic lub-dub cardiac cycle phase [0..1)
      const beatsPerSec = Math.max(40, Math.min(160, curBpm)) / 60;
      const phase = (elapsed * beatsPerSec) % 1;
      const lub = Math.exp(-Math.pow((phase - 0.12) / 0.055, 2));
      const dub = 0.65 * Math.exp(-Math.pow((phase - 0.3) / 0.065, 2));
      const pulse = reducedMotion ? 0 : Math.max(lub, dub);

      const scaleFactor = 1 + pulse * 0.085;
      heartGroup.scale.setScalar(scaleFactor);
      heartGroup.position.y = 0.16 + Math.sin(elapsed * 1.6) * 0.02;
      muscleMat.emissiveIntensity = 0.28 + pulse * 0.68;
      haloMat.emissiveIntensity = 1.1 + pulse * 1.4;
      statusRing.scale.setScalar(1 + pulse * 0.045);
      filigreeBand.rotation.z = elapsed * 0.18;

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
    <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-radial from-[#2b0d12] via-[#131116] to-[#0a0b0e] border border-[#eab308]/35 shrink-0">
      {webglSupported && !contextLost ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          role="img"
          aria-label={`Coração metálico volumétrico 3D pulsando a ${bpm} bpm — status ${palette.label}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
          <div className="font-epic text-xs text-[#fde047]">Coração Clínico 3D</div>
          <div className={`text-xs font-mono-num mt-1 ${palette.textClass}`}>
            {bpm} bpm · {palette.label}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono-num">
        <span className="px-2 py-0.5 rounded bg-[#0c0d10]/85 border border-white/10 text-[#f3ead6]">
          FC MÉDIA {bpm} BPM
        </span>
        <span className={`px-2 py-0.5 rounded bg-[#0c0d10]/85 border border-white/10 font-semibold ${palette.textClass}`}>
          {palette.label}
        </span>
      </div>
    </div>
  );
}
