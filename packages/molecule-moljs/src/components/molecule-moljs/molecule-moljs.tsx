import { Component, Prop } from '@stencil/core';

import { IChemJson } from '@openchemistry/types';
import { validateChemJson, isChemJson } from '@openchemistry/cjson-utils';
import { cjsonToMoljs } from '@openchemistry/cjson-utils';
import { IAtomSpec } from '@openchemistry/types';

declare var $3Dmol: any;

@Component({
  tag: 'oc-molecule-moljs',
  styleUrl: 'molecule-moljs.css'
})
export class MoleculeMoljs {

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks  
  @Prop() cjsonProp: IChemJson | string;

  cjson: IChemJson;
  viewer: any;


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

    this.setCjson();
    this.setAtoms();
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
    this.setCjson();
    this.setAtoms();
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload() {
    console.log('Component removed from the DOM');
  }

  setCjson() {
    if (isChemJson(this.cjsonProp)) {
      this.cjson = this.cjsonProp as IChemJson;
    } else {
      this.cjson = JSON.parse(this.cjsonProp);
    }
    if (!validateChemJson(this.cjson)) {
      this.cjson = null;
    }
  }

  setAtoms() {
    this.viewer.clear();
    if (!this.cjson) {
      return;
    }
    let atoms: IAtomSpec[] = cjsonToMoljs(this.cjson);
    this.viewer.setBackgroundColor(0xffffffff);
    let m = this.viewer.addModel();
    m.addAtoms(atoms);
    m.setStyle({},{stick:{}});
    this.viewer.zoomTo();
    this.viewer.render();

  }

  render() {
    return ( 
      <div id='mol-viewer'></div>
    );
  }
}
