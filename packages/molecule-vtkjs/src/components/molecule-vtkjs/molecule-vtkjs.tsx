import { Component, Prop, Element, Watch } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { isNil, throttle } from "lodash-es";

import { IChemJson, IDisplayOptions, IAtoms, IBonds } from '@openchemistry/types';
import { composeDisplayOptions } from '@openchemistry/utils';
import { validateChemJson, isChemJson } from '@openchemistry/utils';

// import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtk from 'vtk.js';

@Component({
  tag: 'oc-molecule-vtkjs',
  styleUrl: 'molecule-vtkjs.css',
  shadow: true
})
export class MoleculeVtkjs {

  @Element() el: HTMLElement;

  @Prop() cjson: IChemJson;
  @Watch('cjson') cjsonHandler() {
    this.cjsonHasChanged = true;
    this.cjsonData = null;
  }

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler(newValue: IDisplayOptions) {
    this.optionsData = composeDisplayOptions(newValue);
  }

  cjsonData: IChemJson;
  optionsData: IDisplayOptions;

  cjsonHasChanged: boolean = false;

  animationInterval: any;

  viewerContainer: HTMLElement;
  viewer: any;
  renderer: any;
  renderWindow: any;
  filter: any;
  sphereMapper: any;
  sphereActor: any;
  stickMapper: any;
  stickActor: any;
  molecule: any;

  componentWillLoad() {
    console.log('MoleculeVtkjs is about to be rendered');
    this.initVtkJs();
  }

  componentDidLoad() {
    console.log('MoleculeVtkjs has been rendered');
    this.viewer.setContainer(this.viewerContainer);
    this.viewer.resize();

    let throttledResize = throttle(() => {
      if (!isNil(this.viewer)) {
        this.viewer.resize();
      }
    }, 33);

    const ro = new ResizeObserver(() => {
      throttledResize();
    });

    ro.observe(this.viewerContainer);

    this.startAnimation();
  }

  componentWillUpdate() {
    console.log('MoleculeVtkjs did update');
    if (this.cjsonHasChanged) {
      this.updateMolecule();
      this.renderer.resetCamera();
      this.renderWindow.render();
      this.cjsonHasChanged = false;
    }

    this.startAnimation();
  }

  initVtkJs() {
    this.molecule = vtk.Common.DataModel.vtkMolecule.newInstance();
    this.updateMolecule();

    this.viewer = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
    this.renderer = this.viewer.getRenderer();
    this.renderWindow = this.viewer.getRenderWindow();
    this.filter = vtk.Filters.General.vtkMoleculeToRepresentation.newInstance();
    this.filter.setInputData(this.molecule);

    this.sphereMapper = vtk.Rendering.Core.vtkSphereMapper.newInstance();
    this.sphereMapper.setInputConnection(this.filter.getOutputPort(0));
    this.sphereMapper.setScaleArray(this.filter.getSphereScaleArrayName());

    this.sphereActor = vtk.Rendering.Core.vtkActor.newInstance();
    this.sphereActor.setMapper(this.sphereMapper);

    this.stickMapper = vtk.Rendering.Core.vtkStickMapper.newInstance();
    this.stickMapper.setInputConnection(this.filter.getOutputPort(1));
    this.stickMapper.setScaleArray('stickScales');
    this.stickMapper.setOrientationArray('orientation');

    this.stickActor = vtk.Rendering.Core.vtkActor.newInstance();
    this.stickActor.setMapper(this.stickMapper);

    this.renderer.addActor(this.sphereActor);
    this.renderer.addActor(this.stickActor);
    this.renderer.resetCamera();
    this.renderWindow.render();
  }

  cleanupVtkjs() {
    this.molecule.delete();
    this.viewer.delete();
    this.filter.delete();
    this.sphereMapper.delete();
    this.sphereActor.delete();
  }

  updateMolecule() {
    let cjson = this.getCjson();
    let atoms: IAtoms = !isNil(cjson) && !isNil(cjson.atoms) ? cjson.atoms : null;
    let bonds: IBonds = !isNil(cjson) && !isNil(cjson.bonds) ? cjson.bonds : null;

    this.molecule.setAtoms(atoms);
    this.molecule.setBonds(bonds);
  }

  stopAnimation() {
    // If an animation is playing, stop it
    if (!isNil(this.animationInterval)) {
      clearInterval(this.animationInterval);
      // Place the atoms back to the starting positions
      let cjson = this.getCjson();
      let atoms: IAtoms = cjson.atoms ? cjson.atoms : null;
      this.molecule.setAtoms(atoms);
      this.renderWindow.render();
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
        let coords: number[] = [...cjson.atoms.coords['3d']];
        let scale = normalMode.scale * Math.sin(2 * Math.PI * frame / normalMode.framesPerPeriod);
        for (let i = 0; i < eigenvector.length; ++i) {
          let dx = scale * eigenvector[i];
          coords[i] += dx;
        }
        let atoms = {...cjson.atoms};
        atoms.coords = {['3d']: coords};
        this.molecule.setAtoms(atoms);
        this.renderWindow.render();
        frame++;
      }, 1000 / (normalMode.framesPerPeriod * normalMode.periodsPerSecond));
    }
  }

  componentDidUnload() {
    console.log('Component removed from the DOM');
    this.cleanupVtkjs();
  }

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson();
    }
    return this.cjsonData;
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

  setOptions() {
    this.optionsData = composeDisplayOptions(this.options);
  }

  getOptions() : IDisplayOptions {
    if (isNil(this.optionsData)) {
      this.setOptions();
    }
    return this.optionsData;
  }

  render() {
    return (
      <div ref={(ref) => {this.viewerContainer = ref;}} class="render-container">
      </div>
    );
  }
}
