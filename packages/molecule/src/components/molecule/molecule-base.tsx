import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

import { isNil, has } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions } from '@openchemistry/utils';

import '@openchemistry/molecule-menu';
import '@openchemistry/molecule-vtkjs';
import '@openchemistry/molecule-moljs';
import '@openchemistry/vibrational-spectrum';
import 'split-me';

@Component({
  tag: 'oc-molecule-base',
  styleUrl: 'molecule-base.css',
  shadow: true
})
export class MoleculeBase {

  // The chemical json object in input
  @Prop() cjson: IChemJson;

  defaultOptions: IDisplayOptions = composeDisplayOptions({});

  // IsoSurface options
  @Prop() isoValue: number;
  // Style options
  @Prop() displayStyle: string;
  @Prop() sphereScale: number;
  @Prop() stickRadius: number;
  // Normal mode options
  @Prop() play: boolean;
  @Prop() iMode: number;
  @Prop() animationScale: number;
  @Prop() animationSpeed: number;
  // Visibility options
  @Prop() showVolume: boolean;
  @Prop() showIsoSurface: boolean;
  @Prop() showSpectrum: boolean;
  @Prop() showMenu: boolean;
  // Volume options
  @Prop() colors: [number, number, number][];
  @Prop() colorsX: number[];
  @Prop() opacities: number[];
  @Prop() opacitiesX: number[];
  @Prop() range: [number, number];
  @Prop() mapRange: [number, number];
  @Prop() histograms: number[];
  @Prop() activeMapName: string;
  // Orbital options
  @Prop() iOrbital: number | string;
  // Other options
  @Prop() colorMapNames: string[] = [];
  @Prop() rotate: boolean;
  @Prop() orbitalSelect: boolean;
  @Prop() zoom: number;
  // Molecule renderer
  @Prop() moleculeRenderer: string;

  // Style events
  @Event() displayStyleChanged: EventEmitter;
  @Event() sphereScaleChanged: EventEmitter;
  @Event() stickRadiusChanged: EventEmitter;
  // Normal mode events
  @Event() iModeChanged: EventEmitter;
  @Event() animationScaleChanged: EventEmitter;
  @Event() animationSpeedChanged: EventEmitter;
  @Event() playChanged: EventEmitter;
  // Visibility events
  @Event() showVolumeChanged: EventEmitter;
  @Event() showIsoSurfaceChanged: EventEmitter;
  // Volume events
  @Event() opacitiesChanged: EventEmitter;
  // Isosurface events
  @Event() isoValueChanged: EventEmitter;
  // Other events
  @Event() activeMapNameChanged: EventEmitter;
  @Event() mapRangeChanged: EventEmitter;
  // Renderers
  @Event() moleculeRendererChanged: EventEmitter;
  // Orbitals
  @Event() iOrbitalChanged: EventEmitter;

  cjsonData: IChemJson;
  keyToEvent: Object;

  @Watch('cjson')
  cjsonHandler(val) {
    this.setCjson(val);
  }

  componentWillLoad() {
    // Map props names to event emitters
    this.keyToEvent = {
      displayStyle: this.displayStyleChanged,
      sphereScale: this.sphereScaleChanged,
      stickRadius: this.stickRadiusChanged,
      iMode: this.iModeChanged,
      animationScale: this.animationScaleChanged,
      animationSpeed: this.animationSpeedChanged,
      play: this.playChanged,
      showIsoSurface: this.showIsoSurfaceChanged,
      showVolume: this.showVolumeChanged,
      mapRange: this.mapRangeChanged,
      activeMapName: this.activeMapNameChanged,
      isoValue: this.isoValueChanged,
      moleculeRenderer: this.moleculeRendererChanged,
      iOrbital: this.iOrbitalChanged
    }
    this.setCjson(this.cjson);
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

  onValueChanged(val: any, key: string) {
    if (key in this) {
      if (this[key] === val) {
        return;
      }
    }
    if (key in this.keyToEvent) {
      this.keyToEvent[key].emit(val);
    }
  }

  render() {
    const cjson = this.getCjson();
    const hasVolume = !!cjson && !!cjson.cube;
    const hasSpectrum = !!cjson && !!cjson.vibrations && !!cjson.vibrations.frequencies;

    const nModes = hasSpectrum ? cjson.vibrations.frequencies.length : -1;
    
    const splitN = hasSpectrum  && this.showSpectrum ? 2 : 1;
    const splitSizes = hasSpectrum ? "0.4, 0.6" : "1";

    const moleculeOptions = {
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
        scale: this.animationScale,
        periodsPerSecond: this.animationSpeed,
        framesPerPeriod: Math.round(15 / this.animationSpeed)
      },
      volume: {
        colors: this.colors,
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

    if (isNil(cjson)) {
      return (null);
    }

    return (
      <div class='main-container'>
        <div class='molecule-container'>
          <split-me n={splitN} sizes={splitSizes}>
            <div slot='0' style={{width: '100%', height: '100%'}}>
            { this.moleculeRenderer === 'vtkjs' &&
            <oc-molecule-vtkjs
              cjson={cjson}
              options={moleculeOptions}
              rotate={this.rotate}
              zoom={this.zoom}
            />
            }
            { this.moleculeRenderer !== 'vtkjs' &&
            <oc-molecule-moljs
              cjson={cjson}
              options={moleculeOptions}
              rotate={this.rotate}
            />
            }
            </div>
            {(hasSpectrum  && this.showSpectrum) &&
            <oc-vibrational-spectrum
              slot='1'
              vibrations={cjson.vibrations}
              VibrationsExperimental={cjson.exp_vibrations}
              options={{
                modeIdx: this.iMode,
                play: this.play
              }}
              onBarSelected={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iMode')}}
            />
            }
          </split-me>
        </div>
        { this.showMenu &&
        <div class='menu-container'>
          <oc-molecule-menu-popup>
            <oc-molecule-menu
              // Props
              displayStyle={this.displayStyle}
              sphereScale={this.sphereScale}
              stickRadius={this.stickRadius}
              nModes={nModes}
              iMode={this.iMode}
              animationScale={this.animationScale}
              animationSpeed={this.animationSpeed}
              hasVolume={hasVolume}
              colorMapNames={this.colorMapNames}
              activeMapName={this.activeMapName}
              showIsoSurface={this.showIsoSurface}
              showVolume={this.showVolume}
              colors={this.colors}
              colorsX={this.colorsX}
              opacities={this.opacities}
              opacitiesX={this.opacitiesX}
              isoValue={this.isoValue}
              range={this.range}
              mapRange={this.mapRange}
              histograms={this.histograms}
              moleculeRenderer={this.moleculeRenderer}
              orbitals={has(cjson, 'molecularOrbitals') ? cjson.molecularOrbitals : null}
              nElectrons={has(cjson, 'orbitals.electronCount') ? cjson.orbitals.electronCount : 0}
              nOrbitals={has(cjson, 'molecularOrbitals.numbers') ? cjson.molecularOrbitals.numbers.length : null}
              scfType={has(cjson, 'properties.scfType') ? cjson.properties.scfType : 'rhf'}
              iOrbital={this.iOrbital}
              orbitalSelect={this.orbitalSelect}
              // Events
              onDisplayStyleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'displayStyle')}}
              onIModeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iMode')}}
              onPlayChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'play')}}
              onAnimationScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'animationScale')}}
              onAnimationSpeedChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'animationSpeed')}}
              onOpacitiesChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'opacities')}}
              onActiveMapNameChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'activeMapName')}}
              onIsoValueChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'isoValue')}}
              onShowVolumeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showVolume')}}
              onShowIsoSurfaceChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'showIsoSurface')}}
              onSphereScaleChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'sphereScale')}}
              onStickRadiusChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'stickRadius')}}
              onMapRangeChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'mapRange')}}
              onMoleculeRendererChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'moleculeRenderer')}}
              onIOrbitalChanged={(e: CustomEvent) => {this.onValueChanged(e.detail, 'iOrbital')}}
              />
          </oc-molecule-menu-popup>
        </div>
        }
      </div>
    )
  }
}
