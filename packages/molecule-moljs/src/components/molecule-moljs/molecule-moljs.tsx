import { Component, Prop, Watch, Element } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { IAtomSpec } from '@openchemistry/types';
import { IChemJson, ICube } from '@openchemistry/types';
import { IDisplayOptions, IIsoSurfaceOptions } from '@openchemistry/types';
import { validateChemJson, isChemJson } from '@openchemistry/utils';
import { cjsonToMoljs } from '@openchemistry/utils';
import { composeDisplayOptions } from '@openchemistry/utils';
import $3Dmol from '@openchemistry/moljs-es';

import { isNil, throttle } from "lodash-es";


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
  animationInterval: any;
  currAtoms: IAtomSpec[];
  currModel: any;
  rotateInterval: any;

  /**
   * The component is about to load and it has not
   * rendered yet.
   *
   * This is the best place to make any data updates
   * before the first render.
   *
   * componentWillLoad will only be called once.
   */
  componentWillLoad() {
   console.log('Component is about to be rendered');
  }

  /**
   * The component has loaded and has already rendered.
   *
   * Updating data in this method will cause the
   * component to re-render.
   *
   * componentDidLoad only be called once.
   */
  componentDidLoad() {
    console.log('Component has been rendered');
    let config = { };
    if (isNil(this.viewer)) {
      this.viewer = $3Dmol.createViewer( 'mol-viewer', config );
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
   */
  componentWillUpdate() {
    console.log('Component will update and re-render');
  }

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
    console.log('Component did update');
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
    console.log('Component removed from the DOM');
    if (!isNil(this.animationInterval)) {
      clearInterval(this.animationInterval);
    }
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
    if (!isNil(this.animationInterval)) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  startAnimation() {
    // If an animation is playing, stop it before starting a new one
    this.stopAnimation();
    // Start an interval to play the normal mode animation
    const cjson = this.getCjson();
    const normalMode = this.getOptions().normalMode;
    if (!isNil(cjson) && !isNil(cjson.vibrations) && !isNil(cjson.vibrations.eigenVectors) && normalMode.play) {
      let modeIdx: number = normalMode.modeIdx;
      if (modeIdx < 0) {
        return;
      }
      const eigenvector = cjson.vibrations.eigenVectors[modeIdx];
      let frame: number = 1;
      this.animationInterval = setInterval(() => {
        this.viewer.removeModel(this.currModel);
        this.currModel = this.viewer.addModel();
        let newAtoms: IAtomSpec[] = []
        let scale = normalMode.scale * Math.sin(2 * Math.PI * frame / normalMode.framesPerPeriod);
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
        frame++;
      }, 1000 / (normalMode.framesPerPeriod * normalMode.periodsPerSecond));
    }
  }

  setVolume() {
    const cjson = this.getCjson();
    if (isNil(cjson) || isNil(cjson.cube)) {
      return;
    }
    const volumeData = new $3Dmol.VolumeData(cjson.cube, 'volume');
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
      <div id='mol-viewer'></div>
    );
  }
}
