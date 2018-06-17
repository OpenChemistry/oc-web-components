import { Component, Prop } from '@stencil/core';

import { IAtomSpec } from '@openchemistry/types';
import { IChemJson, ICube } from '@openchemistry/types';
import { IDisplayOptions, IIsoSurface, IStyle } from '@openchemistry/types';
import { validateChemJson, isChemJson } from '@openchemistry/cjson-utils';
import { cjsonToMoljs } from '@openchemistry/cjson-utils';

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
    if (!this.viewer) {
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
    if (!this.cjson) {
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
    const cjson = this.getCjson();
    if (!cjson || !cjson.atoms) {
      return;
    }
    let atoms: IAtomSpec[] = cjsonToMoljs(cjson);
    this.viewer.setBackgroundColor(0xffffffff);
    let m = this.viewer.addModel();
    m.addAtoms(atoms);
    m.setStyle({},this.getStyle());
  }

  setVolume() {
    const cjson = this.getCjson();
    if (!cjson || !cjson.cube) {
      return;
    }
    const volumeData = new $3Dmol.VolumeData(cjson.cube, 'volume');
    const isoSurfaces: IIsoSurface[] = this.getIsoSurfaces();
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
    if (!this.cjsonData) {
      this.setCjson();
    }
    return this.cjsonData;
  }

  getIsoSurfaces() : IIsoSurface[] {
    if (this.options && this.options.isoSurfaces) {
      return this.options.isoSurfaces;
    } else {
      return this.defaultOptions.isoSurfaces;
    }
  }

  getStyle() : IStyle {
    if (this.options && this.options.style) {
      return this.options.style;
    } else {
      return this.defaultOptions.style;
    }
  }

  render() {
    return ( 
      <div id='mol-viewer'></div>
    );
  }
}
