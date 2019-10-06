import { Component, Prop, Watch, Event, EventEmitter, State, h } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions, makeBins } from '@openchemistry/utils';
import { redBlue, redYelBlu, viridis, plasma, gray } from '@openchemistry/utils';
import { linearSpace } from '@openchemistry/utils';

import memoizeOne from 'memoize-one';
import produce from 'immer';

const defaultOpacityFn = (range: [number, number]) => {
  const opacities = [1, 0.25, 0, 0, 0.25, 1];
  const extreme = range[1];
  const midPoint = 0.5 * extreme;
  const eps = 0.00001;
  const opacitiesX = [-extreme, -midPoint, -eps, eps, midPoint, extreme];
  return {opacities, opacitiesX};
}

const sameArray = (arr0: number[], arr1: number[], eps = Number.EPSILON) : boolean => {
  if (isNil(arr0) && isNil(arr1)) {
    return true;
  }
  if (isNil(arr0) || isNil(arr1)) {
    return false;
  }
  if (arr0.length !== arr1.length) {
    return false;
  }
  for (let i in arr0) {
    if (Math.abs(arr0[i] - arr1[i]) > eps) {
      return false;
    }
  }
  return true;
}

@Component({
  tag: 'oc-molecule',
  shadow: true
})
export class Molecule {

  // The chemical json object in input
  @Prop() cjson: IChemJson;
  // The url to a chemical json file
  @Prop() src: string;

  defaultOptions: IDisplayOptions = composeDisplayOptions({});

  // IsoSurface options
  @Prop() isoValue: number = 0.005;
  // Style options
  @Prop() displayStyle: string = 'ballAndStick';
  @Prop() sphereScale: number = 0.3;
  @Prop() stickRadius: number = 0.14;
  // Normal mode options
  @Prop() play: boolean = true;
  @Prop() iMode: number = -1;
  @Prop() animationScale: number = 1;
  @Prop() animationSpeed: number = 1;
  // Visibility options
  @Prop() showVolume: boolean = false;
  @Prop() showIsoSurface: boolean = true;
  @Prop() showSpectrum: boolean = true;
  @Prop() showMenu: boolean = true;
  // Volume options
  @Prop() colors: [number, number, number][];
  @Prop() colorsX: number[];
  @Prop() opacities: number[];
  @Prop() opacitiesX: number[];
  @Prop() range: [number, number];
  @Prop() mapRange: [number, number];
  @Prop() histograms: number[];
  @Prop() activeMapName: string = 'Red Blue';
  // Orbital options
  @Prop() iOrbital: number | string = -1;
  // Other options
  @Prop() rotate: boolean = false;
  @Prop() orbitalSelect: boolean = false;
  @Prop() zoom: number = 0.75;
  // Molecule renderer
  @Prop() moleculeRenderer: string = 'moljs';

  @State() state: {[name: string]: {touched: boolean; value: any}};

  @Event() iOrbitalChanged: EventEmitter;

  @State()
  cjsonData: IChemJson;

  colorMaps = {
    'Red Blue': redBlue,
    'Red Yellow Blue': redYelBlu,
    'Viridis': viridis,
    'Plasma': plasma,
    'Gray': gray
  }

  makeBins: Function;

  keyToEvent: Object;

  @Watch('cjson')
  cjsonHandler(val) {
    this.setCjson(val);
    this.updateVolumeOptions();
  }

  @Watch('src')
  srcHandler(val) {
    if (val) {
      fetch(val)
      .then(res => res.json())
      .then(cjson => {
        this.setCjson(cjson);
        this.updateVolumeOptions();
      });
    }
  }

  @Watch('activeMapName')
  @Watch('opacitiesX')
  @Watch('opacities')
  @Watch('colorsX')
  @Watch('colors')
  transferFunctionHandler() {
    this.updateVolumeOptions();
  }

  componentWillLoad() {
    // Map props names to event emitters
    this.keyToEvent = {
      iOrbital: this.iOrbitalChanged,
    }
    this.getRange = memoizeOne(this.getRange);
    this.makeBins = memoizeOne(makeBins);
    this.state = {
      isoValue: {touched: false, value: this.isoValue},
      displayStyle: {touched: false, value: this.displayStyle},
      sphereScale: {touched: false, value: this.sphereScale},
      stickRadius: {touched: false, value: this.stickRadius},
      play: {touched: false, value: this.play},
      iMode: {touched: false, value: this.iMode},
      animationScale: {touched: false, value: this.animationScale},
      animationSpeed: {touched: false, value: this.animationSpeed},
      showVolume: {touched: false, value: this.showVolume},
      showIsoSurface: {touched: false, value: this.showIsoSurface},
      showSpectrum: {touched: false, value: this.showSpectrum},
      showMenu: {touched: false, value: this.showMenu},
      colors: {touched: false, value: this.colors},
      colorsX: {touched: false, value: this.colorsX},
      opacities: {touched: false, value: this.opacities},
      opacitiesX: {touched: false, value: this.opacitiesX},
      range: {touched: false, value: this.range},
      mapRange: {touched: false, value: this.mapRange},
      histograms: {touched: false, value: this.histograms},
      activeMapName: {touched: false, value: this.activeMapName},
      iOrbital: {touched: false, value: this.iOrbital},
      rotate: {touched: false, value: this.rotate},
      orbitalSelect: {touched: false, value: this.orbitalSelect},
      moleculeRenderer: {touched: false, value: this.moleculeRenderer},
    }
    this.setCjson(this.cjson);
    this.updateVolumeOptions();
    this.srcHandler(this.src);
  }

  updateVolumeOptions() {
    if (isNil(this.cjsonData) || isNil(this.cjsonData.cube) || isNil(this.cjsonData.cube.scalars)) {
      return;
    }
    let range: [number, number] = this.getRange(this.cjsonData.cube.scalars);
    const isOrbitalCube = range[0] < 0 && range[1] > 0;
    // If the cube has positive and negative values, make the range symmetric
    if (isOrbitalCube) {
      const extreme = Math.max(Math.abs(range[0]), Math.abs(range[1]));
      range = [-extreme, extreme];
    }
    const mapRange = [...range];
    const histograms = this.makeBins(this.cjsonData.cube.scalars, 200, range);
    
    if (!isNil(this.colors) && Array.isArray(this.colors)) {
      this.colorMaps['Custom'] = this.colors;
    } else {
      delete this.colorMaps['Custom'];
    }
    const activeMapName = this.getValue('activeMapName');
    const colors = this.colorMaps[activeMapName];

    let colorsX: number[];
    if (isNil(this.colorsX)) {
      if (isOrbitalCube && activeMapName === 'Red Blue') {
        colorsX = [range[0], -0.000001, 0.000001, range[1]];
      } else {
        colorsX = linearSpace(range[0], range[1], this.colorMaps[activeMapName].length);
      }
    } else {
      colorsX = [...this.colorsX];
    }

    let opacities: number[];
    let opacitiesX: number[];
    if (isNil(this.opacities)) {
      if (isOrbitalCube) {
        const opacityFn = defaultOpacityFn(range);
        opacities = opacityFn.opacities;
        opacitiesX = opacityFn.opacitiesX;
      } else {
        opacities = [0, 1];
        opacitiesX = linearSpace(range[0], range[1], opacities.length);
      }
    } else if (isNil(this.opacitiesX)) {
      opacities = [...this.opacities];
      opacitiesX = linearSpace(range[0], range[1], this.opacities.length);
    } else {
      opacities = [...this.opacities];
      opacitiesX = [...this.opacitiesX];
    }

    const newState = produce(this.state, draft => {
      draft['range'].value = range;
      draft['range'].touched = false;
      draft['mapRange'].value = mapRange;
      draft['mapRange'].touched = false;
      draft['histograms'].value = histograms;
      draft['histograms'].touched = false;
      draft['colors'].value = colors;
      draft['colorsX'].value = colorsX;
      draft['colorsX'].touched = false;
      draft['opacities'].value = opacities;
      draft['opacities'].touched = false;
      draft['opacitiesX'].value = opacitiesX;
      draft['opacitiesX'].touched = false;
    });

    this.state = newState;
  }

  getRange(arr: number[]) : [number, number] {
    let range: [number, number] = [0, 0];
    range[0] = Math.min(...arr);
    range[1] = Math.max(...arr);
    return range;
  }

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson(this.cjson);
    }
    return this.cjsonData;
  }

  setCjson(cjson: IChemJson | string) {
    if (isNil(cjson)) {
      this.cjsonData = null;
      return;
    }
    let cjsonData: IChemJson;
    if (isChemJson(cjson)) {
      cjsonData = cjson as IChemJson;
    } else {
      cjsonData = JSON.parse(cjson);
    }
    if (!validateChemJson(cjsonData)) {
      cjsonData = null;
    }
    this.cjsonData = cjsonData;
  }

  onValueChanged = (val: any, key: string) => {
    if (key in this.state) {
      if (this.state[key].value === val) {
        return;
      }
      this.state = produce(this.state, draft => {
        draft[key].value = val;
        draft[key].touched = true;
      }); 
    }
    if (key in this.keyToEvent) {
      this.keyToEvent[key].emit(val);
    }
  }

  onMapRangeChanged = (range: [number, number]) => {
    if (sameArray(range, this.getValue('mapRange'), 0.001)) {
      return;
    }
    const colors = this.state['colors'].value;
    const colorsX = linearSpace(range[0], range[1], colors.length);

    this.state = produce(this.state, draft => {
      draft['colorsX'].value = colorsX;
      draft['colorsX'].touched = true;
      draft['mapRange'].value = range;
      draft['mapRange'].touched = true;
    });
  }

  onMapChanged = (activeMapName: string) => {
    if (activeMapName === this.getValue('activeMapName')) {
      return;
    }
    const colors = this.colorMaps[activeMapName];
    let range = this.state['range'].value;
    const isOrbitalCube = range[0] < 0 && range[1] > 0;

    if (isOrbitalCube) {
      const extreme = Math.max(Math.abs(range[0]), Math.abs(range[1]));
      range = [-extreme, extreme];
    }
    
    let colorsX: number[];
    if (isOrbitalCube && activeMapName === 'Red Blue') {
      colorsX = [range[0], -0.000001, 0.000001, range[1]];
    } else {
      colorsX = linearSpace(range[0], range[1], colors.length);
    }

    const mapRange = [...range];

    this.state = produce(this.state, draft => {
      draft['activeMapName'].value = activeMapName;
      draft['activeMapName'].touched = true;
      draft['colors'].value = colors;
      draft['colors'].touched = true;
      draft['colorsX'].value = colorsX;
      draft['colorsX'].touched = true;
      draft['mapRange'].value = mapRange;
      draft['mapRange'].touched = true;
    });
  }

  onOpacitiesChanged = (val: any) => {
    const opacities = [...val.opacity];
    const opacitiesX = [...val.opacityScalarValue];
    if (sameArray(opacities, this.getValue('opacities')) && sameArray(opacitiesX, this.getValue('opacitiesX'))) {
      return;
    }

    this.state = produce(this.state, draft => {
      draft['opacities'].value = opacities;
      draft['opacities'].touched = true;
      draft['opacitiesX'].value = opacitiesX;
      draft['opacitiesX'].touched = true;
    });
  }

  getValue(name: string) {
    return this.state[name].value;
  }

  render() {
    const cjson = this.getCjson();

    if (isNil(cjson)) {
      return (null);
    }

    return (
      <oc-molecule-base
        // Props
        cjson={cjson}
        displayStyle={this.getValue('displayStyle')}
        sphereScale={this.getValue('sphereScale')}
        stickRadius={this.getValue('stickRadius')}
        rotate={this.getValue('rotate')}
        iMode={this.getValue('iMode')}
        animationScale={this.getValue('animationScale')}
        animationSpeed={this.getValue('animationSpeed')}
        activeMapName={this.getValue('activeMapName')}
        showIsoSurface={this.getValue('showIsoSurface')}
        showVolume={this.getValue('showVolume')}
        colorMapNames={Object.keys(this.colorMaps)}
        colors={this.getValue('colors')}
        colorsX={this.getValue('colorsX')}
        opacities={this.getValue('opacities')}
        opacitiesX={this.getValue('opacitiesX')}
        isoValue={this.getValue('isoValue')}
        range={this.getValue('range')}
        mapRange={this.getValue('mapRange')}
        histograms={this.getValue('histograms')}
        moleculeRenderer={this.getValue('moleculeRenderer')}
        iOrbital={this.getValue('iOrbital')}
        orbitalSelect={this.getValue('orbitalSelect')}
        showMenu={this.getValue('showMenu')}
        zoom={this.zoom}
        // Events
        onIModeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iMode')}}
        onPlayChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'play')}}
        onAnimationScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'animationScale')}}
        onAnimationSpeedChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'animationSpeed')}}
        onOpacitiesChanged={(e: CustomEvent) => {this.onOpacitiesChanged(e.detail)}}
        onActiveMapNameChanged={(e: CustomEvent) => {this.onMapChanged(e.detail)}}
        onIsoValueChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'isoValue')}}
        onShowVolumeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showVolume')}}
        onShowIsoSurfaceChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showIsoSurface')}}
        onDisplayStyleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'displayStyle')}}
        onSphereScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'sphereScale')}}
        onStickRadiusChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'stickRadius')}}
        onMapRangeChanged={(e: CustomEvent) => {this.onMapRangeChanged(e.detail)}}
        onMoleculeRendererChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'moleculeRenderer')}}
        onIOrbitalChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iOrbital')}}
      />
    )
  }
}
