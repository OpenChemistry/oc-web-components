import { Component, Prop, Event, EventEmitter } from '@stencil/core';

// import { isNil } from "lodash-es";
import '@ionic/core';
import 'ionicons';

@Component({
  tag: 'oc-molecule-menu',
  styleUrl: 'molecule-menu.css',
  shadow: true
})
export class MoleculeMenu {

  @Prop() hasVolume: boolean = false;
  @Prop() nModes: number = -1;
  @Prop({ mutable: true }) isoValue: number = 0.01;
  @Prop({ mutable: true }) scaleValue: number = 1.0;
  @Prop({ mutable: true }) iMode: number = -1;
  @Prop({ mutable: true }) play: boolean = true;

  @Event() isoValueChanged: EventEmitter;
  @Event() scaleValueChanged: EventEmitter;
  @Event() normalModeChanged: EventEmitter;
  @Event() playChanged: EventEmitter;

  componentWillLoad() {
    console.log('MoleculeMenu is about to be rendered');
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

  isoValueHandler(val: number) {
    if (!isFinite(val) || val === this.isoValue) {
      return;
    }
    this.isoValue = val;
    this.isoValueChanged.emit(val);
  }

  scaleValueHandler(val: number) {
    if (!isFinite(val) || val === this.scaleValue) {
      return;
    }
    this.scaleValue = val;
    this.scaleValueChanged.emit(val);
  }

  normalModeHandler(valStr: string) {
    let val = parseInt(valStr);
    if (val === this.iMode) {
      return;
    }
    this.iMode =val;
    this.normalModeChanged.emit(val);
  }

  playHandler() {
    this.play = !this.play;
    this.playChanged.emit(this.play);
  }

  render() {
    const normalModeOptions = [];
    normalModeOptions.push(<ion-select-option value={"-1"}>None</ion-select-option>);
    for (let i = 0; i < this.nModes; ++i) {
      normalModeOptions.push(<ion-select-option value={i.toString()}>{i}</ion-select-option>);
    }

    if (!this.hasVolume && this.nModes <= 0) {
      return null;
    }

    return (
      <div>
        {this.hasVolume &&
        <ion-item>
          <ion-label color="primary" position="stacked">Isovalue</ion-label>
          <ion-range
            debounce={150}
            min={0.0005}
            max={0.05}
            step={0.0001}
            value={this.isoValue}
            onIonChange={ (e: CustomEvent)=>{this.isoValueHandler(e.detail.value)}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.isoValue) ? this.isoValue.toFixed(4) : "0.0000"}
              debounce={500}
              onIonChange={(e: CustomEvent)=>{this.isoValueHandler(parseFloat(e.detail.value))}}
            ></ion-input>
          </div>
        </ion-item>
        }
        {this.nModes > 0 &&
        <div>
        <ion-item>
          <ion-label color="primary" position="stacked">Normal Mode</ion-label>
          <ion-select
            style={{width: "100%"}}
            value={this.iMode.toString()}
            onIonChange={(e: CustomEvent)=>{this.normalModeHandler(e.detail.value)}}
          >
            {normalModeOptions}
          </ion-select>
          <div class="end-slot" slot="end">
            <ion-button fill="solid" color="light" shape="round" onClick={() => {this.playHandler()}}>
              <ion-icon icon={this.play ? "pause" : "play"}></ion-icon>
            </ion-button>
          </div>
        </ion-item>
        <ion-item disabled={!this.play || this.iMode < 0}>
          <ion-label color="primary" position="stacked">Animation Scale</ion-label>
          <ion-range
            debounce={150}
            min={0.5}
            max={3}
            step={0.5}
            value={this.scaleValue}
            onIonChange={ (e: CustomEvent)=>{this.scaleValueHandler(e.detail.value)}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.scaleValue) ? this.scaleValue.toFixed(1) : "0.0"}
              debounce={500}
              onIonChange={(e: CustomEvent)=>{this.scaleValueHandler(parseFloat(e.detail.value))}}
            ></ion-input>
          </div>
        </ion-item>
        </div>
        }
      </div>
    )
  }
}
