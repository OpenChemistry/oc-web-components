import { Component, Prop, Element, Watch } from '@stencil/core';

import ResizeObserver from 'resize-observer-polyfill';

import { isNil, throttle, has } from "lodash-es";

import { IChemJson, IDisplayOptions, IAtoms, IBonds } from '@openchemistry/types';
import { composeDisplayOptions, evaluateMO } from '@openchemistry/utils';
import { color2rgb, rowMaj2colMaj3d } from '@openchemistry/utils';
import { validateChemJson, isChemJson } from '@openchemistry/utils';

import 'vtk.js';
declare var vtk: any;

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
  @Watch('options') optionsHandler() {
    this.optionsHasChanged = true;
    this.optionsData = null;
  }

  @Prop() rotate: boolean = false;

  cjsonData: IChemJson;
  optionsData: IDisplayOptions;

  cjsonHasChanged: boolean = false;
  optionsHasChanged: boolean = false;

  animationInterval: any;
  rotateInterval: any;

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

  unitCellPlanes: any[];
  unitCellMappers: any[];
  unitCellActors: any[];

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
    this.handleRotate();
  }

  componentWillUpdate() {
    console.log('MoleculeVtkjs did update');
    if (this.cjsonHasChanged) {
      this.updateMolecule();
      this.updateVolume();
      this.updateUnitCell();
      this.renderer.resetCamera();
      this.renderer.getActiveCamera().zoom(0.75);
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
    this.handleRotate();
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

    // draw unit cell as a collection of planes
    this.unitCellPlanes = [];
    this.unitCellMappers = [];
    this.unitCellActors = [];
    for (let i = 0; i < 6; ++i) {
      const source = vtk.Filters.Sources.vtkPlaneSource.newInstance();
      const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
      const actor = vtk.Rendering.Core.vtkActor.newInstance();

      source.setXResolution(1);
      source.setYResolution(1);
      mapper.setInputConnection(source.getOutputPort());
      actor.setMapper(mapper);
      actor.getProperty().setRepresentation(vtk.Rendering.Core.vtkProperty.Representation.SURFACE);
      actor.getProperty().setOpacity(0.25);
      actor.getProperty().setEdgeColor(0.0, 0.0, 0.0);
      actor.getProperty().setEdgeVisibility(true);

      this.unitCellPlanes.push(source);
      this.unitCellMappers.push(mapper);
      this.unitCellActors.push(actor);
    }

    this.updateVolume();
    this.volumeMapper.setInputData(this.volume);

    this.updateIsoSurfaces();
    this.updateVolumeLook();
    this.updateUnitCell();

    this.renderer.addActor(this.sphereActor);
    this.renderer.addActor(this.stickActor);
    this.renderer.addVolume(this.volumeActor);
    for (let i = 0; i < 6; ++i) {
      this.renderer.addActor(this.unitCellActors[i]);
    }

    this.renderer.resetCamera();
    this.renderer.getActiveCamera().zoom(0.75);
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
    for (let i = 0; i < 6; ++i) {
      this.unitCellActors[i].delete();
      this.unitCellMappers[i].delete();
      this.unitCellPlanes[i].delete();
    }
    this.volume.delete();
  }

  updateMolecule() {
    let cjson = this.getCjson();
    let atoms: IAtoms = !isNil(cjson) && !isNil(cjson.atoms) ? cjson.atoms : null;
    let bonds: IBonds = !isNil(cjson) && !isNil(cjson.bonds) ? cjson.bonds : null;
    // If there are no bonds in the cjson, explicitly set them to empty arrays,
    // or else vtkjs will try to automatically find them (can be slow for larger molecules)
    if (isNil(bonds)) {
      bonds = {
        connections: {
          index: []
        },
        order: []
      };
    }

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

    const averageSpacing = spacing.reduce( ( x, y ) => x + y, 0 ) / spacing.length;
    // compute a minimum spacing yielding 50 samples on an average dimension
    const minimumSpacing = 0.02 *
        (spacing[0]*dimensions[0] + spacing[1]*dimensions[1] + spacing[2]*dimensions[2]) / 3.0;

    // use the minimum of these two values
    // but not more than 500 samples on an axis (aka minimumSpacing*0.1)
    const spacingToUse = Math.max(Math.min(averageSpacing, minimumSpacing), minimumSpacing*0.1);
    this.volumeMapper.setSampleDistance(spacingToUse);

    // this should maybe be a physical constant here, I'm not sure how you
    // are selecting your opacity table settings, but I could see having a
    // convention of 1 physical unit = 0.5 opacity maximum. Once you set that
    // down then you don't want the average spacing of your dataset to change it
    // as looking at the same data with two different spacings should not change
    // the opacity. So I would think about using some physical constant here
    // if you can. The exception to that would be if you have no idea the
    // dimensions/nature of the data you will be visualizing. In that case you
    // have to punt and use something like average spacing.
    this.volumeActor.getProperty().setScalarOpacityUnitDistance(0, averageSpacing);
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

  updateUnitCell() {
    const cjson = this.getCjson();
    if (has(cjson, 'unitCell.cellVectors')) {
      const zero = [0, 0, 0];
      const a = cjson.unitCell.cellVectors.slice(0, 3);
      const b = cjson.unitCell.cellVectors.slice(3, 6);
      const c = cjson.unitCell.cellVectors.slice(6, 9);

      const origins = [ zero, zero, zero, c, b, a ];
      const points1 = [ a, a, b, a, a, b ];
      const points2 = [ b, c, c, b, c, c ];

      for (let i = 0; i < 6; ++i) {
        const source = this.unitCellPlanes[i];
        const actor = this.unitCellActors[i];
        source.setOrigin(origins[i]);
        source.setPoint1(points1[i].map((val, j) => val + origins[i][j]));
        source.setPoint2(points2[i].map((val, j) => val + origins[i][j]));
        actor.setVisibility(true);
      }
    } else {
      for (let i = 0; i < 6; ++i) {
        const actor = this.unitCellActors[i];
        actor.setVisibility(false);
      }
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

  handleRotate() {
    if (this.rotate && isNil(this.rotateInterval)) {
      let period = 60000;
      let dt = 50;
      let angle = 360 * dt / period;
      this.rotateInterval = setInterval(() => {
        let camera = this.renderer.getActiveCamera();
        camera.azimuth(angle);
        this.renderer.resetCameraClippingRange();
        this.renderWindow.render();
      }, dt);
    }
    else if (!this.rotate && !isNil(this.rotateInterval)) {
      clearInterval(this.rotateInterval);
      this.rotateInterval = null;
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
    if (!isNil(this.rotateInterval)) {
      clearInterval(this.rotateInterval);
    }
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

    evaluateMO;
    if (isNil(this.cjsonData.cube) && !isNil(this.cjsonData.basisSet)) {

      console.time('evaluateMO_JS');
      let cube = evaluateMO(this.cjsonData, 1, 0.05);
      console.timeEnd('evaluateMO_JS');
      this.cjsonData.cube = {
        dimensions: cube.dimensions,
        origin: cube.origin,
        spacing: cube.spacing,
        scalars: cube.scalars
      }
      console.log("CUBEEEEEEE", this.cjsonData.cube);
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
