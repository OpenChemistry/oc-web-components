import { Component, Prop, Element, Event, EventEmitter } from '@stencil/core';

import { scaleLinear, ScaleLinear, scaleLog, ScaleLogarithmic } from 'd3';

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

  @Prop() range: [number, number] = [0, 1];

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
    this.ro = new ResizeObserver(() => {
      this.onResize();
    });
    this.ro.observe(this.el.parentElement);

  }

  componentDidUpdate() {
    if (this.colorsX.length !== this.colors.length) {
      this.colorsX = this.defaultX(this.colors.length);
    }
    if (this.opacitiesX.length !== this.opacities.length) {
      this.opacitiesX = this.defaultX(this.opacities.length);
    }
    this.drawCanvas();
  }

  componentDidUnload() {
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
    this.xScale = scaleLinear().domain(this.range).range([0, w]);
    this.yScale = scaleLinear().domain([0, 1]).range([h, 0]);
    if (this.histograms.length > 0) {
      let high = Math.max(...this.histograms);
      this.yScaleHist = scaleLog().domain([1, high]).range([h, h / 2]);
    }
    this.drawCanvas();
  }

  onMouseDown(ev: MouseEvent) {
    this.activeNode = this._getNodeOnCanvas(ev.clientX, ev.clientY);
  }

  onDblClick(ev: MouseEvent) {
    let node = this._getNodeOnCanvas(ev.clientX, ev.clientY);
    if (node === undefined) {
      const {x, y} = this._mouseToXY(ev.clientX, ev.clientY);
      this.addOpacityNode(x, y);
      this.drawCanvas();
    }
  }

  onAuxClick(ev: MouseEvent) {
    let node = this._getNodeOnCanvas(ev.clientX, ev.clientY);
    if (node !== undefined) {
      this.removeOpacityNode(node);
      this.drawCanvas();
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
    this.opacitiesX = [...this.opacitiesX.slice(0, idx), x, ...this.opacitiesX.slice(idx)];
    this.opacities = [...this.opacities.slice(0, idx), y, ...this.opacities.slice(idx)];
    this.opacitiesChangedHandler();
  }

  removeOpacityNode(idx: number) {
    this.opacitiesX = [...this.opacitiesX.slice(0, idx), ...this.opacitiesX.slice(idx + 1)];
    this.opacities = [...this.opacities.slice(0, idx), ...this.opacities.slice(idx + 1)];
    this.opacitiesChangedHandler();
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
    } else {
      x = this.range[0];
    }
    if (i < this.opacitiesX.length - 1) {
      x = Math.min(this.opacitiesX[i + 1] - dx, x);
    } else {
      x = this.range[1];
    }

    if (this.opacitiesX[i] !== x || this.opacities[i] !== y){
      this.opacitiesX[i] = x;
      this.opacities[i] = y;
      this.opacitiesChangedHandler();
      this.drawCanvas();
    }
  }

  opacitiesChangedHandler() {
    let val = {
      opacity: this.opacities,
      opacityScalarValue: this.opacitiesX
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

  defaultX(n: number): number[] {
    let x: number[] = [];
    let delta = this.range[1] - this.range[0];
    for (let i = 0; i < n; ++i) {
      let val = this.range[0] + delta * (i / (n - 1));
      x.push(val);
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

    let delta = this.range[1] - this.range[0];

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

      grad.addColorStop((x - this.range[0]) / delta, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${globalOpacity * opacity})`);

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
      this.c.arc(x, y, 9, 0, 2 * Math.PI);
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
