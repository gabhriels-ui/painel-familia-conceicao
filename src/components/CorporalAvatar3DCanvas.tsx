import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BODY_AVATAR_TIERS } from '../data/chroniclesData';
import {
  attachStudioLighting,
  checkWebGLAvailable,
  createMedievalRenderer,
  createSoftFrameScheduler,
  detectSoftwareWebGL,
  disposeObject3D,
  prefersReducedMotion,
} from '../utils/threeRuntime';

interface CorporalAvatar3DCanvasProps {
  bodyXp: number;
  tierIdx: number;
}

export function CorporalAvatar3DCanvas({
  bodyXp,
  tierIdx,
}: CorporalAvatar3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ bodyXp, tierIdx });
  propsRef.current = { bodyXp, tierIdx };

  const [webglSupported] = useState(() => checkWebGLAvailable());
  const [contextLost, setContextLost] = useState(false);

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
    camera.position.set(0.85, 0.65, 2.75);

    const renderer = createMedievalRenderer(container, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const disposeEnv = attachStudioLighting(scene, renderer, {
      keyColor: 0xffe4aa,
      keyIntensity: 2.35,
      rimColor: 0x38bdf8,
      rimIntensity: 1.2,
      isSoftwareGl,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.55;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(0, 0.14, 0);
    controls.update();

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Contact shadow & hexagonal warrior plinth
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.96, 32),
      new THREE.MeshBasicMaterial({ color: 0x050608, transparent: true, opacity: 0.58 })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.82;
    rootGroup.add(shadowDisc);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1a1f28,
      metalness: 0.85,
      roughness: 0.32,
    });
    const trimGoldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x5c3804,
      emissiveIntensity: 0.35,
    });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.78, 0.12, 6), plinthMat);
    plinth.position.y = -0.74;
    plinth.receiveShadow = !isSoftwareGl;
    rootGroup.add(plinth);

    const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.018, 8, 48), trimGoldMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = -0.68;
    rootGroup.add(plinthRing);

    // Warrior Figure Group
    const warriorGroup = new THREE.Group();
    rootGroup.add(warriorGroup);

    // Dynamic armor/muscle materials updated cleanly per tier & bodyXp
    const armorPrimaryMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
    });
    const skinOrUndersuitMat = new THREE.MeshStandardMaterial({
      color: 0x8a5b3e,
      metalness: 0.25,
      roughness: 0.52,
    });
    const crimsonCapeMat = new THREE.MeshStandardMaterial({
      color: 0x88131d,
      metalness: 0.15,
      roughness: 0.68,
      side: THREE.DoubleSide,
    });
    const visorGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    // Core Waist & Abdominal Sculpted Segments
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.56, 16), skinOrUndersuitMat);
    waist.position.y = -0.32;
    warriorGroup.add(waist);

    // Sculpted Pectoral & Ribcage Group (scales with bodyXp relief)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.14, 0);
    warriorGroup.add(chestGroup);

    const ribcage = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.27, 0.52, 16), armorPrimaryMat);
    ribcage.scale.set(1.12, 1, 0.78);
    ribcage.castShadow = !isSoftwareGl;
    chestGroup.add(ribcage);

    const pecGeo = new THREE.SphereGeometry(0.2, 18, 14);
    const pecLeft = new THREE.Mesh(pecGeo, armorPrimaryMat);
    pecLeft.scale.set(1.05, 0.82, 0.68);
    pecLeft.position.set(-0.16, 0.08, 0.21);
    chestGroup.add(pecLeft);

    const pecRight = new THREE.Mesh(pecGeo, armorPrimaryMat);
    pecRight.scale.set(1.05, 0.82, 0.68);
    pecRight.position.set(0.16, 0.08, 0.21);
    chestGroup.add(pecRight);

    // Templar Chest Cross Relief
    const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.28, 0.045), trimGoldMat);
    crossVert.position.set(0, 0.05, 0.31);
    chestGroup.add(crossVert);

    const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.055, 0.045), trimGoldMat);
    crossHoriz.position.set(0, 0.11, 0.31);
    chestGroup.add(crossHoriz);

    // Sculpted Deltoid Pauldrons + Bicep/Forearm Arms
    const armGeo = new THREE.CapsuleGeometry(0.095, 0.34, 6, 12);
    const pauldronGeo = new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);

    const leftPauldron = new THREE.Mesh(pauldronGeo, armorPrimaryMat);
    leftPauldron.position.set(-0.46, 0.25, 0);
    leftPauldron.rotation.z = 0.36;
    chestGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, armorPrimaryMat);
    rightPauldron.position.set(0.46, 0.25, 0);
    rightPauldron.rotation.z = -0.36;
    chestGroup.add(rightPauldron);

    const leftArm = new THREE.Mesh(armGeo, skinOrUndersuitMat);
    leftArm.position.set(-0.47, -0.05, 0.04);
    leftArm.rotation.z = 0.14;
    chestGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinOrUndersuitMat);
    rightArm.position.set(0.47, -0.05, 0.04);
    rightArm.rotation.z = -0.14;
    chestGroup.add(rightArm);

    // Neck & Head / Knight Helm
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 12), skinOrUndersuitMat);
    neck.position.y = 0.44;
    warriorGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.62, 0.02);
    warriorGroup.add(headGroup);

    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 16), skinOrUndersuitMat);
    headSphere.scale.set(0.92, 1.08, 0.96);
    headGroup.add(headSphere);

    const helmShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.205, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.72),
      armorPrimaryMat
    );
    helmShell.rotation.x = -0.08;
    headGroup.add(helmShell);

    const visorBand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.042, 0.16), visorGlowMat);
    visorBand.position.set(0, -0.01, 0.14);
    headGroup.add(visorBand);

    const crestPlume = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.28), trimGoldMat);
    crestPlume.position.set(0, 0.21, -0.02);
    headGroup.add(crestPlume);

    // Crimson Cape Draped Behind Shoulders (Tier >= 1)
    const capeShape = new THREE.Shape();
    capeShape.moveTo(-0.32, 0.26);
    capeShape.lineTo(0.32, 0.26);
    capeShape.lineTo(0.48, -0.78);
    capeShape.lineTo(-0.48, -0.78);
    capeShape.closePath();
    const capeMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(capeShape, { depth: 0.02, bevelEnabled: false }),
      crimsonCapeMat
    );
    capeMesh.position.set(0, 0.05, -0.26);
    capeMesh.rotation.x = 0.12;
    warriorGroup.add(capeMesh);

    // Heraldic Heater Shield beside Left Arm (Tier >= 2)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-0.22, 0.26);
    shieldShape.lineTo(0.22, 0.26);
    shieldShape.lineTo(0.22, -0.04);
    shieldShape.quadraticCurveTo(0.2, -0.26, 0, -0.36);
    shieldShape.quadraticCurveTo(-0.2, -0.26, -0.22, -0.04);
    shieldShape.closePath();

    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.56, -0.04, 0.22);
    shieldGroup.rotation.y = 0.42;
    const shieldBody = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.03,
        bevelEnabled: true,
        bevelSize: 0.015,
        bevelThickness: 0.015,
        bevelSegments: 3,
      }),
      plinthMat
    );
    const shieldCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.05), trimGoldMat);
    shieldCrossV.position.set(0, -0.02, 0.03);
    const shieldCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.045, 0.05), trimGoldMat);
    shieldCrossH.position.set(0, 0.06, 0.03);
    shieldGroup.add(shieldBody, shieldCrossV, shieldCrossH);
    warriorGroup.add(shieldGroup);

    // Floating Paladin Aura Ring (Tier >= 3)
    const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.014, 8, 56), trimGoldMat);
    auraRing.rotation.x = Math.PI * 0.48;
    auraRing.position.y = -0.15;
    warriorGroup.add(auraRing);

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
      const { bodyXp: curXp, tierIdx: curTier } = propsRef.current;

      // Musculature & 3D relief scales dynamically with bodyXp
      const hypertrophy = Math.min(0.26, (curXp / 850) * 0.26);
      chestGroup.scale.set(1 + hypertrophy * 0.85, 1 + hypertrophy * 0.35, 1 + hypertrophy * 0.95);
      leftArm.scale.set(1 + hypertrophy * 1.15, 1, 1 + hypertrophy * 1.15);
      rightArm.scale.set(1 + hypertrophy * 1.15, 1, 1 + hypertrophy * 1.15);
      leftPauldron.scale.setScalar(0.85 + curTier * 0.14 + hypertrophy * 0.4);
      rightPauldron.scale.setScalar(0.85 + curTier * 0.14 + hypertrophy * 0.4);

      // Armor material progression by tier
      const isPaladin = curTier >= 3;
      const isSteel = curTier >= 2;
      const isIron = curTier >= 1;

      if (isPaladin) {
        _targetColor.setHex(0xeab308);
        armorPrimaryMat.color.lerp(_targetColor, 0.15);
        armorPrimaryMat.metalness = 0.92;
        armorPrimaryMat.roughness = 0.18;
      } else if (isSteel) {
        _targetColor.setHex(0x94a3b8);
        armorPrimaryMat.color.lerp(_targetColor, 0.15);
        armorPrimaryMat.metalness = 0.88;
        armorPrimaryMat.roughness = 0.24;
      } else if (isIron) {
        _targetColor.setHex(0x475569);
        armorPrimaryMat.color.lerp(_targetColor, 0.15);
        armorPrimaryMat.metalness = 0.78;
        armorPrimaryMat.roughness = 0.34;
      } else {
        _targetColor.setHex(0x7c5338);
        armorPrimaryMat.color.lerp(_targetColor, 0.15);
        armorPrimaryMat.metalness = 0.28;
        armorPrimaryMat.roughness = 0.48;
      }

      capeMesh.visible = isIron;
      crossVert.visible = isIron;
      crossHoriz.visible = isIron;
      helmShell.visible = isSteel;
      visorBand.visible = isSteel;
      shieldGroup.visible = isSteel;
      crestPlume.visible = isPaladin;
      auraRing.visible = isPaladin;

      // Subtle breathing & aura float
      warriorGroup.position.y = Math.sin(elapsed * 1.7) * 0.022;
      auraRing.rotation.z = elapsed * 0.4;
      visorGlowMat.emissiveIntensity = 1.4 + Math.sin(elapsed * 2.8) * 0.35;

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

  const tierName = BODY_AVATAR_TIERS[tierIdx]?.name ?? 'Recruta da Guarnição';

  return (
    <div className="relative w-full sm:w-44 h-48 rounded-lg overflow-hidden bg-radial from-[#261d0f] via-[#12141a] to-[#090a0d] border border-[#eab308]/40 shrink-0">
      {webglSupported && !contextLost ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          role="img"
          aria-label={`Avatar corporal 3D na patente ${tierName} com relevo proporcional a ${bodyXp} XP`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
          <div className="font-epic text-xs text-[#fde047]">{tierName}</div>
          <div className="text-xs font-mono-num text-[#a89982] mt-1">
            {bodyXp.toLocaleString('pt-BR')} XP Corporal
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-1.5 left-2 right-2 text-center">
        <span className="inline-block px-2 py-0.5 rounded bg-[#0c0d10]/85 border border-[#eab308]/35 text-[10px] font-mono-num text-[#fde047]">
          Tônus 3D · Grau {tierIdx + 1}/4
        </span>
      </div>
    </div>
  );
}
