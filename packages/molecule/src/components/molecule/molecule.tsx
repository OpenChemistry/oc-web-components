import { Component, Prop, State, Watch } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions, makeBins } from '@openchemistry/utils';
import { redYelBlu, viridis, plasma, gray } from '@openchemistry/utils';

import memoizeOne from 'memoize-one';

import '@openchemistry/molecule-menu';
import '@openchemistry/molecule-vtkjs';
import '@openchemistry/vibrational-spectrum';
import 'split-me';

@Component({
  tag: 'oc-molecule',
  styleUrl: 'molecule.css',
  shadow: true
})
export class Molecule {

  // The chemical json object in input
  @Prop() cjson: IChemJson;
  @Watch('cjson')
  cjsonHandler() {
    this.cjsonHasChanged = true;
    this.cjsonData = null;
  }

  @State() options: IDisplayOptions = composeDisplayOptions({});

  cjsonData: IChemJson;
  cjsonHasChanged: boolean = false;

  activeMap: string;
  colorMaps = {
    'Red Yellow Blue': redYelBlu,
    'Viridis': viridis,
    'Plasma': plasma,
    'Gray': gray
  }

  makeBins: Function;

  componentWillLoad() {
    console.log('Molecule is about to be rendered');
    this.getRange = memoizeOne(this.getRange);
    this.makeBins = memoizeOne(makeBins);
    this.cjsonData = this.getCjson();
    this.activeMap = 'Red Yellow Blue';
    this.options.volume.colors = this.colorMaps[this.activeMap];
    if (!isNil(this.cjsonData) && !isNil(this.cjsonData.cube)) {
      let range = this.getRange(this.cjsonData.cube.scalars);
      let histograms = this.makeBins(this.cjsonData.cube.scalars, 50, range);
      this.options.volume.range = range;
      this.options.volume.histograms = histograms;
    }
  }

  componentDidLoad() {
    console.log('Molecule has been rendered');
  }

  componentWillUpdate() {
    console.log('Molecule will update and re-render');
    if (this.cjsonHasChanged) {
      this.cjsonHasChanged = false;
      this.cjsonData = this.getCjson();
      if (!isNil(this.cjsonData) && !isNil(this.cjsonData.cube)) {
        this.options.volume = {...this.options.volume};
        let range = this.getRange(this.cjsonData.cube.scalars);
        let histograms = this.makeBins(this.cjsonData.cube.scalars, 50, range);
        this.options.volume.range = range;
        this.options.volume.histograms = histograms;
        this.options = {...this.options};
      }
    }
  }

  componentDidUpdate() {
    console.log('Molecule did update');
  }

  componentDidUnload() {
    console.log('Molecule removed from the DOM');
  }

  getRange(arr: number[]) : [number, number] {
    let range: [number, number] = [0, 0];
    range[0] = Math.min(...arr);
    range[1] = Math.max(...arr);
    return range;
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

  onAnimationChanged = (e: CustomEvent, key: string) => {
    this.options.normalMode = {...this.options.normalMode};
    this.options.normalMode[key] = e.detail;
    this.options = {...this.options};
  }

  onVolumeChanged = (e: CustomEvent, key: string) => {    
    if (key === 'opacity') {
      this.options.volume = {...this.options.volume, ...e.detail};
    } else if (key === 'colormap') {
      this.activeMap = e.detail;
      this.options.volume = {...this.options.volume, ...{colors: this.colorMaps[e.detail]}};
    }
    this.options = {...this.options};
  }

  onIsoValueChanged = (e: CustomEvent) => {
    let iso = e.detail;
    this.options.isoSurfaces = [{
      value: iso,
      color: 'blue',
      opacity: 0.9,
    }, {
      value: -iso,
      color: 'red',
      opacity: 0.9
    }
    ];
    this.options = {...this.options};
  }

  onVisibilityChanged = (e: CustomEvent) => {
    this.options.visibility = {...this.options.visibility, ...e.detail};
    this.options = {...this.options};
  }

  onStyleChanged = (e: CustomEvent, key: string) => {
    this.options.style = {...this.options.style};
    if (key === 'sphere') {
      this.options.style.sphere = {scale: e.detail};
    } else if (key === 'stick') {
      this.options.style.stick = {radius: e.detail};
    }
    this.options = {...this.options};
  }

  render() {
    const cjson = this.getCjson();
    const hasVolume = !!cjson && !!cjson.cube;
    const hasSpectrum = !!cjson && !!cjson.vibrations && !!cjson.vibrations.frequencies;

    const nModes = hasSpectrum ? cjson.vibrations.frequencies.length : -1;
    
    const splitN = hasSpectrum ? 2 : 1;
    const splitSizes = hasSpectrum ? "0.4, 0.6" : "1";

    if (isNil(cjson)) {
      return (null);
    }

    return (
      <div class='main-container'>
        <div class='molecule-container'>
          <split-me n={splitN} sizes={splitSizes}>
            <oc-molecule-vtkjs
              slot='0'
              cjson={cjson}
              options={this.options}
            />
            {hasSpectrum &&
            <oc-vibrational-spectrum
              slot='1'
              vibrations={cjson.vibrations}
              options={this.options.normalMode}
              onBarSelected={(e) => {this.onAnimationChanged(e, 'modeIdx')}}
            />
            }
          </split-me>
        </div>
        <div class='menu-container'>
          <oc-molecule-menu-popup>
            <oc-molecule-menu
              nModes={nModes}
              iMode={this.options.normalMode.modeIdx}
              scaleValue={this.options.normalMode.scale}
              hasVolume={hasVolume}
              colorMaps={Object.keys(this.colorMaps)}
              activeMap={this.activeMap}
              volumeOptions={this.options.volume}
              visibilityOptions={this.options.visibility}
              onNormalModeChanged={(e) => {this.onAnimationChanged(e, 'modeIdx')}}
              onPlayChanged={(e) => {this.onAnimationChanged(e, 'play')}}
              onScaleValueChanged={(e) => {this.onAnimationChanged(e, 'scale')}}
              onOpacitiesChanged={(e) => {this.onVolumeChanged(e, 'opacity')}}
              onColorMapChanged={(e) => {this.onVolumeChanged(e, 'colormap')}}
              onIsoValueChanged={this.onIsoValueChanged}
              onVisibilityChanged={this.onVisibilityChanged}
              onBallChanged={(e) => {this.onStyleChanged(e, 'sphere')}}
              onStickChanged={(e) => {this.onStyleChanged(e, 'stick')}}
              ></oc-molecule-menu>
          </oc-molecule-menu-popup>
        </div>
      </div>
    )
  }
}
