const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const generateMultiple = require('./helpers/generateMultiple');

const settings = {
  dimensions: [ 2048, 2048 ],
};


const sketch = ({ seed }) => {
  if (seed) {
    random.setSeed(seed)
  } 

  const createGrid = () => {
    const points = [];
    const count = 8;
    const palette = random.pick(palettes);

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const rand = random.rangeFloor(0,3);
        points.push({
          cords: [u, v],
          corner: [ 0, 0.5, 1, 1.5 ][rand],
          color: palette[rand],
        })
      }
    }
    return points;
  }

  const points = createGrid();
  const margin = 400;

  return ({ context, width, height }) => {
    const bgColor = 'white';
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      const [ u, v ] = point.cords;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      const arcStart = Math.PI * point.corner;
      const arcEnd = arcStart + Math.PI * 1.5;

      context.strokeStyle = '#C2768E';
      context.fillStyle = point.color;

      context.beginPath();
      context.arc(x, y, 50, arcStart, arcEnd, false);
      context.lineWidth = 5;
      context.lineTo(x, y);
      // context.stroke();
      context.fill();
    })
  };
};


const start = async () => {
  // const seed = '2021-10-15T17:36:42.425Z';
  const seed = new Date().toISOString();
  console.log(seed);

  const manager = await canvasSketch(
    () => sketch({ seed }), 
    { ...settings, name: seed },
  );

  // window.addEventListener('click', () => {
  //   const seed = new Date().toISOString();
  //   console.log(seed);
  //   manager.loadAndRun(
  //     () => sketch({ seed }), 
  //     { ...settings, name: seed },
  //   );
  // });
};

start()

// generateMultiple({
//   sketch,
//   settings,
//   count: 30,
// })
