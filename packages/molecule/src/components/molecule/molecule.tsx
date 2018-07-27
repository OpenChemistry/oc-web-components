import { Component, Prop, State, Watch } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions } from '@openchemistry/utils';
import { redYelBlu, viridis, plasma, gray } from '@openchemistry/utils';

import { BenzeneWithHomo } from '@openchemistry/sample-data';

import '@openchemistry/molecule-menu';
import '@openchemistry/molecule-moljs';
import '@openchemistry/vibrational-spectrum';
import 'split-me';

@Component({
  tag: 'oc-molecule',
  styleUrl: 'molecule.css'
})
export class Molecule {

  // The chemical json object in input
  @Prop() cjson: IChemJson;
  @Watch('cjson')
  cjsonHandler() {
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

  componentWillLoad() {
    console.log('Molecule is about to be rendered');
    this.cjsonData = this.getCjson();
    this.activeMap = 'Red Yellow Blue';
    this.options.volume.colors = this.colorMaps[this.activeMap];
  }

  componentDidLoad() {
    console.log('Molecule has been rendered');
  }

  componentWillUpdate() {
    console.log('Molecule will update and re-render');
    this.cjsonData = this.getCjson();
  }

  componentDidUpdate() {
    console.log('Molecule did update');
  }

  componentDidUnload() {
    console.log('Molecule removed from the DOM');
  }

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson();
    }
    // return this.cjsonData;
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

  render() {
    const cjson = this.getCjson();
    const hasVolume = !!cjson && !!cjson.cube;
    const hasSpectrum = !!cjson && !!cjson.vibrations && !!cjson.vibrations.frequencies;

    const nModes = hasSpectrum ? cjson.vibrations.frequencies.length : -1;
    
    const splitN = hasSpectrum ? 2 : 1;
    const splitSizes = hasSpectrum ? "0.4, 0.6" : "1";

    return (
      <div class='main-container'>
        <split-me n={splitN} sizes={splitSizes}>
          <oc-molecule-moljs
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
        { (hasSpectrum || hasVolume) &&
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
              ></oc-molecule-menu>
          </oc-molecule-menu-popup>
        </div>
        }
      </div>
    )
  }
}
