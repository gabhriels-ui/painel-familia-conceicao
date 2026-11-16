import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|mesa offscreen/i.test(rendererStr);
  } catch {
    return false;
  }
}

export function checkWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createMedievalRenderer(
  container: HTMLElement,
  isSoftwareGl: boolean
): THREE.WebGLRenderer {
  const width = Math.max(container.clientWidth, 120);
  const height = Math.max(container.clientHeight, 120);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !isSoftwareGl;
  if (!isSoftwareGl) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.outline = 'none';

  return renderer;
}

export function attachStudioLighting(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  options?: {
    keyColor?: number;
    keyIntensity?: number;
    rimColor?: number;
    rimIntensity?: number;
    isSoftwareGl?: boolean;
  }
): () => void {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envTarget = pmrem.fromScene(roomEnv, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.85;
  roomEnv.dispose();
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xffe9b5, 0x161b26, 0.55);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(
    options?.keyColor ?? 0xfff0c8,
    options?.keyIntensity ?? 2.2
  );
  keyLight.position.set(3.5, 4.8, 3.8);
  if (!options?.isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 3.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(
    options?.rimColor ?? 0x60a5fa,
    options?.rimIntensity ?? 1.15
  );
  rimLight.position.set(-3.2, 2.2, -3.4);
  scene.add(rimLight);

  return () => {
    envTarget.dispose();
  };
}

export function createSoftFrameScheduler(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
): {
  scheduleNext: (tick: () => void) => void;
  cancel: () => void;
} {
  let stopped = false;
  let rafId = 0;
  let timerId = 0;

  const scheduleNext = (tick: () => void) => {
    if (stopped) return;
    if (!isSoftwareGl) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const gl = renderer.getContext();
    if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        timerId = window.setTimeout(() => {
          if (!stopped) rafId = requestAnimationFrame(tick);
        }, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (stopped) {
          gl.deleteSync(sync);
          return;
        }
        const status = gl.clientWaitSync(sync, 0, 0);
        if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) {
          gl.deleteSync(sync);
          timerId = window.setTimeout(() => {
            if (!stopped) rafId = requestAnimationFrame(tick);
          }, 80);
        } else {
          timerId = window.setTimeout(poll, 8);
        }
      };
      poll();
    } else {
      timerId = window.setTimeout(() => {
        if (!stopped) rafId = requestAnimationFrame(tick);
      }, 80);
    }
  };

  const cancel = () => {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) window.clearTimeout(timerId);
  };

  return { scheduleNext, cancel };
}

export function disposeObject3D(root: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const anyObj = obj as THREE.Mesh;
    if (anyObj.geometry) {
      geometries.add(anyObj.geometry);
    }
    if (anyObj.material) {
      const list = Array.isArray(anyObj.material) ? anyObj.material : [anyObj.material];
      for (const mat of list) {
        materials.add(mat);
        for (const val of Object.values(mat)) {
          if (val && typeof val === 'object' && 'isTexture' in val) {
            textures.add(val as THREE.Texture);
          }
        }
      }
    }
  });

  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
