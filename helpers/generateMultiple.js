const canvasSketch = require('canvas-sketch');

const generateMultiple = async ({
  sketch,
  settings,
  count,
}) => {
  const seed = new Date().toISOString();
  const manager = await canvasSketch(
    () => sketch({ seed }), 
    { ...settings, name: seed },
  );

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const seed = new Date().toISOString();
      manager.exportFrame();
      manager.loadAndRun(
        () => sketch({ seed }), 
        { ...settings, name: seed },
      );
    }, 10);
  }
}

module.exports = generateMultiple;
