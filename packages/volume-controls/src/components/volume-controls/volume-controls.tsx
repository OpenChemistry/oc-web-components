import { Component, Prop, Element } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

@Component({
  tag: 'oc-volume-controls',
  styleUrl: 'volume-controls.css',
  shadow: true
})
export class VolumeControls {

  @Prop() colors: [number, number, number][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  @Prop({mutable: true}) colorsX: number[];

  @Prop({mutable: true}) opacities: number[] = [0, 1];
  @Prop({mutable: true}) opacitiesX: number[];

  @Element() el: HTMLElement;

  canvas: HTMLCanvasElement;
  c: CanvasRenderingContext2D;

  ghostCanvas: HTMLCanvasElement;
  ghostC: CanvasRenderingContext2D;

  activeNode: number;
  
  componentWillLoad() {
    if (!this.colorsX) {
      this.colorsX = this.defaultX(this.colors.length);
    }
    if (!this.opacitiesX) {
      this.opacitiesX = this.defaultX(this.opacities.length);
    }
  }

  componentDidLoad() {
    this.onResize();
    const ro = new ResizeObserver(() => {
      this.onResize();
    });
    ro.observe(this.el.parentElement);
  }

  onResize() {
    this.canvas.width = this.el.parentElement.clientWidth;
    this.canvas.height = this.el.parentElement.clientHeight;
    this.ghostCanvas.width = this.el.parentElement.clientWidth;
    this.ghostCanvas.height = this.el.parentElement.clientHeight;
    this.drawCanvas();
  }

  onMouseDown(ev: MouseEvent) {
    // ev.preventDefault();
    let rect = this.canvas.getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;
    let col = this.ghostC.getImageData(x, y, 1, 1).data;

    // the canvas is transparent anywhere but where the nodes are
    if (col[3] === 255) {
      this.activeNode = col[0];
    } else {
      this.activeNode = undefined;
    }
    console.log(this.activeNode);
  }

  onDragStart(ev: DragEvent) {
    ev.preventDefault();

    if (this.activeNode === undefined) {
      return;
    }

    let mouseMoveListener = (e: MouseEvent) => {
      this.moveNode(e.clientX, e.clientY, this.activeNode);
    }

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', mouseMoveListener);
    });
  }

  moveNode(mX: number, mY: number, i: number) {
    let rect = this.canvas.getBoundingClientRect();
    let x = (mX - rect.left) / rect.width;
    let y = 1 - (mY - rect.top) / rect.height;

    y = Math.min(1, y);
    y = Math.max(0, y);
    x = Math.min(1, x);
    x = Math.max(0, x);
    if (i > 0) {
      x = Math.max(this.opacitiesX[i - 1], x);
    } else {
      x = 0;
    }
    if (i < this.opacitiesX.length - 1) {
      x = Math.min(this.opacitiesX[i + 1], x);
    } else {
      x = 1;
    }
    this.opacitiesX[i] = x;
    this.opacities[i] = y;
    this.drawCanvas();
  }

  drawCanvas() {
    let opacity = 1;
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ghostC.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
    this.drawBackGround(opacity);
    this.drawOpacityControls(opacity);
  }

  defaultX(n: number): number[] {
    let x: number[] = [];
    for (let i = 0; i < n; ++i) {
      x.push(i / (n - 1));
    }
    return x;
  }

  drawBackGround(globalOpacity: number) {
    let grad = this.c.createLinearGradient(0, 0, this.canvas.width, 0);

    /*  Efficiently merge the points on the X axis of the color transfer function
        and the opacity piecewise function, to create a fill gradient with the
        minimum number of nodes that will still reproduce exactly the combined
        color/opacity map.
    */

    let colorIdx = 0;
    let opacityIdx = 0;

    while (colorIdx < this.colors.length && opacityIdx < this.opacities.length) {
      let xCol = this.colorsX[colorIdx];
      let xOp = this.opacitiesX[opacityIdx];
      let x = Math.max(xCol, xOp);

      let r: number;
      let g: number;
      let b: number;
      let frac: number;
      if (x === this.colorsX[colorIdx]) {
        [r, g, b] = this.colors[colorIdx];
        frac = 0;
      } else {
        const [r0, g0, b0] = this.colors[colorIdx];
        const [r1, g1, b1] = this.colors[colorIdx + 1];
        frac = (this.colorsX[colorIdx + 1] - x) / (this.colorsX[colorIdx + 1] - this.colorsX[colorIdx]);
        r = frac * r0 + (1 - frac) * r1;
        g = frac * g0 + (1 - frac) * g1;
        b = frac * b0 + (1 - frac) * b1;
      }

      let opacity: number;
      if (x === this.opacitiesX[opacityIdx]) {
        opacity = this.opacities[opacityIdx];
      } else {
        frac = (this.opacitiesX[opacityIdx + 1] - x) / (this.opacitiesX[opacityIdx + 1] - this.opacitiesX[opacityIdx]);
        opacity = frac * this.opacities[opacityIdx] + (1 - frac) * this.opacities[opacityIdx + 1];
      }

      grad.addColorStop(x, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${globalOpacity * opacity})`);

      if (colorIdx < this.colorsX.length - 1) {
        xCol = this.colorsX[colorIdx + 1];
      }
      if (opacityIdx < this.opacitiesX.length - 1) {
        xOp = this.opacitiesX[opacityIdx + 1];
      }
      if (xCol === xOp) {
        colorIdx++;
        opacityIdx++;
      } else if (xCol < xOp) {
        colorIdx++;
      } else {
        opacityIdx++;
      }

      if (x === 1) {
        break;
      }
    }
    this.c.fillStyle = grad;
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawOpacityControls(globalOpacity: number) {
    this.c.strokeStyle = `rgba(${0}, ${0}, ${0}, ${globalOpacity})`
    this.c.lineWidth = 2;
    this.c.beginPath();
    for (let i = 0; i < this.opacitiesX.length; ++i) {
      let x: number = this.opacitiesX[i] * this.canvas.width;
      let y:number = this.canvas.height - this.opacities[i] * this.canvas.height;
      this.c.lineTo(x, y);
      if (i === 0) {
        this.c.moveTo(x, y);
      } else {
        this.c.lineTo(x, y);
      }
    }
    this.c.stroke();

    this.c.fillStyle = `rgba(${0}, ${0}, ${0}, ${globalOpacity})`
    for (let i = 0; i < this.opacitiesX.length; ++i) {
      let x: number = this.opacitiesX[i] * this.canvas.width;
      let y:number = this.canvas.height - this.opacities[i] * this.canvas.height;
      this.c.beginPath();
      this.c.arc(x, y, 12, 0, 2 * Math.PI);
      this.c.fill();

      // Use unique color needed to build the color to node map
      this.ghostC.fillStyle = `rgb(${i}, ${i}, ${i})`
      this.ghostC.beginPath();
      this.ghostC.arc(x, y, 30, 0, 2 * Math.PI);
      this.ghostC.fill();
    }
  }


  drawGhostCanvas() {

  }

  drawOpacityCanvas() {

  }

  render() {
    return (
      <div class="canvas-container">
        <canvas
          hidden={true}
          ref={(ref: HTMLCanvasElement) => {
            this.ghostCanvas = ref;
            this.ghostC = ref.getContext('2d');
          }}
        >
        </canvas>
        <canvas
        
          draggable={true}
          onMouseDown={(e: MouseEvent) => {this.onMouseDown(e)}}
          onDragStart={(e: DragEvent) => {this.onDragStart(e)}}
          ref={(ref: HTMLCanvasElement) => {
            this.canvas = ref;
            this.c = ref.getContext('2d');
          }}
        >
        </canvas>
      </div>
    );
  }
}
