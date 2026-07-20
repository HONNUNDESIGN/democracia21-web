import { useRef, useEffect } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, type OGLRenderingContext } from 'ogl';

type GL = OGLRenderingContext;
type OGLProgram = Program;
type OGLMesh = Mesh;
type OGLTransform = Transform;
type OGLPlane = Plane;

interface ScreenSize {
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface ScrollState {
  position?: number;
  ease: number;
  current: number;
  target: number;
  last: number;
}

interface AutoBindOptions {
  include?: Array<string | RegExp>;
  exclude?: Array<string | RegExp>;
}

interface MediaParams {
  gl: GL;
  geometry: OGLPlane;
  scene: OGLTransform;
  screen: ScreenSize;
  viewport: ViewportSize;
  image: string;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;
}

interface CanvasParams {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  items: string[];
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  scrollEase: number;
  cameraFov: number;
  cameraZ: number;
  onActiveChange?: (index: number | null) => void;
}

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;
varying vec3 vNormal;

float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                              0.0,                                0.0,                                1.0
    );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;
  
  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.) / norm;
  float localprogress = clamp(
    (fract(uPosition) - 0.01 * uDistortion * offset) / (1. - 0.01 * uDistortion),
    0.,
    1.
  );
  localprogress = qinticInOut(localprogress) * PI * 0.16;
  newpos = rotate(newpos, rotationAxis, localprogress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  vec2 imageSize = uImageSize;
  vec2 planeSize = uPlaneSize;

  float imageAspect = imageSize.x / imageSize.y;
  float planeAspect = planeSize.x / planeSize.y;
  vec2 scale = vec2(1.0, 1.0);

  if (planeAspect > imageAspect) {
      scale.x = imageAspect / planeAspect;
  } else {
      scale.y = planeAspect / imageAspect;
  }

  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;

  gl_FragColor = texture2D(tMap, uv);
}
`;

function AutoBind(self: any, { include, exclude }: AutoBindOptions = {}) {
  const getAllProperties = (object: any): Set<[any, string | symbol]> => {
    const properties = new Set<[any, string | symbol]>();
    do {
      for (const key of Reflect.ownKeys(object)) {
        properties.add([object, key]);
      }
    } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);
    return properties;
  };

  const filter = (key: string | symbol) => {
    const match = (pattern: string | RegExp) =>
      typeof pattern === 'string' ? key === pattern : (pattern as RegExp).test(key.toString());

    if (include) return include.some(match);
    if (exclude) return !exclude.some(match);
    return true;
  };

  for (const [object, key] of getAllProperties(self.constructor.prototype)) {
    if (key === 'constructor' || !filter(key)) continue;
    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor && typeof descriptor.value === 'function') {
      self[key] = self[key].bind(self);
    }
  }
  return self;
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function map(num: number, min1: number, max1: number, min2: number, max2: number, round = false): number {
  const num1 = (num - min1) / (max1 - min1);
  const num2 = num1 * (max2 - min2) + min2;
  return round ? Math.round(num2) : num2;
}

class Media {
  gl: GL;
  geometry: OGLPlane;
  scene: OGLTransform;
  screen: ScreenSize;
  viewport: ViewportSize;
  image: string;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;

  program!: OGLProgram;
  plane!: OGLMesh;
  extra = 0;
  padding = 0;
  width = 0;
  widthTotal = 0;
  x = 0;

  constructor({
    gl,
    geometry,
    scene,
    screen,
    viewport,
    image,
    length,
    index,
    planeWidth,
    planeHeight,
    distortion
  }: MediaParams) {
    this.gl = gl;
    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.image = image;
    this.length = length;
    this.index = index;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;

    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      fragment: fragmentShader,
      vertex: vertexShader,
      uniforms: {
        tMap: { value: texture },
        uPosition: { value: 0 },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [0, 0] },
        uSpeed: { value: 0 },
        rotationAxis: { value: [0, 1, 0] },
        distortionAxis: { value: [1, 1, 0] },
        uDistortion: { value: this.distortion },
        uViewportSize: { value: [this.viewport.width, this.viewport.height] },
        uTime: { value: 0 }
      },
      cullFace: false
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  setScale() {
    this.plane.scale.x = (this.viewport.width * this.planeWidth) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * this.planeHeight) / this.screen.height;
    this.plane.position.x = 0;
    this.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: ViewportSize } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      this.program.uniforms.uViewportSize.value = [viewport.width, viewport.height];
    }
    this.setScale();

    // Gap moderado y proporcional al tamaño del plano (no un valor fijo en
    // unidades de mundo, que quedaba enorme comparado con la escala real).
    this.padding = this.plane.scale.x * 0.35;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = -this.widthTotal / 2 + (this.index + 0.5) * this.width;
  }

  update(scroll: ScrollState) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    // Barrido limpio 0..1 mientras el plano cruza el viewport (con margen a
    // cada lado para que la transición no sea instantánea en los bordes).
    const margin = this.viewport.width * 0.5;
    const position = map(this.plane.position.x, -this.viewport.width / 2 - margin, this.viewport.width / 2 + margin, 0, 1);

    this.program.uniforms.uPosition.value = position;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = scroll.current;

    const planeWidth = this.plane.scale.x;
    const viewportWidth = this.viewport.width;
    const leftEdge = this.plane.position.x + planeWidth / 2;
    const rightEdge = this.plane.position.x - planeWidth / 2;

    if (leftEdge < -viewportWidth / 2) {
      this.extra -= this.widthTotal;
    } else if (rightEdge > viewportWidth / 2) {
      this.extra += this.widthTotal;
    }
  }
}

class Canvas {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  items: string[];
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  scroll: ScrollState;
  cameraFov: number;
  cameraZ: number;
  onActiveChange?: (index: number | null) => void;

  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: OGLTransform;
  planeGeometry!: OGLPlane;
  medias!: Media[];
  screen!: ScreenSize;
  viewport!: ViewportSize;
  isDown = false;
  start = 0;
  loaded = 0;
  activeIndex: number | null = null;
  pointerInside = false;

  constructor({
    container,
    canvas,
    items,
    planeWidth,
    planeHeight,
    distortion,
    scrollEase,
    cameraFov,
    cameraZ,
    onActiveChange
  }: CanvasParams) {
    this.container = container;
    this.canvas = canvas;
    this.items = items;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;
    this.scroll = {
      ease: scrollEase,
      current: 0,
      target: 0,
      last: 0
    };
    this.cameraFov = cameraFov;
    this.cameraZ = cameraZ;
    this.onActiveChange = onActiveChange;

    AutoBind(this);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.update();
    this.addEventListeners();
    this.createPreloader();
  }

  createRenderer() {
    this.renderer = new Renderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2)
    });
    this.gl = this.renderer.gl;
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = this.cameraFov;
    this.camera.position.z = this.cameraZ;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 100
    });
  }

  createMedias() {
    this.medias = this.items.map(
      (image, index) =>
        new Media({
          gl: this.gl,
          geometry: this.planeGeometry,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          image,
          length: this.items.length,
          index,
          planeWidth: this.planeWidth,
          planeHeight: this.planeHeight,
          distortion: this.distortion
        })
    );
  }

  createPreloader() {
    this.loaded = 0;
    this.items.forEach(src => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = src;
      image.onload = () => {
        if (++this.loaded === this.items.length) {
          document.documentElement.classList.remove('loading');
          document.documentElement.classList.add('loaded');
        }
      };
    });
  }

  onResize() {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: rect.width, height: rect.height };
    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    this.medias?.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    this.updateHoverFromEvent(e);
    if (!this.isDown || this.scroll.position === undefined) return;
    const x = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * 0.1;
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  // Solo trackpads con gesto horizontal mueven el carrusel; el wheel
  // vertical normal se ignora aquí para que la página (Lenis) siga
  // scrolleando con normalidad al pasar por encima del canvas.
  onWheel(e: WheelEvent) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      this.scroll.target += e.deltaX * 0.005;
    }
  }

  // Determina qué plano está más cerca del cursor en X y notifica el índice activo.
  updateHoverFromEvent(e: MouseEvent | TouchEvent) {
    if (!this.medias?.length) return;
    const clientX = e instanceof TouchEvent ? e.touches[0]?.clientX : e.clientX;
    if (clientX === undefined) return;
    const rect = this.container.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right) {
      this.setActive(null);
      return;
    }
    const normalized = (clientX - rect.left) / rect.width; // 0..1
    const pointerX = (normalized - 0.5) * this.viewport.width;

    let closestIndex = 0;
    let closestDistance = Infinity;
    this.medias.forEach((media, index) => {
      const distance = Math.abs(media.plane.position.x - pointerX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const threshold = this.medias[closestIndex].plane.scale.x / 2;
    this.setActive(closestDistance <= threshold ? closestIndex : null);
  }

  setActive(index: number | null) {
    if (this.activeIndex === index) return;
    this.activeIndex = index;
    this.onActiveChange?.(index);
  }

  onClick(e: MouseEvent) {
    this.updateHoverFromEvent(e);
    if (this.activeIndex !== null) {
      this.onActiveChange?.(this.activeIndex);
    }
  }

  onPointerLeave() {
    this.setActive(null);
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.medias?.forEach(media => media.update(this.scroll));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    requestAnimationFrame(this.update);
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('wheel', this.onWheel as EventListener);
    this.canvas.addEventListener('mousedown', this.onTouchDown);
    this.canvas.addEventListener('mousemove', this.onTouchMove);
    window.addEventListener('mouseup', this.onTouchUp);
    this.canvas.addEventListener('mouseleave', this.onPointerLeave);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('touchstart', this.onTouchDown as EventListener);
    this.canvas.addEventListener('touchmove', this.onTouchMove as EventListener);
    window.addEventListener('touchend', this.onTouchUp as EventListener);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('wheel', this.onWheel as EventListener);
    this.canvas.removeEventListener('mousedown', this.onTouchDown);
    this.canvas.removeEventListener('mousemove', this.onTouchMove);
    window.removeEventListener('mouseup', this.onTouchUp);
    this.canvas.removeEventListener('mouseleave', this.onPointerLeave);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('touchstart', this.onTouchDown as EventListener);
    this.canvas.removeEventListener('touchmove', this.onTouchMove as EventListener);
    window.removeEventListener('touchend', this.onTouchUp as EventListener);
  }
}

interface FlyingPostersProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: string[];
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
  cameraFov?: number;
  cameraZ?: number;
  /** Se dispara con el índice del cuadro activo (hover o click); null si no hay ninguno. */
  onItemActive?: (index: number | null) => void;
}

export default function FlyingPosters({
  items = [],
  planeWidth = 320,
  planeHeight = 320,
  distortion = 3,
  scrollEase = 0.01,
  cameraFov = 45,
  cameraZ = 20,
  className,
  onItemActive,
  ...props
}: FlyingPostersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<Canvas | null>(null);
  const onItemActiveRef = useRef(onItemActive);
  onItemActiveRef.current = onItemActive;

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    instanceRef.current = new Canvas({
      container: containerRef.current,
      canvas: canvasRef.current,
      items,
      planeWidth,
      planeHeight,
      distortion,
      scrollEase,
      cameraFov,
      cameraZ,
      onActiveChange: (index) => onItemActiveRef.current?.(index)
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [items, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ]);

  // Nota: la navegación del carrusel es solo por drag (mouse/touch). El
  // wheel vertical NO se secuestra aquí: debe seguir propagando para que
  // Lenis siga scrolleando la página con normalidad. Si en el futuro se
  // quiere navegar con deltaX horizontal (trackpad), añadir un listener
  // pasivo que solo actúe cuando |deltaX| > |deltaY|.

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden relative z-2 ${className}`} {...props}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
