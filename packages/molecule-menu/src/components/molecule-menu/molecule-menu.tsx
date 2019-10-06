import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

import { IMolecularOrbitals } from '@openchemistry/types';

import { PlayIcon, PauseIcon } from '../../icons';
import { presets, renderers } from './constants';

import '@ionic/core';
import 'ionicons';
import '@openchemistry/volume-controls';
import { isNil } from 'lodash-es';

@Component({
  tag: 'oc-molecule-menu',
  styleUrl: 'molecule-menu.css',
  shadow: true
})
export class MoleculeMenu {

  // Style options
  @Prop() displayStyle: string;
  @Prop() sphereScale: number;
  @Prop() stickRadius: number;
  // Normal mode options
  @Prop() nModes: number;
  @Prop() iMode: number;
  @Prop() animationScale: number;
  @Prop() animationSpeed: number;
  @Prop() play: boolean;
  // Visibility options
  @Prop() showVolume: boolean;
  @Prop() showIsoSurface: boolean;
  // Volume options
  @Prop() colors: [number, number, number][];
  @Prop() colorsX: number[];
  @Prop() opacities: number[];
  @Prop() opacitiesX: number[];
  @Prop() range: [number, number];
  @Prop() mapRange: [number, number];
  @Prop() histograms: number[];
  // Other options
  @Prop() hasVolume: boolean;
  @Prop() colorMapNames: string[];
  @Prop() activeMapName: string;
  // IsoSurface options
  @Prop() isoValue: number;
  // Renderers
  @Prop() moleculeRenderer: string;
  // Orbitals options
  @Prop() iOrbital: number | string;
  @Prop() orbitals: IMolecularOrbitals;
  @Prop() nOrbitals: number;
  @Prop() nElectrons: number;
  @Prop() scfType: string;

  @Prop() orbitalSelect: boolean;

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

  keyToEvent: Object;

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

  onDisplayStyleChanged(val: string) {
    if (val !== 'custom') {
      this.onValueChanged(presets[val].sphereScale, 'sphereScale');
      this.onValueChanged(presets[val].stickRadius, 'stickRadius');
    }
    this.onValueChanged(val, 'displayStyle');
  }

  mapRangeHandler(val: any) {
    if (!val) {
      return;
    }

    const mapRange = this.mapRange ? [...this.mapRange] : [0, 1];

    if (val.lower == mapRange[0] && val.upper == mapRange[1]) {
      return;
    }
    this.onValueChanged([val.lower, val.upper], 'mapRange');
  }

  mapRangeSingleHandler(val: number, index: number) {
    if (!isFinite(val) || val === this.mapRange[index]) {
      return;
    }
    const mapRange: [number, number] = [this.mapRange[0], this.mapRange[1]];
    mapRange[index] = val;
    this.onValueChanged(mapRange, 'mapRange');
  }

  render() {
    const normalModeOptions = [];
    normalModeOptions.push(
      <ion-select-option key={'-1'} value={'-1'}>None</ion-select-option>
    );
    for (let i = 0; i < this.nModes; ++i) {
      normalModeOptions.push(
        <ion-select-option key={i.toString()} value={i.toString()}>{i}</ion-select-option>
      );
    }

    const colorMapsOptions = [];
    for (let mapName of this.colorMapNames || []) {
      colorMapsOptions.push(
        <ion-select-option key={mapName} value={mapName}>{mapName}</ion-select-option>
      );
    }

    const displayStyleOptions = [];
    for (let key in presets) {
      displayStyleOptions.push(
        <ion-select-option key={key} value={key}>{presets[key].label}</ion-select-option>
      );
    }

    const moleculeRendererOptions = [];
    for (let key in renderers) {
      moleculeRendererOptions.push(
        <ion-select-option key={key} value={key}>{renderers[key].label}</ion-select-option>
      );
    }

    const orbitalOptions = [];
    orbitalOptions.push(
      <ion-select-option key={'-1'} value={'-1'}>None</ion-select-option>
    );
    if (!isNil(this.orbitals)) {
      const { numbers, energies, occupations } = this.orbitals;
      const iLumo = occupations.findIndex((val) => val === 0);
      const iHomo = iLumo - 1;
      const nOrbitals = numbers.length;
      for (let i = 0; i < nOrbitals; ++i) {
        let value = i.toString();
        let label: string;
        if (i === iHomo) {
          value = 'homo';
          label = `${numbers[i]} ${energies[i].toFixed(3)} Ha (HOMO)`;
        } else if (i === iLumo) {
          value = 'lumo';
          label = `${numbers[i]} ${energies[i].toFixed(3)} Ha (LUMO)`;
        } else {
          label = `${numbers[i]} ${energies[i].toFixed(3)} Ha`;
        }
        orbitalOptions.push(
          <ion-select-option key={i.toString()} value={value}>{label}</ion-select-option>
        );
      }
    } else {
      const iLumo = this.scfType === 'rhf' ? Math.floor(this.nElectrons / 2) : this.nElectrons;
      const iHomo = iLumo - 1;
      let nOrbitals = this.nOrbitals;
      if (isNil(nOrbitals)) {
        // If we don't know the number of orbitals, show up to the LUMO.
        nOrbitals = iLumo + 1;
      }
      for (let i = 0; i < nOrbitals; ++i) {
        let value = i.toString();
        let label: string;
        if (i === iHomo) {
          value = 'homo';
          label = `${i} (HOMO)`;
        } else if (i === iLumo) {
          value = 'lumo';
          label = `${i} (LUMO)`;
        } else {
          label = `${i}`;
        }
        orbitalOptions.push(
          <ion-select-option key={i.toString()} value={value}>{label}</ion-select-option>
        );
      }  
    }

    let menuItems = [];

    menuItems.push(
      <ion-item key="displayStyle">
        <ion-label color="primary" position="stacked">Molecule Style</ion-label>
        <ion-select
          style={{width: "100%"}}
          value={this.displayStyle}
          onIonChange={(e: CustomEvent)=>{this.onDisplayStyleChanged(e.detail.value)}}
        >
          {displayStyleOptions}
        </ion-select>
      </ion-item>
    );

    if (this.displayStyle === 'custom') {

      menuItems.push(
        <ion-item key="ballSlider">
          <ion-label color="primary" position="stacked">Ball scale</ion-label>
          <ion-range
            // debounce={150}
            min={0.0}
            max={1.0}
            step={0.01}
            value={this.sphereScale}
            onIonChange={ (e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'sphereScale')}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.sphereScale) ? this.sphereScale.toFixed(2) : "0.00"}
              debounce={1000}
              onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'sphereScale')}}
            ></ion-input>
          </div>
        </ion-item>
      );

      menuItems.push(
        <ion-item key="stickSlider">
          <ion-label color="primary" position="stacked">Stick radius</ion-label>
          <ion-range
            // debounce={150}
            min={0.0}
            max={this.sphereScale}
            step={0.01}
            value={this.stickRadius}
            onIonChange={ (e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'stickRadius')}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.stickRadius) ? this.stickRadius.toFixed(2) : "0.00"}
              debounce={1000}
              onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'stickRadius')}}
            ></ion-input>
          </div>
        </ion-item>
      );

    }

    if (this.orbitalSelect) {
      menuItems.push(
        <ion-item key="orbitalSelect">
          <ion-label color="primary" position="stacked">Molecular orbital</ion-label>
          <ion-select
            style={{width: "100%"}}
            value={this.iOrbital ? this.iOrbital.toString() : ''}
            onIonChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'iOrbital')}}
          >
            {orbitalOptions}
          </ion-select>
        </ion-item>
      );
    }

    if (this.hasVolume) {
      menuItems.push(
        <ion-item key="isoSurfaceToggle">
          <ion-label>Show Isosurface</ion-label>
          <ion-toggle
            checked={this.showIsoSurface}
            onIonChange={(e) => {this.onValueChanged(e.detail.checked, 'showIsoSurface')}}
          />
        </ion-item>
      );
      if (this.showIsoSurface) {
        menuItems.push(
          <ion-item key="isoSurfaceSlider">
            <ion-label color="primary" position="stacked">Isovalue</ion-label>
            <ion-range
              debounce={150}
              min={0.0005}
              max={0.05}
              step={0.0001}
              value={this.isoValue}
              onIonChange={ (e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'isoValue')}}
            />
            <div class="end-slot" slot="end">
              <ion-input value={isFinite(this.isoValue) ? this.isoValue.toFixed(4) : "0.0000"}
                debounce={1000}
                onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'isoValue')}}
              ></ion-input>
            </div>
          </ion-item>
        );
      }
      menuItems.push(
        <ion-item key="volumeToggle" disabled={this.moleculeRenderer !== 'vtkjs'}>
          <ion-label>Show Volume {this.moleculeRenderer !== 'vtkjs' ? '(VTK.js only)' : ''}</ion-label>
          <ion-toggle
            checked={this.showVolume}
            onIonChange={(e) => {this.onValueChanged(e.detail.checked, 'showVolume')}}
          />
        </ion-item>
      );
      if (this.showVolume && this.moleculeRenderer === 'vtkjs') {
        menuItems.push(
          <div style={{width: "100%", height: "8rem"}}>
            <oc-volume-controls
              colors={this.colors}
              colorsX={this.colorsX}
              opacities={this.opacities}
              opacitiesX={this.opacitiesX}
              range={this.range}
              histograms={this.histograms}
              onOpacitiesChanged={(ev: CustomEvent) => {
                this.opacitiesChanged.emit(ev.detail);
              }}
            />
          </div>
        );
        menuItems.push(
          <ion-item key="mapRange">
            <ion-label color="primary" position="stacked">Color map range</ion-label>
            <div class="start-slot" slot="start">
              <ion-input value={ this.mapRange && isFinite(this.mapRange[0]) ? this.mapRange[0].toFixed(3) : this.range ? this.range[0].toFixed(3) : "0.000"}
                debounce={1000}
                onIonChange={(e: CustomEvent)=>{this.mapRangeSingleHandler(parseFloat(e.detail.value), 0)}}
              ></ion-input>
            </div>
            <div class="item-content">
              <ion-range
                dualKnobs
                min={this.range ? this.range[0] : 0}
                max={this.range ? this.range[1] : 1}
                step={0.001}
                value={{
                  lower: this.mapRange ? this.mapRange[0] : this.range ? this.range[0] : 0,
                  upper: this.mapRange ? this.mapRange[1] : this.range ? this.range[1] : 1
                }}
                onIonChange={ (e: CustomEvent)=>{this.mapRangeHandler(e.detail.value)}}
              />
            </div>
            <div class="end-slot" slot="end">
              <ion-input value={ this.mapRange && isFinite(this.mapRange[1]) ? this.mapRange[1].toFixed(3) : this.range ? this.range[1].toFixed(3) : "1.000"}
                debounce={1000}
                onIonChange={(e: CustomEvent)=>{this.mapRangeSingleHandler(parseFloat(e.detail.value), 1)}}
              ></ion-input>
            </div>
          </ion-item>
        );
        menuItems.push(
            <ion-item key="colormapSelect">
              <ion-label color="primary" position="stacked">Color Map</ion-label>
              <ion-select
                style={{width: "100%"}}
                value={this.activeMapName}
                onIonChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'activeMapName')}}
              >
                {colorMapsOptions}
              </ion-select>
            </ion-item>
        );
      }
    }

    if (this.nModes > 0) {
      menuItems.push(
        <ion-item key="normalModeSelect">
          <ion-label color="primary" position="stacked">Normal Mode</ion-label>
          <ion-select
            style={{width: "100%"}}
            value={this.iMode ? this.iMode.toString() : ''}
            onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseInt(e.detail.value), 'iMode')}}
          >
            {normalModeOptions}
          </ion-select>
          <div class="end-slot" slot="end">
            <ion-button fill="solid" color="light" shape="round" onClick={() => {this.onValueChanged(!this.play, 'play')}}>
              <ion-icon icon={this.play ? PauseIcon : PlayIcon}></ion-icon>
            </ion-button>
          </div>
        </ion-item>
      );
      menuItems.push(
        <ion-item disabled={!this.play || this.iMode < 0} key="animationScaleSlider">
          <ion-label color="primary" position="stacked">Animation Scale</ion-label>
          <ion-range
            debounce={150}
            min={0.5}
            max={3}
            step={0.5}
            value={this.animationScale}
            onIonChange={ (e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'animationScale')}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.animationScale) ? this.animationScale.toFixed(1) : "0.0"}
              debounce={1000}
              onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'animationScale')}}
            ></ion-input>
          </div>
        </ion-item>
      );
      menuItems.push(
        <ion-item disabled={!this.play || this.iMode < 0} key="animationSpeedSlider">
          <ion-label color="primary" position="stacked">Animation Speed</ion-label>
          <ion-range
            debounce={150}
            min={0.5}
            max={3}
            step={0.5}
            value={this.animationSpeed}
            onIonChange={ (e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'animationSpeed')}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.animationSpeed) ? this.animationSpeed.toFixed(1) : "0.0"}
              debounce={1000}
              onIonChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'animationSpeed')}}
            ></ion-input>
          </div>
        </ion-item>
      );
    }

    menuItems.push(
      <ion-item key="moleculeRenderer">
        <ion-label color="primary" position="stacked">Molecule renderer</ion-label>
        <ion-select
          style={{width: "100%"}}
          value={this.moleculeRenderer}
          onIonChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'moleculeRenderer')}}
        >
          {moleculeRendererOptions}
        </ion-select>
      </ion-item>
    );

    return (
      <div>
        {menuItems}
      </div>
    )
  }
}
