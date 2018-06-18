import { Component, Prop } from '@stencil/core';

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
  @Prop() options: IDisplayOptions;

  cjsonData: IChemJson;
  viewer: any;
  animationInterval: any;

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
    this.renderMolecule();
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload() {
    console.log('Component removed from the DOM');
  }

  setCjson() {
    if (isNil(this.cjson)) {
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

  renderMolecule() {
    this.viewer.clear();
    this.setAtoms();
    this.setVolume();
    this.viewer.zoomTo();
    this.viewer.render();
  }

  setAtoms() {
    // If an animation is playing, stop it before setting the new atoms
    if (!isNil(this.animationInterval)) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    const cjson = this.getCjson();
    if (isNil(cjson) || isNil(cjson.atoms)) {
      return;
    }
    let atoms: IAtomSpec[] = cjsonToMoljs(cjson);
    this.viewer.setBackgroundColor(0xffffffff);
    let m = this.viewer.addModel();
    m.addAtoms(atoms);
    m.setStyle({},this.getStyle());

    // Start an interval to play the normal mode animation
    const normalMode = this.getNormalMode();
    if (!isNil(cjson.vibrations) && !isNil(cjson.vibrations.eigenVectors) && normalMode.play) {
      let modeIdx: number = normalMode.modeIdx !== -1 ? normalMode.modeIdx : cjson.vibrations.eigenVectors.length - 1;
      if (modeIdx < 0) {
        return;
      }
      const eigenvector = cjson.vibrations.eigenVectors[modeIdx];
      let frame: number = 1;
      this.animationInterval = setInterval(() => {
        this.viewer.removeModel(m);
        m = this.viewer.addModel();
        let newAtoms: IAtomSpec[] = []
        let scale = normalMode.scale * Math.sin(2 * Math.PI * frame / normalMode.framesPerPeriod);
        for (let i = 0; i < atoms.length; ++i) {
          let atom = {...atoms[i]};
          let dx = scale * eigenvector[i * 3];
          let dy = scale * eigenvector[i * 3 + 1];
          let dz = scale * eigenvector[i * 3 + 2];
          atom.x += dx;
          atom.y += dy;
          atom.z += dz;
          newAtoms.push(atom);
        }
        m.addAtoms(newAtoms);
        m.setStyle({},this.getStyle());
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
    isoSurfaces.forEach((isoSurface) => {
      let iso: any = {
        isoval: isoSurface.value,
        color: isoSurface.color,
        opacity: isoSurface.opacity,
      };
      if ('smoothness' in isoSurface) {
        iso.smoothness = isoSurface.smoothness!;
      }

      this.viewer.addIsosurface(volumeData, iso);
    });
  }

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson();
    }
    return this.cjsonData;
  }

  getIsoSurfaces() : IIsoSurfaceOptions[] {
    return { ...this.defaultOptions.isoSurfaces, ...this.options.isoSurfaces };
  }

  getStyle() : IStyleOptions {
    return { ...this.defaultOptions.style, ...this.options.style };
  }

  getNormalMode() : INormalModeOptions {
    return { ...this.defaultOptions.normalMode, ...this.options.normalMode };
  }

  render() {
    return ( 
      <div id='mol-viewer'></div>
    );
  }
}
