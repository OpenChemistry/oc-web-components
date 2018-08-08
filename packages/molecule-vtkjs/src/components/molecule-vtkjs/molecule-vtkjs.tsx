import { Component, Prop, Element, Watch } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { isNil, throttle } from "lodash-es";

import { IChemJson, IDisplayOptions, IAtoms, IBonds } from '@openchemistry/types';
import { composeDisplayOptions } from '@openchemistry/utils';
import { color2rgb, rowMaj2colMaj3d } from '@openchemistry/utils';
import { validateChemJson, isChemJson } from '@openchemistry/utils';
import { BenzeneWithHomo } from '@openchemistry/sample-data';

import vtk from 'vtk.js';

@Component({
  tag: 'oc-molecule-vtkjs',
  styleUrl: 'molecule-vtkjs.css',
  shadow: false
})
export class MoleculeVtkjs {

  @Element() el: HTMLElement;

  @Prop() cjson: IChemJson;
  @Watch('cjson') cjsonHandler() {
    this.cjsonHasChanged = true;
    this.cjsonData = null;
  }

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler() {
    this.optionsHasChanged = true;
    this.optionsData = null;
  }

  cjsonData: IChemJson;
  optionsData: IDisplayOptions;

  cjsonHasChanged: boolean = false;
  optionsHasChanged: boolean = false;

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
  isoSurfaces: any[] = [];
  volume: any;
  volumeMapper: any;
  volumeActor: any;

  ctFn: any;
  opacityFn: any;

  componentWillLoad() {
    console.log('MoleculeVtkjs is about to be rendered');
    this.initVtkJs();
    this.applyStyle();
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
      this.updateVolume();
      this.renderer.resetCamera();
      this.renderWindow.render();
      this.cjsonHasChanged = false;
    }

    if (this.optionsHasChanged) {
      this.applyStyle();
      this.updateIsoSurfaces();
      this.updateVolumeLook();
      this.renderWindow.render();
      this.optionsHasChanged = false;
    }

    this.startAnimation();
  }

  initVtkJs() {
    this.molecule = vtk.Common.DataModel.vtkMolecule.newInstance();
    this.updateMolecule();

    this.viewer = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
    this.viewer.setBackground(1, 1, 1);
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

    this.volume = vtk.Common.DataModel.vtkImageData.newInstance();
    this.volumeMapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
    this.volumeActor = vtk.Rendering.Core.vtkVolume.newInstance();
    this.volumeActor.setMapper(this.volumeMapper);

    this.ctFn = vtk.Rendering.Core.vtkColorTransferFunction.newInstance();
    this.opacityFn = vtk.Common.DataModel.vtkPiecewiseFunction.newInstance();
    this.volumeActor.getProperty().setRGBTransferFunction(0, this.ctFn);
    this.volumeActor.getProperty().setScalarOpacity(0, this.opacityFn);
    // this.volumeMapper.setSampleDistance(0.7);
    // this.volumeActor.getProperty().setScalarOpacityUnitDistance(0, 4.5);
    // this.volumeActor.getProperty().setInterpolationTypeToLinear();

    this.updateVolume();
    this.volumeMapper.setInputData(this.volume);

    this.updateIsoSurfaces();
    this.updateVolumeLook();

    this.renderer.addActor(this.sphereActor);
    this.renderer.addActor(this.stickActor);
    this.renderer.addVolume(this.volumeActor);

    this.renderer.resetCamera();
    this.renderWindow.render();
  }

  cleanupVtkjs() {
    this.molecule.delete();
    this.viewer.delete();
    this.filter.delete();
    this.sphereMapper.delete();
    this.sphereActor.delete();
    this.stickMapper.delete();
    this.stickActor.delete();
    for (let i = 0; i < this.isoSurfaces.length; ++i) {
      const {marchingCubes, mapper, actor} = this.isoSurfaces.pop();
      actor.delete();
      mapper.delete();
      marchingCubes.delete();
    }
    this.volume.delete();
  }

  updateMolecule() {
    let cjson = this.getCjson();
    let atoms: IAtoms = !isNil(cjson) && !isNil(cjson.atoms) ? cjson.atoms : null;
    let bonds: IBonds = !isNil(cjson) && !isNil(cjson.bonds) ? cjson.bonds : null;

    this.molecule.setAtoms(atoms);
    this.molecule.setBonds(bonds);
  }

  updateVolume() {
    let cjson = this.getCjson();
    let dimensions: number[];
    let spacing: number[];
    let origin: number[];
    let scalars: any;

    if (isNil(cjson.cube)) {
      dimensions = [1, 1, 1];
      spacing = [1, 1, 1];
      origin = [0, 0, 0];
      scalars = vtk.Common.Core.vtkDataArray.newInstance({
        name: 'Scalars',
        values: [0],
        numberOfComponents: 1
      });

    } else {
      dimensions = cjson.cube.dimensions;
      spacing = cjson.cube.spacing;
      origin = cjson.cube.origin;
      scalars = vtk.Common.Core.vtkDataArray.newInstance({
        name: 'Scalars',
        values: rowMaj2colMaj3d(cjson.cube.scalars, cjson.cube.dimensions),
        numberOfComponents: 1
      });
    }

    this.volume.setDimensions(dimensions);
    this.volume.setSpacing(spacing);
    this.volume.setOrigin(origin);
    this.volume.getPointData().setScalars(scalars);
    
  }

  updateIsoSurfaces() {
    // Keep the number of isoSurfaces in sync with the input
    let options = this.getOptions();

    // Reuse existing object that we have allocated
    const n = Math.min(options.isoSurfaces.length, this.isoSurfaces.length);
    for (let i = 0; i < n; ++i) {
      const {marchingCubes, actor} = this.isoSurfaces[i];
      marchingCubes.setContourValue(options.isoSurfaces[i].value);
      marchingCubes.setInputData(this.volume);
      actor.getProperty().setDiffuseColor(...color2rgb(options.isoSurfaces[i].color));
      // There is no depth peeling in vtkjs, set opacity to 1 for the time being
      // actor.getProperty().setOpacity(options.isoSurfaces[i].opacity);
      actor.getProperty().setOpacity(1);
    }

    if (this.isoSurfaces.length > options.isoSurfaces.length) {
      // Cleanup the objects in excess
      const n = this.isoSurfaces.length - options.isoSurfaces.length;
      for (let i = 0; i < n; ++i) {
        const {marchingCubes, mapper, actor} = this.isoSurfaces.pop();
        this.renderer.removeActor(actor);
        actor.delete();
        mapper.delete();
        marchingCubes.delete();
      }
    } else if (this.isoSurfaces.length < options.isoSurfaces.length) {
       // Allocate the objects as needed
      for (let i = this.isoSurfaces.length; i < options.isoSurfaces.length; ++i) {
        let marchingCubes = vtk.Filters.General.vtkImageMarchingCubes.newInstance({
          contourValue: options.isoSurfaces[i].value,
          computeNormals: true,
          mergePoints: true
        });
        marchingCubes.setInputData(this.volume);

        let mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        mapper.setInputConnection(marchingCubes.getOutputPort());

        let actor = vtk.Rendering.Core.vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().setDiffuseColor(...color2rgb(options.isoSurfaces[i].color));
        // There is no depth peeling in vtkjs, set opacity to 1 for the time being
        // actor.getProperty().setOpacity(options.isoSurfaces[i].opacity);
        actor.getProperty().setOpacity(1);

        this.renderer.addActor(actor);

        this.isoSurfaces.push({
          marchingCubes,
          mapper,
          actor
        });
      }
    }

    // Set visibility
    for (let i = 0; i < this.isoSurfaces.length; ++i) {
      this.isoSurfaces[i].actor.setVisibility(options.visibility.isoSurfaces);
    }
  }

  updateVolumeLook() {
    let options = this.getOptions();
    let range;
    if (isNil(options.volume.range)) {
      range = this.volume.getPointData().getScalars().getRange();
    } else {
      range = options.volume.range;
    }
    let delta = range[1] - range[0];

    this.ctFn.removeAllPoints();
    this.opacityFn.removeAllPoints();

    let pointsProvided: boolean = !isNil(options.volume.colorsScalarValue) && options.volume.colorsScalarValue.length == options.volume.colors.length;
    for (let i = 0; i < options.volume.colors.length; ++i) {
      let val: number;
      if (pointsProvided) {
        val = options.volume.colorsScalarValue[i];
      } else {
        val = range[0] + i * delta / (options.volume.colors.length - 1);
      }
      this.ctFn.addRGBPoint(val, ...options.volume.colors[i]);
    }

    pointsProvided = !isNil(options.volume.opacityScalarValue) && options.volume.opacityScalarValue.length == options.volume.opacity.length;
    for (let i = 0; i < options.volume.opacity.length; ++i) {
      let val: number;
      if (pointsProvided) {
        val = options.volume.opacityScalarValue[i];
      } else {
        val = range[0] + i * delta / (options.volume.opacity.length - 1);
      }
      this.opacityFn.addPoint(val, options.volume.opacity[i]);
    }

    this.volumeActor.setVisibility(options.visibility.volume);
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
      if (modeIdx < 0 || modeIdx >= cjson.vibrations.eigenVectors.length) {
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

  applyStyle() {
    let style = this.getOptions().style;
    this.filter.setAtomicRadiusScaleFactor(style.sphere.scale);
    this.filter.setBondRadius(style.stick.radius);
  }

  componentDidUnload() {
    console.log('Component removed from the DOM');
    if (!isNil(this.animationInterval)) {
      clearInterval(this.animationInterval);
    }
    this.cleanupVtkjs();
  }

  getCjson(): IChemJson {
    return BenzeneWithHomo;
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
