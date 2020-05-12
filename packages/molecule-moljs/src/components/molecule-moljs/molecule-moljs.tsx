import { Component, Prop, Watch, Element, h } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { IAtomSpec } from '@openchemistry/types';
import { IChemJson, ICube } from '@openchemistry/types';
import { IDisplayOptions, IIsoSurfaceOptions } from '@openchemistry/types';
import { validateChemJson, isChemJson } from '@openchemistry/utils';
import { cjsonToMoljs } from '@openchemistry/utils';
import { composeDisplayOptions } from '@openchemistry/utils';
import $3Dmol from '@openchemistry/moljs-es';
import { createColorMap, createOpacityMap} from '@colormap/core';

import { isNil, throttle } from "lodash-es";
import { v4 as uuidv4 } from 'uuid';

declare const $: any;

interface Point<T> {
  value: number;
  mapped: T;
}

interface TransferFn {
  value: number;
  color: number;
  opacity: number;
}

function uint8(value: number) : number {
  if (value < 0) {
    return 0;
  } else if (value > 1) {
    return 255;
  } else {
    return Math.round(value * 255);
  }
}

function hex(value: number) : string {
  let result = uint8(value).toString(16);
  return result.length < 2 ? '0' + result : result;
}

function toHexColor(color: [number, number, number]) : number {
  return parseInt(color.map(v => hex(v)).join(''), 16);
}

function makePoints<T>(mapped: T[], scalars: number[]): Point<T>[] {
  if (mapped.length !== scalars.length) {
    return [];
  }
  return scalars.map((value, i) => ({value, mapped: mapped[i]}));
}

function makeTransferFn(colors: Point<[number, number, number]>[], opacities: Point<number>[]): TransferFn[] {
  const scale = (v: number) => v;
  const colorMap = createColorMap(colors, scale);
  const opacityMap = createOpacityMap(opacities, scale);

  const x = colors.map(({value}) => value)
    .concat(opacities.map(({value}) => value))
    .sort((a, b) => a - b);

  return x.map(value => ({
    value,
    color: toHexColor(colorMap(value)),
    opacity: opacityMap(value)
  }));
}

$3Dmol.VolumeData.prototype.volume = function (volume: ICube) {
  this.size = new $3Dmol.Vector3(volume.dimensions[0],
                                 volume.dimensions[1],
                                 volume.dimensions[2]);
  this.origin = new $3Dmol.Vector3(volume.origin[0],
                                   volume.origin[1],
                                   volume.origin[2]);
  this.unit = new $3Dmol.Vector3(volume.spacing[0],
                                 volume.spacing[1],
                                 volume.spacing[2]);
  this.data = new Float32Array(volume.scalars);
};

@Component({
  tag: 'oc-molecule-moljs',
  styleUrl: 'molecule-moljs.css'
})
export class MoleculeMoljs {

  @Element() el: HTMLElement;

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks
  @Prop() cjson: IChemJson | string;
  @Watch('cjson') cjsonHandler() {
    this.cjsonHasChanged = true;
    this.cjsonData = null;
  }

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler(newValue: IDisplayOptions) {
    this.optionsData = composeDisplayOptions(newValue);
  }

  @Prop() rotate: boolean = false;

  cjsonData: IChemJson;
  optionsData: IDisplayOptions;

  cjsonHasChanged: boolean = false;

  viewer: any;
  currAtoms: IAtomSpec[];
  currModel: any;
  rotateInterval: any;

  containerId: string = `${uuidv4()}`;
  molViewer: HTMLDivElement;

  animationRequestId?: number;
  animationStartTime?: number;
  animationPreviousTime?: number;

  /**
   * The component is about to load and it has not
   * rendered yet.
   *
   * This is the best place to make any data updates
   * before the first render.
   *
   * componentWillLoad will only be called once.
   * 
   * Uncomment the following lifecycle method if needed:
   * 
   * componentWillLoad() {
   *  console.log('Component is about to be rendered');
   * }
  */

  /**
   * The component has loaded and has already rendered.
   *
   * Updating data in this method will cause the
   * component to re-render.
   *
   * componentDidLoad only be called once.
   */
  componentDidLoad() {
    if (isNil(this.viewer)) {
      let config = { };
      this.viewer = $3Dmol.createViewer( $(this.molViewer), config );
    }
    this.convertCjson();
    this.renderMolecule();

    let throttledResize = throttle(() => {
      if (!isNil(this.viewer)) {
        this.viewer.resize();
      }
    }, 33);
    const ro = new ResizeObserver(() => {
      throttledResize();
    });

    setTimeout(() => {
      ro.observe(this.el.parentElement);
    }, 500);
  }

  /**
   * The component is about to update and re-render.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the first render.
   * 
   * Uncomment the following lifecycle method if needed:
   * 
   * componentWillUpdate() {
   *  console.log('Component will update and re-render');
   * }
   */

  /**
   * The component has just re-rendered.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the
   * first render.
   */
  componentDidUpdate() {
    if (this.cjsonHasChanged) {
      this.convertCjson();
    }
    this.renderMolecule();
    this.cjsonHasChanged = false;
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload() {
    this.stopAnimation();
    if (!isNil(this.rotateInterval)) {
      clearInterval(this.rotateInterval);
    }
    if (!isNil(this.viewer)) {
      this.viewer.clear();
      this.viewer = null;
    }
  }

  setCjson() {
    if (isNil(this.cjson)) {
      this.cjsonData = null;
      return;
    }
    if (isChemJson(this.cjson)) {
      this.cjsonData = this.cjson as IChemJson;
    } else {
      this.cjsonData = JSON.parse(this.cjson);
    }
    if (!validateChemJson(this.cjsonData)) {
      this.cjsonData = null;
    }
  }

  convertCjson() {
    const cjson = this.getCjson();
    if (isNil(cjson) || isNil(cjson.atoms)) {
      this.currAtoms = [];
      return;
    }
    this.currAtoms = cjsonToMoljs(cjson);
  }

  renderMolecule() {
    this.viewer.clear();
    this.currModel = this.viewer.addModel();
    this.setAtoms();
    this.setVolume();
    this.viewer.zoomTo();
    this.viewer.render();
    this.startAnimation();
    this.handleRotate();
  }

  setAtoms() {
    // If an animation is playing, stop it before setting the new atoms
    this.stopAnimation();
    this.currModel.addAtoms(this.currAtoms);
    this.currModel.setStyle({},this.getOptions().style);
  }

  stopAnimation() {
    // If an animation is playing, stop it before setting the new atoms
    if (!isNil(this.animationRequestId)) {
      window.cancelAnimationFrame(this.animationRequestId);
      this.animationRequestId = undefined;
      this.animationStartTime = undefined;
      this.animationPreviousTime = undefined;
    }
  }

  startAnimation() {
    // If an animation is playing, stop it before starting a new one
    this.stopAnimation();
    // Start an interval to play the normal mode animation
    const cjson = this.getCjson();
    const normalMode = this.getOptions().normalMode;
    if (!isNil(cjson) && !isNil(cjson.vibrations) && !isNil(cjson.vibrations.eigenVectors) && !isNil(normalMode.modeIdx) && normalMode.play) {
      let modeIdx: number = normalMode.modeIdx;
      const eigenvector = cjson.vibrations.eigenVectors[modeIdx];
      if (isNil(eigenvector)) {
        return;
      }
      const step = (timestamp: number) => {
        if (isNil(this.animationStartTime)) {
          this.animationStartTime = timestamp;
        }

        if (isNil(this.animationPreviousTime)) {
          this.animationPreviousTime = 0;
        }

        if (timestamp - this.animationPreviousTime > 1000 / normalMode.framesPerPeriod * normalMode.periodsPerSecond) {
          this.animationPreviousTime = timestamp;
          const elapsedTime = (timestamp - this.animationStartTime) / 1000;

          this.viewer.removeModel(this.currModel);
          this.currModel = this.viewer.addModel();
          let newAtoms: IAtomSpec[] = []
          let scale = normalMode.scale * Math.sin(2 * Math.PI * elapsedTime / normalMode.periodsPerSecond);
          for (let i = 0; i < this.currAtoms.length; ++i) {
            let atom = {...this.currAtoms[i]};
            let dx = scale * eigenvector[i * 3];
            let dy = scale * eigenvector[i * 3 + 1];
            let dz = scale * eigenvector[i * 3 + 2];
            atom.x += dx;
            atom.y += dy;
            atom.z += dz;
            newAtoms.push(atom);
          }
          this.currModel.addAtoms(newAtoms);
          this.currModel.setStyle({},this.getOptions().style);
          this.viewer.render();
        }
        this.animationRequestId = window.requestAnimationFrame(step);
      };

      this.animationRequestId = window.requestAnimationFrame(step);
    }
  }

  setVolume() {
    const cjson = this.getCjson();
    if (isNil(cjson) || isNil(cjson.cube)) {
      return;
    }
    if (!(this.getOptions().visibility.isoSurfaces || this.getOptions().visibility.volume)) {
      return;
    }
    const volumeData = new $3Dmol.VolumeData(cjson.cube, 'volume');

    if (this.getOptions().visibility.isoSurfaces) {
      const isoSurfaces: IIsoSurfaceOptions[] = this.getOptions().isoSurfaces;
      for (let isoSurface of isoSurfaces) {
        let iso: any = {
          isoval: isoSurface.value,
          color: isoSurface.color,
          opacity: isoSurface.opacity,
        };
        if ('smoothness' in isoSurface) {
          iso.smoothness = isoSurface.smoothness!;
        }
        this.viewer.addIsosurface(volumeData, iso);
      }
    }

    if (this.getOptions().visibility.volume) {
      let low = Infinity;
      let high = -Infinity;
      cjson.cube.scalars.forEach((value) => {
        if (value < low) {low = value};
        if (value > high) {high = value};
      });
      const range = [low, high];
      const delta = high - low;

      const colorsScalarValue = !isNil(this.getOptions().volume.colorsScalarValue) && this.getOptions().volume.colorsScalarValue.length == this.getOptions().volume.colors.length
        ? this.getOptions().volume.colorsScalarValue
        : this.getOptions().volume.colors.map((_, i) => range[0] + i * delta / (this.getOptions().volume.colors.length - 1));
      const colorNodes = makePoints<[number, number, number]>(this.getOptions().volume.colors, colorsScalarValue);

      const opacityScalarValue = !isNil(this.getOptions().volume.opacityScalarValue) && this.getOptions().volume.colorsScalarValue.length == this.getOptions().volume.opacity.length
        ? this.getOptions().volume.opacityScalarValue
        : this.getOptions().volume.opacity.map((_, i) => range[0] + i * delta / (this.getOptions().volume.opacity.length - 1));
      const opacityNodes = makePoints<number>(this.getOptions().volume.opacity, opacityScalarValue);

      const transferfn = makeTransferFn(colorNodes, opacityNodes);

      this.viewer.addVolumetricRender(volumeData, {transferfn});
    }
  }

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson();
    }
    return this.cjsonData;
  }

  setOptions() {
    this.optionsData = composeDisplayOptions(this.options);
  }

  getOptions() : IDisplayOptions {
    if (isNil(this.optionsData)) {
      this.setOptions();
    }
    return this.optionsData;
  }

  handleRotate() {
    if (this.rotate && isNil(this.rotateInterval)) {
      this.rotateInterval = setInterval(() => this.viewer.rotate(0.5), 50);
    }
    else if (!this.rotate && !isNil(this.rotateInterval)) {
      clearInterval(this.rotateInterval);
      this.rotateInterval = null;
    }
  }

  render() {
    return (
      <div id={this.containerId} class="mol-viewer" ref={ref => {this.molViewer = ref;}}></div>
    );
  }
}
