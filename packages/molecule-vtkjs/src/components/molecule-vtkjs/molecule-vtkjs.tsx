import { Component, Prop, Element, Watch } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { isNil, throttle } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { composeDisplayOptions } from '@openchemistry/utils';

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
  }

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler(newValue: IDisplayOptions) {
    this.optionsData = composeDisplayOptions(newValue);
  }

  cjsonData: IChemJson;
  optionsData: IDisplayOptions;

  cjsonHasChanged: boolean = false;

  animationInterval: number;

  viewerContainer: HTMLElement;
  viewer: any;
  renderer: any;
  renderWindow: any;
  filter: any;
  sphereMapper: any;
  sphereActor: any;
  stickMapper: any;
  stickActor: any;

  componentWillLoad() {
    console.log('Component is about to be rendered');
    let molecule = vtk.Common.DataModel.vtkMolecule.newInstance();
    molecule.setAtoms(this.cjson.atoms);
    molecule.setBonds(this.cjson.bonds);

    this.viewer = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
    this.renderer = this.viewer.getRenderer();
    this.renderWindow = this.viewer.getRenderWindow();
    this.filter = vtk.Filters.General.vtkMoleculeToRepresentation.newInstance();
    this.filter.setInputData(molecule);

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

  componentDidLoad() {
    console.log('Component has been rendered');
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
  }

  componentDidUnload() {
    console.log('Component removed from the DOM');
    this.viewer.delete();
  }

  render() {
    return (
      <div ref={(ref) => {this.viewerContainer = ref;}} class="render-container">
      </div>
    );
  }
}
