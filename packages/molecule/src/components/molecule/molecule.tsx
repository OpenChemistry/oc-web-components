import { Component, Prop, Event, EventEmitter } from '@stencil/core';

import { IChemJson } from '@openchemistry/types';
import { isChemJson } from '@openchemistry/cjson-utils';
import { IDisplayOptions } from '@openchemistry/types';

import '@openchemistry/molecule-moljs';
import '@openchemistry/vibrational-spectrum';

import { isNil } from "lodash-es";

@Component({
  tag: 'oc-molecule',
  styleUrl: 'molecule.css'
})
export class Molecule {

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks
  @Prop() cjson: IChemJson | string;
  @Prop() options: IDisplayOptions;

  @Event() barSelected: EventEmitter;


  cjsonData: IChemJson;

  currOptions: IDisplayOptions;

  defaultOptions: IDisplayOptions = {
    isoSurfaces: [
      {
        value: 0.005,
        color: "#ff0000",
        opacity: 0.85
      },
      {
        value: -0.005,
        color: "#0000ff",
        opacity: 0.85
      }
    ],
    style: {
      stick: {
        radius: 0.14,
      },
      sphere: {
        scale: 0.3,
      },
    },
    normalMode: {
      play: true,
      modeIdx: -1,
      framesPerPeriod: 15,
      periodsPerSecond: 1,
      scale: 1
    }
  }

  componentWillLoad() {
    console.log('Molecule is about to be rendered');
    this.cjsonData = this.getCjson();
    this.currOptions = this.composeOptions();
  }

  componentDidLoad() {
    console.log('Molecule has been rendered');
  }

  componentWillUpdate() {
    console.log('Molecule will update and re-render');
    this.cjsonData = this.getCjson();
    this.currOptions = this.composeOptions();
  }

  componentDidUpdate() {
    console.log('Molecule did update');
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
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

  composeOptions() {
    // TODO: add a reusable method to the utils package to compose options by
    // combining defaults and passed options
    return this.options;
  }

  onBarSelected(event: CustomEvent) {
    if (event.type === "barSelected") {
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
              options={this.currOptions}
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
            options={this.currOptions}
          />
        </div>
      )
    }
  }
}
