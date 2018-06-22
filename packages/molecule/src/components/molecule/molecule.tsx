import { Component, Prop, Watch, Event, EventEmitter } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson } from '@openchemistry/types';
import { isChemJson } from '@openchemistry/utils';
import { composeDisplayOptions } from '@openchemistry/utils';
import { IDisplayOptions } from '@openchemistry/types';

import '@openchemistry/molecule-moljs';
import '@openchemistry/vibrational-spectrum';

@Component({
  tag: 'oc-molecule',
  styleUrl: 'molecule.css'
})
export class Molecule {

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks
  @Prop() cjson: IChemJson | string;

  @Prop() options: IDisplayOptions;
  @Watch('options') optionsHandler(newValue: IDisplayOptions) {
    this.optionsData = composeDisplayOptions(newValue);
  }

  @Event() barSelected: EventEmitter;


  cjsonData: IChemJson;

  optionsData: IDisplayOptions;

  componentWillLoad() {
    console.log('Molecule is about to be rendered');
    this.cjsonData = this.getCjson();
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

  getCjson() : IChemJson {
    if (isNil(this.cjson)) {
      return null;
    }
    if (isChemJson(this.cjson)) {
      return this.cjson as IChemJson;
    } else {
      return JSON.parse(this.cjson);
    }
  }

  onBarSelected(event: CustomEvent) {
    if (event.type === "barSelected") {
      // This is a "dumb" component, re-emit the event
      this.barSelected.emit(event.detail);
    }
  }

  render() {
    if (this.cjsonData && this.cjsonData.vibrations) {
      return (
        <div style={{width: "100%", heigth: "100%", display: "flex", position: "relative"}}>
          <div style={{width: "50%", height: "40rem", position: "relative"}}>
            <oc-molecule-moljs
              cjson={this.cjsonData}
              options={this.optionsData}
            />
          </div>
          <div style={{width: "50%", height: "40rem", position: "relative"}}>
            <oc-vibrational-spectrum
              vibrations={this.cjsonData.vibrations}
              onBarSelected={(ev) => this.onBarSelected(ev)}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div style={{width: "100%", heigth: "100%", display: "flex", position: "relative"}}>         
          <oc-molecule-moljs
            cjson={this.cjsonData}
            options={this.optionsData}
          />
        </div>
      )
    }
  }
}
