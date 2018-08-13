import { Component, Prop, State, Watch } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions, makeBins } from '@openchemistry/utils';
import { redYelBlu, viridis, plasma, gray } from '@openchemistry/utils';
import { linearSpace } from '@openchemistry/utils';

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

  defaultOptions: IDisplayOptions = composeDisplayOptions({});

  // IsoSurface options
  @State() isoValue: number = 0.005;
  // Style options
  @State() sphereScale: number = 0.3;
  @State() stickRadius: number = 0.14;
  // Normal mode options
  @State() play: boolean = true;
  @State() iMode: number = -1;
  @State() animationScale: number = 1;
  // Visibility options
  @State() showVolume: boolean = false;
  @State() showIsoSurface: boolean = true;
  // Volume options
  @State() colorsX: number[];
  @State() opacities: number[];
  @State() opacitiesX: number[];
  @State() range: [number, number];
  @State() histograms: number[];
  @State() activeMapName: string;

  cjsonData: IChemJson;

  colorMaps = {
    'Red Yellow Blue': redYelBlu,
    'Viridis': viridis,
    'Plasma': plasma,
    'Gray': gray
  }

  makeBins: Function;

  @Watch('cjson')
  cjsonHandler(val) {
    this.cjsonData = null;
    this.cjson = val;
    this.cjsonData = this.getCjson();
    this.updateVolumeOptions();
  }

  componentWillLoad() {
    console.log('Molecule is about to be rendered');
    this.getRange = memoizeOne(this.getRange);
    this.makeBins = memoizeOne(makeBins);
    this.cjsonData = this.getCjson();
    this.activeMapName = 'Red Yellow Blue';
    this.opacities = [1, 0, 1];
    this.updateVolumeOptions();
    this.range = [0, 1];
  }

  updateVolumeOptions() {
    this.range = [0, 1];
    if (!isNil(this.cjsonData) && !isNil(this.cjsonData.cube)) {
      this.range = this.getRange(this.cjsonData.cube.scalars);
      this.histograms = this.makeBins(this.cjsonData.cube.scalars, 200, this.range);
    }
    this.colorsX = linearSpace(this.range[0], this.range[1], this.colorMaps[this.activeMapName].length);
    this.opacitiesX = linearSpace(this.range[0], this.range[1], this.opacities.length);
  }

  makeIsoSurfaces = (iso: number) => {
    return [
      {
        value: iso,
        color: 'blue',
        opacity: 0.9,
      }, {
        value: -iso,
        color: 'red',
        opacity: 0.9
      }
    ]
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

  onValueChanged = (val: any, key: string) => {
    if (key in this) {
      if (this[key] === val) {
        return;
      }
      this[key] = val;
    }
  }

  onMapRangeChanged = (range: [number, number]) => {
    let colors = this.colorMaps[this.activeMapName];
    if (!colors) {
      return;
    }
    this.colorsX = linearSpace(range[0], range[1], colors.length);
  }

  onOpacitiesChanged = (val: any) => {
    this.opacities = [...val.opacity];
    if (val.opacityScalarValue) {
      this.opacitiesX = [...val.opacityScalarValue];
    } else {
      this.opacitiesX = linearSpace(this.range[0], this.range[1], this.opacities.length);
    }
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
        <p>
          {JSON.stringify(this.opacities)}
        </p>
        <p>
          {JSON.stringify(this.opacitiesX)}
        </p>
        <div class='molecule-container'>
          <split-me n={splitN} sizes={splitSizes}>
            <oc-molecule-vtkjs
              slot='0'
              cjson={cjson}
              options={
                {
                  ...this.defaultOptions,
                  isoSurfaces: this.makeIsoSurfaces(this.isoValue),
                  style: {
                    sphere: {
                      scale: this.sphereScale
                    },
                    stick: {
                      radius: this.stickRadius
                    }
                  },
                  normalMode: {
                    play: this.play,
                    modeIdx: this.iMode,
                    scale: this.animationScale
                  },
                  volume: {
                    colors: this.colorMaps[this.activeMapName],
                    colorsScalarValue: this.colorsX,
                    opacity: this.opacities,
                    opacityScalarValue: this.opacitiesX,
                    range: this.range
                  },
                  visibility: {
                    isoSurfaces: this.showIsoSurface,
                    volume: this.showVolume
                  }
                }
              }
            />
            {hasSpectrum &&
            <oc-vibrational-spectrum
              slot='1'
              vibrations={cjson.vibrations}
              options={{
                modeIdx: this.iMode,
                play: this.play
              }}
              onBarSelected={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iMode')}}
            />
            }
          </split-me>
        </div>
        <div class='menu-container'>
          <oc-molecule-menu-popup>
            <oc-molecule-menu
              // Props
              nModes={nModes}
              iMode={this.iMode}
              animationScale={this.animationScale}
              hasVolume={hasVolume}
              colorMapNames={Object.keys(this.colorMaps)}
              activeMapName={this.activeMapName}
              showIsoSurface={this.showIsoSurface}
              showVolume={this.showVolume}
              colors={this.colorMaps[this.activeMapName]}
              colorsX={this.colorsX}
              opacities={this.opacities}
              opacitiesX={this.opacitiesX}
              range={this.range}
              histograms={this.histograms}
              // Events
              onIModeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iMode')}}
              onPlayChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'play')}}
              onAnimationScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'animationScale')}}
              onOpacitiesChanged={(e: CustomEvent) => {this.onOpacitiesChanged(e.detail)}}
              onActiveMapNameChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'activeMapName')}}
              onIsoValueChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'isoValue')}}
              onShowVolumeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showVolume')}}
              onShowIsoSurfaceChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showIsoSurface')}}
              onSphereScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'sphereScale')}}
              onStickRadiusChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'stickRadius')}}
              onMapRangeChanged={(e: CustomEvent) => {this.onMapRangeChanged(e.detail)}}
              ></oc-molecule-menu>
          </oc-molecule-menu-popup>
        </div>
      </div>
    )
  }
}
