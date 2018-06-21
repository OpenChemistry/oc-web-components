import { Component, Prop, State } from '@stencil/core';

import { IChemJson } from '@openchemistry/types';
import { IDisplayOptions } from '@openchemistry/types';
import { Caffeine } from '@openchemistry/sample-data';
import { validateChemJson, isChemJson } from '@openchemistry/cjson-utils';


import { isNil } from "lodash-es";

@Component({
  tag: 'oc-molecule',
  styleUrl: 'molecule.css'
})
export class Molecule {

  // The chemical json object in iput
  // Pure string fallback if used outside of JS or frameworks
  @Prop() cjson: IChemJson | string;


  cjsonData: IChemJson;

  @State() options: IDisplayOptions;
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
        scale: 0.2,
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
   console.log('Component is about to be rendered');
  }

  componentDidLoad() {
    console.log('Component has been rendered');
    this.options = {...this.defaultOptions};
  }

  componentWillUpdate() {
    console.log('Component will update and re-render');
  }

  componentDidUpdate() {
    console.log('Component did update');
  }

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload() {
    console.log('Component removed from the DOM');
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

  onBarSelected(event: CustomEvent) {
    if (event.type === "barSelected") {
      let newOptions = {...this.options};
      newOptions.normalMode.modeIdx = event.detail;
      this.options = newOptions;
    }
    console.log(event);
  }

  render() {
    return ( 
      <div style={{width: "100%", heigth: "100%!important", display: "flex", position: "relative"}}>
        <div style={{width: "50%", height: "40rem", position: "relative"}}>
          <oc-molecule-moljs
            cjson={{...Caffeine}}
            options={this.options}
          />
        </div>
        <div style={{width: "50%", height: "40rem", position: "relative"}}>
          <oc-vibrational-spectrum
            onBarSelected={(ev) => this.onBarSelected(ev)} 
          />
        </div>
      </div>
    );
  }
}
