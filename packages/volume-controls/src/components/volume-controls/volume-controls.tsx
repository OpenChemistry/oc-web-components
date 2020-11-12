import { Component, Prop, Element, Event, EventEmitter, Watch, h } from '@stencil/core';

import { scaleLinear, ScaleLinear, scaleLog, ScaleLogarithmic } from 'd3';

import ResizeObserver from 'resize-observer-polyfill';

@Component({
  tag: 'oc-volume-controls',
  styleUrl: 'volume-controls.css',
  shadow: true
})
export class VolumeControls {

  @Prop() colors: [number, number, number][];
  @Prop() colorsX: number[];

  @Prop() opacities: number[];
  @Prop() opacitiesX: number[];

  // The full range of the data
  @Prop() range: [number, number];
  @Watch('range')
  watchRange() {
    this.updateScales();
  }

  @Prop() histograms: number[] = [];

  @Element() el: HTMLElement;

  @Event() opacitiesChanged: EventEmitter;

  canvas: HTMLCanvasElement;
  c: CanvasRenderingContext2D;

  ghostCanvas: HTMLCanvasElement;
  ghostC: CanvasRenderingContext2D;

  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  yScaleHist: ScaleLogarithmic<number, number>;

  activeNode: number;

  ro: ResizeObserver;

  componentDidLoad() {
    this.onResize();
    this.ro = new ResizeObserver(() => {
      this.onResize();
    });
    this.ro.observe(this.el.parentElement);

  }

  componentWillUpdate() {
    this.drawCanvas();
  }

  disconnectedCallback() {
    this.ro.unobserve(this.el.parentElement);
    this.ro.disconnect();
  }

  onResize() {
    if (!this.canvas || !this.ghostCanvas) {
      return;
    }
    let w = this.el.parentElement.clientWidth;
    let h = this.el.parentElement.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ghostCanvas.width = w;
    this.ghostCanvas.height = h;
    this.updateScales();
    this.drawCanvas();
  }

  updateScales() {
    let w = this.el.parentElement.clientWidth;
    let h = this.el.parentElement.clientHeight;
    this.xScale = scaleLinear().domain(this.range).range([0, w]);
    this.yScale = scaleLinear().domain([0, 1]).range([h, 0]);
    if (this.histograms.length > 0) {
      let high = Math.max(...this.histograms);
      this.yScaleHist = scaleLog().domain([1, high]).range([h, h / 2]);
    }
  }

  onMouseDown(ev: MouseEvent) {
    this.activeNode = this._getNodeOnCanvas(ev.clientX, ev.clientY);
  }

  onDblClick(ev: MouseEvent) {
    let node = this._getNodeOnCanvas(ev.clientX, ev.clientY);
    if (node === undefined) {
      const {x, y} = this._mouseToXY(ev.clientX, ev.clientY);
      this.addOpacityNode(x, y);
    }
  }

  onAuxClick(ev: MouseEvent) {
    let node = this._getNodeOnCanvas(ev.clientX, ev.clientY);
    if (node !== undefined) {
      if (node > 0 && node < this.opacitiesX.length - 1) {
        this.removeOpacityNode(node);
      }
    }
  }

  _getNodeOnCanvas(mX, mY) {
    let rect = this.canvas.getBoundingClientRect();
    let x = mX - rect.left;
    let y = mY - rect.top;
    let col = this.ghostC.getImageData(x, y, 1, 1).data;

    // the canvas is transparent anywhere but where the nodes are
    if (col[3] === 255) {
      return col[0];
    }
    return undefined;
  }

  _mouseToXY(mX: number, mY: number) {
    let rect = this.canvas.getBoundingClientRect();
    let x = this.xScale.invert(mX - rect.left);
    let y = this.yScale.invert(mY - rect.top);
    return {x, y};
  }

  addOpacityNode(x: number, y: number) {
    let idx = 0;
    for (let i = 0; i < this.opacitiesX.length; ++i) {
      if (this.opacitiesX[i] > x) {
        break;
      }
      idx++;
    }

    const opacitiesX = [...this.opacitiesX.slice(0, idx), x, ...this.opacitiesX.slice(idx)];
    const opacities = [...this.opacities.slice(0, idx), y, ...this.opacities.slice(idx)];
    this.opacitiesChangedHandler(opacities, opacitiesX);
  }

  removeOpacityNode(idx: number) {
    const opacitiesX = [...this.opacitiesX.slice(0, idx), ...this.opacitiesX.slice(idx + 1)];
    const opacities = [...this.opacities.slice(0, idx), ...this.opacities.slice(idx + 1)];
    this.opacitiesChangedHandler(opacities, opacitiesX);
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
    let {x, y} = this._mouseToXY(mX, mY);
    let dx = (this.range[1] - this.range[0]) * 0.001;

    y = Math.min(1, y);
    y = Math.max(0, y);
    x = Math.min(this.range[1], x);
    x = Math.max(this.range[0], x);
    if (i > 0) {
      x = Math.max(this.opacitiesX[i - 1] + dx, x);
    }
    if (i < this.opacitiesX.length - 1) {
      x = Math.min(this.opacitiesX[i + 1] - dx, x);
    }

    if (this.opacitiesX[i] !== x || this.opacities[i] !== y){
      const opacitiesX = [...this.opacitiesX];
      const opacities = [...this.opacities];
      opacitiesX[i] = x;
      opacities[i] = y;
      this.opacitiesChangedHandler(opacities, opacitiesX);
    }
  }

  opacitiesChangedHandler(opacities: number[], opacitiesX: number[]) {
    let val = {
      opacity: opacities,
      opacityScalarValue: opacitiesX
    }
    this.opacitiesChanged.emit(val);
  }

  drawCanvas() {
    let opacity = 1;
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ghostC.clearRect(0, 0, this.ghostCanvas.width, this.ghostCanvas.height);
    this.drawBackGround(opacity);
    this.drawOpacityControls(opacity);
    this.drawHistograms(opacity);
  }

  drawBackGround(globalOpacity: number) {
    let grad = this.c.createLinearGradient(0, 0, this.canvas.width, 0);

    /*  Efficiently merge the points on the X axis of the color transfer function
        and the opacity piecewise function, to create a fill gradient with the
        minimum number of nodes that will still reproduce exactly the combined
        color/opacity map.
    */

    // If the range of the colormap is smaller than the range of the data,
    // add an additional stop on the gradient to prevent the canvas from being white
    let colors = this.colors;
    let colorsX = this.colorsX;
    if (colorsX[0] > this.range[0]) {
      colors = [colors[0], ...colors];
      colorsX = [this.range[0], ...colorsX];
    }

    if (colorsX[colorsX.length - 1] < this.range[1]) {
      colors = [...colors, this.colors[this.colors.length - 1]];
      colorsX = [...colorsX, this.range[1]];
    }

    let colorIdx = 0;
    let opacityIdx = 0;

    let delta = this.range[1] - this.range[0];

    while (colorIdx < colors.length && opacityIdx < this.opacities.length) {
      let xCol = colorsX[colorIdx];
      let xOp = this.opacitiesX[opacityIdx];
      let x = Math.max(xCol, xOp);

      let r: number;
      let g: number;
      let b: number;
      let frac: number;
      if (x === colorsX[colorIdx]) {
        [r, g, b] = colors[colorIdx];
        frac = 0;
      } else {
        const [r0, g0, b0] = colors[colorIdx];
        const [r1, g1, b1] = colors[colorIdx + 1];
        frac = (colorsX[colorIdx + 1] - x) / (colorsX[colorIdx + 1] - colorsX[colorIdx]);
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

      grad.addColorStop((x - this.range[0]) / delta, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${globalOpacity * opacity})`);

      if (colorIdx < colorsX.length - 1) {
        xCol = colorsX[colorIdx + 1];
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
    let gray = 32;
    this.c.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, ${globalOpacity})`
    this.c.lineWidth = 2;
    this.c.beginPath();
    for (let i = 0; i < this.opacitiesX.length; ++i) {
      let x: number = this.xScale(this.opacitiesX[i]);
      let y:number = this.yScale(this.opacities[i]);
      this.c.lineTo(x, y);
      if (i === 0) {
        this.c.moveTo(x, y);
      } else {
        this.c.lineTo(x, y);
      }
    }
    this.c.stroke();

    this.c.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${globalOpacity})`
    for (let i = 0; i < this.opacitiesX.length; ++i) {
      let x: number = this.xScale(this.opacitiesX[i]);
      let y:number = this.yScale(this.opacities[i]);
      this.c.beginPath();
      this.c.arc(x, y, 6, 0, 2 * Math.PI);
      this.c.fill();

      // Use unique color needed to build the color to node map
      this.ghostC.fillStyle = `rgb(${i}, ${i}, ${i})`
      this.ghostC.beginPath();
      this.ghostC.arc(x, y, 12, 0, 2 * Math.PI);
      this.ghostC.fill();
    }
  }

  drawHistograms(globalOpacity: number) {
    if (this.histograms.length === 0) {
      return;
    }
    let gray = 128;
    let opacity = 0.3;
    let width = this.canvas.width / this.histograms.length;
    let delta = this.range[1] - this.range[0];
    this.c.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${opacity * globalOpacity})`;
    for (let i = 0; i < this.histograms.length; ++i) {
      let x0 = this.xScale(this.range[0] + delta * i / this.histograms.length);
      let y0 = this.yScaleHist(this.histograms[i]);
      this.c.fillRect(x0, y0, width, this.canvas.height - y0);
    }
  }

  render() {
    return (
      <div class="canvas-container">
        <canvas
          hidden={true}
          ref={(ref: HTMLCanvasElement) => {
            this.ghostCanvas = ref;
            if (ref) {
              this.ghostC = ref.getContext('2d');
            }
          }}
        >
        </canvas>
        <canvas
          draggable={true}
          onContextMenu={(ev) => {ev.preventDefault();}}
          onMouseDown={(e: MouseEvent) => {this.onMouseDown(e)}}
          onDblClick={(e: MouseEvent) => {this.onDblClick(e)}}
          onDragStart={(e: DragEvent) => {this.onDragStart(e)}}
          onAuxClick={(e: MouseEvent) => {this.onAuxClick(e)}}
          ref={(ref: HTMLCanvasElement) => {
            this.canvas = ref;
            if (ref) {
              this.c = ref.getContext('2d');
            }
          }}
        >
        </canvas>
      </div>
    );
  }
}
