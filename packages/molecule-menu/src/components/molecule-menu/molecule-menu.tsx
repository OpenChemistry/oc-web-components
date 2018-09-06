import { Component, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';

import { PlayIcon, PauseIcon } from '../../icons';
import { presets } from './constants';

import '@ionic/core';
import 'ionicons';
import '@openchemistry/volume-controls';

@Component({
  tag: 'oc-molecule-menu',
  styleUrl: 'molecule-menu.css',
  shadow: true
})
export class MoleculeMenu {

  // Style options
  @Prop({ mutable: true} ) displayStyle: string = 'ballAndStick'
  @Prop({ mutable: true }) sphereScale: number = presets['ballAndStick'].sphereScale;
  @Prop({ mutable: true }) stickRadius: number = presets['ballAndStick'].stickRadius;
  // Normal mode options
  @Prop() nModes: number = -1;
  @Prop({ mutable: true }) iMode: number = -1;
  @Prop({ mutable: true }) animationScale: number = 1.0;
  @Prop({ mutable: true }) play: boolean = true;
  // Visibility options
  @Prop({ mutable: true }) showVolume: boolean;
  @Prop({ mutable: true }) showIsoSurface: boolean;
  // Volume options
  @Prop() colors: [number, number, number][];
  @Prop() colorsX: number[];
  @Prop() opacities: number[];
  @Prop() opacitiesX: number[];
  @Prop() range: [number, number];
  @Prop() histograms: number[];
  // Other options
  @Prop() hasVolume: boolean = false;
  @Prop() colorMapNames: string[];
  @Prop({ mutable: true }) activeMapName: string = 'Viridis';
  // IsoSurface options
  @Prop({ mutable: true }) isoValue: number = 0.01;

  @State() mapRange: [number, number];

  // Style events
  @Event() sphereScaleChanged: EventEmitter;
  @Event() stickRadiusChanged: EventEmitter;
  // Normal mode events
  @Event() iModeChanged: EventEmitter;
  @Event() animationScaleChanged: EventEmitter;
  @Event() playChanged: EventEmitter;
  // Visibility events
  @Event() showVolumeChanged: EventEmitter;
  @Event() showIsoSurfaceChanged: EventEmitter;
  // Volume events
  @Event() opacitiesChanged: EventEmitter;
  @Event() opacitiesXChanged: EventEmitter;
  // Isosurface events
  @Event() isoValueChanged: EventEmitter;
  // Other events
  @Event() activeMapNameChanged: EventEmitter;
  @Event() mapRangeChanged: EventEmitter;

  // Reset the colormap range if the data range changes
  @Watch('range')
  watchRange(newVal) {
    this.mapRange = newVal || [0, 1];
  }

  keyToEvent: Object;

  componentWillLoad() {
    console.log('MoleculeMenu is about to be rendered');
    // Map props names to event emitters
    this.keyToEvent = {
      sphereScale: this.sphereScaleChanged,
      stickRadius: this.stickRadiusChanged,
      iMode: this.iModeChanged,
      animationScale: this.animationScaleChanged,
      play: this.playChanged,
      showIsoSurface: this.showIsoSurfaceChanged,
      showVolume: this.showVolumeChanged,
      opacities: this.opacitiesChanged,
      opacitiesX: this.opacitiesXChanged,
      mapRange: this.mapRangeChanged,
      activeMapName: this.activeMapNameChanged,
      isoValue: this.isoValueChanged
    }
  }

  componentDidLoad() {
    console.log('MoleculeMenu has been rendered');
  }

  componentWillUpdate() {
    console.log('MoleculeMenu will update and re-render');
  }

  componentDidUpdate() {
    console.log('MoleculeMenu did update');
  }

  componentDidUnload() {
    console.log('MoleculeMenu removed from the DOM');
  }

  onValueChanged(val: any, key: string) {
    if (key in this) {
      if (this[key] === val) {
        return;
      }
      this[key] = val;
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
    this.displayStyle = val;
  }

  mapRangeHandler(val: any) {
    if (!val) {
      return;
    }
    if (!this.mapRange) {
      this.mapRange = [0, 1];
    }
    if (val.lower == this.mapRange[0] && val.upper == this.mapRange[1]) {
      return;
    }
    this.mapRange = [val.lower, val.upper];
    this.mapRangeChanged.emit(this.mapRange);
  }

  mapRangeSingleHandler(val: number, index: number) {
    if (!isFinite(val) || val === this.mapRange[index]) {
      return;
    }
    let mapRange: [number, number] = [this.mapRange[0], this.mapRange[1]];
    mapRange[index] = val;
    this.mapRange = mapRange;
    this.mapRangeChanged.emit(this.mapRange);
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

    if (this.hasVolume) {
      menuItems.push(
        <ion-item key="isoSurfaceToggle">
          <ion-label>Show Isosurface</ion-label>
          <ion-toggle
            checked={this.showIsoSurface}
            onClick={()=>{this.onValueChanged(!this.showIsoSurface, 'showIsoSurface')}}
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
        <ion-item key="volumeToggle">
          <ion-label>Show Volume</ion-label>
          <ion-toggle
            checked={this.showVolume}
            onClick={()=>{this.onValueChanged(!this.showVolume, 'showVolume')}}
          />
        </ion-item>
      );
      if (this.showVolume) {
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
            value={this.iMode.toString()}
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
    }

    return (
      <div>
        {menuItems}
      </div>
    )
  }
}
