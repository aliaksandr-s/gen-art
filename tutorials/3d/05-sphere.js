// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const eases = require('eases');
const glslify = require('glslify');

const settings = {
  dimensions: [ 512, 512 ],
  fps: 24,
  duration: 4,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("hsl(0, 0%, 100%)", 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup your scene
  const scene = new THREE.Scene();

  const palette = random.pick(palettes);

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 color;

    void main() {
      gl_FragColor = vec4(vec3(vUv.x), 1.0);
    }
  `;

  const vertexShader = glslify(`
    varying vec2 vUv;
    uniform float playhead;

    #pragma glslify: noise = require('glsl-noise/simplex/4d');

    void main() {
      vUv = uv;
      vec3 pos = position.xyz;

      pos += 0.05 * normal *  noise(vec4(pos.xyz * 10.0, 0.0));
      pos += 0.15 * normal *  noise(vec4(pos.xyz * 1.0, playhead));
      pos += 0.05 * normal *  noise(vec4(pos.xyz * 100.0, 0.0));

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const meshes = [];
  for (let i = 0; i < 1; i++) {
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        color: { value: new THREE.Color(random.pick(palette)) },
        playhead: { value: 0 }
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(0.65);
    scene.add(mesh);
    meshes.push(mesh);
  }

  scene.add(new THREE.AmbientLight('hsl(0, 0%, 40%)'))

  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(0, 0, 4);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 1.5;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead, time }) {
      const t = Math.sin(playhead * Math.PI);
      scene.rotation.y = eases.expoInOut(t);
      
      meshes.forEach(mesh => {
        mesh.material.uniforms.playhead.value = playhead;
      });

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
