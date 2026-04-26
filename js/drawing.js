class DrawingTool {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.lineWidth = 5;
    this.lineColor = 'black';
    this.lineCap = 'round';
    this.lineJoin = 'round';

    this.ctx.lineCap = this.lineCap;
    this.ctx.lineJoin = this.lineJoin;

    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => this.draw(e.touches[0]));
    canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  startDrawing(e) {
    this.drawing = true;
    this.lastX = e.clientX - this.canvas.offsetLeft;
    this.lastY = e.clientY - this.canvas.offsetTop;
  }

  draw(e) {
    if (!this.drawing) return;

    const x = e.clientX - this.canvas.offsetLeft;
    const y = e.clientY - this.canvas.offsetTop;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.drawing = false;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  changeLineColor(color) {
    this.lineColor = color;
  }

  changeLineWidth(width) {
    this.lineWidth = width;
  }
}

// Example usage:
const canvas = document.getElementById('drawing-canvas');
const drawingTool = new DrawingTool(canvas);

document.getElementById('clear-button').addEventListener('click', () => drawingTool.clearCanvas());
document.getElementById('black-button').addEventListener('click', () => drawingTool.changeLineColor('black'));
document.getElementById('red-button').addEventListener('click', () => drawingTool.changeLineColor('red'));
document.getElementById('blue-button').addEventListener('click', () => drawingTool.changeLineColor('blue'));
document.getElementById('thin-button').addEventListener('click', () => drawingTool.changeLineWidth(1));
document.getElementById('thick-button').addEventListener('click', () => drawingTool.changeLineWidth(10));
