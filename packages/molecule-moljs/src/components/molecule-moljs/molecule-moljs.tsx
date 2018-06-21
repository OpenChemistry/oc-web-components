import { Component, Prop, Watch } from '@stencil/core';

import { IAtomSpec } from '@openchemistry/types';
import { IChemJson, ICube } from '@openchemistry/types';
import { IDisplayOptions, IIsoSurfaceOptions, IStyleOptions, INormalModeOptions } from '@openchemistry/types';
import { validateChemJson, isChemJson } from '@openchemistry/cjson-utils';
import { cjsonToMoljs } from '@openchemistry/cjson-utils';

import { isNil } from "lodash-es";

declare let $3Dmol: any;

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

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks  
  @Prop() cjson: IChemJson | string;
  @Watch('cjson') cjsonHandler() {
    this.cjsonHasChanged = true;
  }

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler() {
    this.optionsHasChanged = true;
  }

  cjsonData: IChemJson;
  viewer: any;
  animationInterval: any;
  currAtoms: IAtomSpec[];
  currModel: any;
  cjsonHasChanged: boolean = false;
  optionsHasChanged: boolean = false;

  defaultOptions: IDisplayOptions = {
    isoSurfaces: [
      {
        value: 0.005,
        color: "#ff0000",
        opacity: 0.85
      },
      {
        value: -0.005,
        color: "#0000ff",
        opacity: 0.85
      }
    ],
    style: {
      stick: {
        radius: 0.14,
      },
      sphere: {
        scale: 0.3,
      },
    },
    normalMode: {
      play: true,
      modeIdx: -1,
      framesPerPeriod: 15,
      periodsPerSecond: 1,
      scale: 1
    }
  }

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
    this.optionsHasChanged = false;
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload() {
    console.log('Component removed from the DOM');
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
  }

  setAtoms() {
    // If an animation is playing, stop it before setting the new atoms
    this.stopAnimation();
    this.currModel.addAtoms(this.currAtoms);
    this.currModel.setStyle({},this.getStyle());
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
    const normalMode = this.getNormalMode();
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
        this.currModel.setStyle({},this.getStyle());
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
    const isoSurfaces: IIsoSurfaceOptions[] = this.getIsoSurfaces();
    // isoSurfaces.forEach((isoSurface) => {
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

  getIsoSurfaces() : IIsoSurfaceOptions[] {
    if (isNil(this.options) || isNil(this.options.isoSurfaces)) {
      return this.defaultOptions.isoSurfaces;
    } else {
      return this.options.isoSurfaces;
    }
  }

  getStyle() : IStyleOptions {
    if (isNil(this.options) || isNil(this.options.style)) {
      return this.defaultOptions.style;
    } else {
      return { ...this.defaultOptions.style, ...this.options.style };
    }
  }

  getNormalMode() : INormalModeOptions {
    if (isNil(this.options) || isNil(this.options.normalMode)) {
      return this.defaultOptions.normalMode;
    } else {
      return { ...this.defaultOptions.normalMode, ...this.options.normalMode };
    }
  }

  render() {
    return ( 
      <div id='mol-viewer'></div>
    );
  }
}
