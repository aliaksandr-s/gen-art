const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const settings = {
  dimensions: [ 50, 70 ],
  pixelsPerInch: 100,
  units: 'cm',
};

const sketch = ({ seed }) => {
  if (seed) {
    random.setSeed(seed)
  } 

  // const colorCount = random.rangeFloor(1, 6);
  const colorCount = 3;
  const palette = random.shuffle(random.pick(palettes))
    .slice(0, colorCount);

  const createGrid = () => {
    const points = [];

    const count = random.rangeFloor(20, 35);
    // const count = 30;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        points.push({
          position: [u, v],
          radius: Math.abs(random.rangeFloor(0.005, 0.01) + random.gaussian() * 0.005),
          // radius: random.value() * 0.01,
          color: random.pick(palette),
        })
      }
    }
    return points;
  }

  const points = createGrid().filter(() => random.value() > 0.7);
  const margin = 7;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        position,
        radius,
        color,
      } = data;

      const [u, v] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.beginPath();
      context.arc(x, y, radius * width, Math.PI * 2, false)
      context.fillStyle = color;
      context.fill();
    })
  };
};

const start = async () => {
  const seed = new Date().toISOString();
  console.log(seed);
  // const seed = '2021-10-15T17:36:42.425Z';
  const manager = await canvasSketch(
    () => sketch({ seed }), 
    { ...settings, name: seed },
  );

  window.addEventListener('click', () => {
    const seed = new Date().toISOString();
    manager.loadAndRun(
      () => sketch({ seed }), 
      { ...settings, name: seed },
    );
  });
};

start()
