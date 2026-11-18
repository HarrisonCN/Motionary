import {
  AmbientLight, BufferGeometry, Color, DirectionalLight, DoubleSide, ExtrudeGeometry,
  Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, Shape, SphereGeometry,
  TorusGeometry, WebGLRenderer,
} from 'three';
import { RUNTIME_VERSION, type RuntimeModule } from './registry';

export type InstrumentKind = 'lens' | 'iris' | 'relief';
export interface InstrumentView {
  resize(width: number, height: number): void;
  render(progress: number, tilt: number): void;
  dispose(): void;
}

interface Model {
  group: Group;
  pose(progress: number): void;
}

const tau = Math.PI * 2;
const surface = (color: string, metalness = 0.32) =>
  new MeshStandardMaterial({ color, metalness, roughness: 0.31, side: DoubleSide });

function ring(radius: number, thickness: number, material: MeshStandardMaterial): Mesh {
  return new Mesh(new TorusGeometry(radius, thickness, 8, 64), material);
}

function lens(): Model {
  const group = new Group();
  const barrel = surface('#42505c');
  const copper = surface('#f0b581', 0.46);
  const elements = ['#62a9ab', '#83a9db', '#9589c5'].map(color => surface(color, 0.45));
  const sections = Array.from({ length: 7 }, (_, index) => {
    const part = new Group();
    const radius = 0.71 + Math.abs(3 - index) * 0.055;
    part.add(ring(radius, 0.076, barrel));
    const bevel = ring(radius, 0.021, copper);
    bevel.position.z = 0.064;
    part.add(bevel);
    if (index % 2 === 1) {
      const glass = new Mesh(new SphereGeometry(radius * 0.95, 40, 20), elements[(index - 1) / 2]);
      glass.scale.z = 0.19;
      part.add(glass);
    }
    group.add(part);
    return part;
  });
  group.rotation.set(-0.22, 1.02, -0.24);
  return { group, pose(p) { sections.forEach((part, i) => { part.position.z = (i - 3) * (0.17 + 0.43 * p); }); } };
}

function iris(): Model {
  const group = new Group();
  const count = 9;
  const body = ring(1.12, 0.085, surface('#4c525a'));
  const lip = ring(1.11, 0.022, surface('#ffbc78'));
  lip.position.z = 0.085;
  group.add(body, lip);

  // Each blade pivots about a pin in the housing. The curved leading edges overlap.
  const blade = new Shape();
  blade.moveTo(0, 0);
  blade.quadraticCurveTo(-0.46, 0.25, -1.06, 0.08);
  blade.quadraticCurveTo(-0.86, -0.43, -0.24, -0.54);
  blade.quadraticCurveTo(0.05, -0.27, 0, 0);
  const plate = new ExtrudeGeometry(blade, { depth: 0.016, bevelEnabled: false, curveSegments: 14 });
  const blades = Array.from({ length: count }, (_, i) => {
    const a = i * tau / count;
    const mesh = new Mesh(plate, surface(new Color().setHSL(0.07 + i * 0.004, 0.25, 0.33 + 0.025 * (i % 3)).getStyle()));
    mesh.position.set(Math.cos(a) * 1.008, Math.sin(a) * 1.008, -0.065 + i * 0.01);
    group.add(mesh);
    return mesh;
  });
  group.rotation.set(-0.13, 0.18, -0.12);
  return { group, pose(p) { blades.forEach((part, i) => { part.rotation.z = i * tau / count + 0.14 + 0.81 * p; }); } };
}

function relief(): Model {
  const group = new Group();
  const layers = Array.from({ length: 13 }, (_, i) => {
    const outline = new Shape();
    const level = i / 13;
    for (let j = 0; j < 80; j++) {
      const a = j * tau / 80;
      const r = (1.23 - level * 0.91) * (1 + 0.17 * Math.sin(3 * a + level) + 0.09 * Math.cos(5 * a - level));
      const x = Math.cos(a) * r * 1.17 + level * 0.19;
      const y = Math.sin(a) * r * 0.84;
      if (j === 0) outline.moveTo(x, y);
      else outline.lineTo(x, y);
    }
    outline.closePath();
    const color = new Color('#146a60').lerp(new Color('#cbebb2'), level);
    const part = new Mesh(new ExtrudeGeometry(outline, { depth: 0.042, bevelEnabled: false }), surface(color.getStyle(), 0.12));
    group.add(part);
    return part;
  });
  group.rotation.set(-0.94, -0.13, -0.42);
  return { group, pose(p) { layers.forEach((part, i) => { part.position.z = (i - 6) * (0.055 + p * 0.115); }); } };
}

const models = { lens, iris, relief };

/** A demand-rendered Three.js scene. The caller owns input, visibility and canvas lifetime. */
export function createInstrument(canvas: HTMLCanvasElement, kind: InstrumentKind): InstrumentView {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 30);
  const model = models[kind]();
  const pivot = new Group();
  pivot.add(model.group);
  const key = new DirectionalLight('#fff1dc', 3.0);
  key.position.set(-3, 5, 5);
  const rim = new DirectionalLight('#afd7ff', 2.2);
  rim.position.set(3, 1, -2);
  scene.add(pivot, key, rim, new AmbientLight('#e1eaff', 1.25));
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<MeshStandardMaterial>();
  model.group.traverse(object => {
    if (object instanceof Mesh) {
      geometries.add(object.geometry);
      materials.add(object.material);
    }
  });
  return {
    resize(width, height) {
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.position.z = (kind === 'iris' ? 5.25 : 6.25) / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    render(progress, tilt) {
      model.pose(Math.max(-0.08, Math.min(1.08, progress)));
      pivot.rotation.y = tilt * 0.17;
      renderer.render(scene, camera);
    },
    dispose() {
      geometries.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export interface SpatialInstrumentsApi { createInstrument: typeof createInstrument }
export const spatialInstruments: RuntimeModule<SpatialInstrumentsApi> = {
  id: 'spatial-instruments', version: RUNTIME_VERSION, tier: 'advanced', requires: ['core'], api: { createInstrument },
};
