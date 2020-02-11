import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

import { IMolecularOrbitals } from '@openchemistry/types';

import { PlayIcon, PauseIcon } from '../../icons';
import { presets, renderers } from './constants';

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

  mapRangeHandler(val: [number, number]) {
    if (!Array.isArray(val)) {
      return;
    }

    const mapRange = this.mapRange ? [...this.mapRange] : [0, 1];

    if (val[0] == mapRange[0] && val[1] == mapRange[1]) {
      return;
    }
    this.onValueChanged(val, 'mapRange');
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
    const normalModeOptions = [
      {value: '-1', label: 'None'}
    ];
    for (let i = 0; i < this.nModes; ++i) {
      normalModeOptions.push(
        {value: i.toString(), label: i.toString()}
      );
    }

    const colorMapsOptions = (this.colorMapNames || []).map(name => ({value: name, label: name}));

    const displayStyleOptions = Object.entries(presets).map(([value, {label}]) => ({value, label}));

    const moleculeRendererOptions = Object.entries(renderers).map(([value, {label}]) => ({value, label}));

    const orbitalOptions = [
      {value: '-1', label: 'None'}
    ];
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
        orbitalOptions.push({value, label});
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
        orbitalOptions.push({value, label});
      }
    }

    let menuItems = [];
    menuItems.push(
      <oc-select
        key="displayStyle"
        label='Molecule Style'
        value={this.displayStyle}
        options={displayStyleOptions}
        onOcChange={(e: CustomEvent) => {this.onDisplayStyleChanged(e.detail.value)}}
      />
    );

    if (this.displayStyle === 'custom') {

      menuItems.push(
        <oc-slider
          key="sphereScale"
          label="Ball size"
          value={this.sphereScale}
          min={0}
          max={1}
          step={0.01}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'sphereScale')}}
        >
          <div slot="end" class="end-slot">
            <oc-input
              value={isFinite(this.sphereScale) ? this.sphereScale.toFixed(2) : "0.00"}
              debounce={1000}
              onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'sphereScale')}}
            />
          </div>
        </oc-slider>
      )

      menuItems.push(
        <oc-slider
          key="stickRadius"
          label="Stick radius"
          value={this.stickRadius}
          min={0}
          max={this.sphereScale}
          step={0.01}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'stickRadius')}}
        >
          <div slot="end" class="end-slot">
            <oc-input
              value={isFinite(this.stickRadius) ? this.stickRadius.toFixed(2) : "0.00"}
              debounce={1000}
              onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'stickRadius')}}
            />
          </div>
        </oc-slider>
      )
    }

    if (this.orbitalSelect) {
      menuItems.push(
        <oc-select
          key="iOrbital"
          label='Molecular orbital'
          value={this.iOrbital ? this.iOrbital.toString() : ''}
          options={orbitalOptions}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'iOrbital')}}
        />
      );
    }

    if (this.hasVolume) {
      menuItems.push(
        <oc-toggle
          key="showIsoSurface"
          label="Show Isosurface"
          value={this.showIsoSurface}
          onOcChange={(e) => {this.onValueChanged(e.detail.value, 'showIsoSurface')}}
        />
      );

      if (this.showIsoSurface) {
        menuItems.push(
          <oc-slider
            key="isoValue"
            label="Isovalue"
            value={this.isoValue}
            min={0.0005}
            max={0.05}
            step={0.0001}
            onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'isoValue')}}
          >
            <div slot="end" class="end-slot">
              <oc-input
                value={isFinite(this.isoValue) ? this.isoValue.toFixed(4) : "0.0001"}
                debounce={1000}
                onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'isoValue')}}
              />
            </div>
          </oc-slider>
        );
      }

      menuItems.push(
        <oc-toggle
          key="showVolume"
          label={`Show Volume ${this.moleculeRenderer !== 'vtkjs' ? '(VTK.js only)' : ''}`}
          value={this.showVolume}
          disabled={this.moleculeRenderer !== 'vtkjs'}
          onOcChange={(e) => {this.onValueChanged(e.detail.value, 'showVolume')}}
        />
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
          <oc-double-slider
            key="mapRange"
            label="Color map range"
            value={[
              this.mapRange ? this.mapRange[0] : this.range ? this.range[0] : 0,
              this.mapRange ? this.mapRange[1] : this.range ? this.range[1] : 1
            ]}
            min={this.range ? this.range[0] : 0}
            max={this.range ? this.range[1] : 1}
            step={0.001}
            onOcChange={(e: CustomEvent)=>{this.mapRangeHandler(e.detail.value)}}
          >
            <div slot="start" class="start-slot">
              <oc-input
                value={ this.mapRange && isFinite(this.mapRange[0]) ? this.mapRange[0].toFixed(3) : this.range ? this.range[0].toFixed(3) : "0.000"}
                debounce={1000}
                onOcChange={(e: CustomEvent)=>{this.mapRangeSingleHandler(parseFloat(e.detail.value), 0)}}
              />
            </div>
            <div slot="end" class="end-slot">
              <oc-input
                value={ this.mapRange && isFinite(this.mapRange[1]) ? this.mapRange[1].toFixed(3) : this.range ? this.range[1].toFixed(3) : "1.000"}
                debounce={1000}
                onOcChange={(e: CustomEvent)=>{this.mapRangeSingleHandler(parseFloat(e.detail.value), 1)}}
              />
            </div>
          </oc-double-slider>
        );

        menuItems.push(
          <oc-select
            key="activeMapName"
            label='Color Map'
            value={this.activeMapName}
            options={colorMapsOptions}
            onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'activeMapName')}}
          />
        );
      }
    }

    if (this.nModes > 0) {
      menuItems.push(
        <oc-select
          key="iMode"
          label='Normal Mode'
          value={this.iMode ? this.iMode.toString() : ''}
          options={normalModeOptions}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseInt(e.detail.value), 'iMode')}}
        >
          <div slot="end" class="end-slot">
            <oc-icon-button
              icon={this.play ? PauseIcon : PlayIcon}
              onOcChange={() => {this.onValueChanged(!this.play, 'play')}}
            />
          </div>
        </oc-select>
      );

      menuItems.push(
        <oc-slider
          key="animationScale"
          label="Animation Scale"
          value={this.animationScale}
          min={0.5}
          max={3}
          step={0.5}
          disabled={!this.play || this.iMode < 0}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'animationScale')}}
        >
          <div slot="end" class="end-slot">
            <oc-input
              value={isFinite(this.animationScale) ? this.animationScale.toFixed(1) : "0.0"}
              disabled={!this.play || this.iMode < 0}
              debounce={1000}
              onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'animationScale')}}
            />
          </div>
        </oc-slider>
      );

      menuItems.push(
        <oc-slider
          key="animationSpeed"
          label="Animation Speed"
          value={this.animationSpeed}
          min={0.5}
          max={3}
          step={0.5}
          disabled={!this.play || this.iMode < 0}
          onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'animationSpeed')}}
        >
          <div slot="end" class="end-slot">
            <oc-input
              value={isFinite(this.animationSpeed) ? this.animationSpeed.toFixed(1) : "0.0"}
              disabled={!this.play || this.iMode < 0}
              debounce={1000}
              onOcChange={(e: CustomEvent)=>{this.onValueChanged(parseFloat(e.detail.value), 'animationSpeed')}}
            />
          </div>
        </oc-slider>
      );
    }

    menuItems.push(
      <oc-select
        key="moleculeRenderer"
        label="Molecule renderer"
        value={this.moleculeRenderer}
        options={moleculeRendererOptions}
        onOcChange={(e: CustomEvent)=>{this.onValueChanged(e.detail.value, 'moleculeRenderer')}}
      />
    );

    return (
      <div>
        {menuItems}
      </div>
    )
  }
}
