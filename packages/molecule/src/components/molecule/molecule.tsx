import { Component, Prop, State, Watch } from '@stencil/core';

import { isNil } from "lodash-es";

import { IChemJson, IDisplayOptions } from '@openchemistry/types';
import { isChemJson, validateChemJson, composeDisplayOptions } from '@openchemistry/utils';

import { Caffeine } from '@openchemistry/sample-data';

import '@openchemistry/molecule-menu';
import '@openchemistry/molecule-vtkjs';
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

  getCjson(): IChemJson {
    if (isNil(this.cjsonData)) {
      this.setCjson();
    }
    // return this.cjsonData;
    return Caffeine;
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

  render() {
    const cjson = this.getCjson();
    const hasVolume = !!cjson && !!cjson.cube;
    const hasSpectrum = !!cjson && !!cjson.vibrations && !!cjson.vibrations.frequencies;

    const nModes = hasSpectrum ? cjson.vibrations.frequencies.length : -1;
    
    const splitN = hasSpectrum ? 2 : 1;
    const splitSizes = hasSpectrum ? "0.4, 0.6" : "1";

    hasVolume;
    nModes;

    return (
      <div class='main-container'>
        <split-me n={splitN} sizes={splitSizes}>
          <oc-molecule-vtkjs
            slot='0'
            cjson={cjson}
            options={this.options}
          />
          {hasSpectrum &&
          <oc-vibrational-spectrum
            slot='1'
            vibrations={cjson.vibrations}
          />
          }
        </split-me>
        {/* { (hasSpectrum || hasVolume) && */}
        <div class='menu-container'>
          <oc-molecule-menu-popup>
            <oc-molecule-menu
              nModes={nModes}
              hasVolume={true}

              // ref={wc(
              //   // Events
              //   {
              //     scaleValueChanged: (e)=>{this.onAmplitude(e.detail);},
              //     isoValueChanged: (e) => {this.onIsoScale(e.detail);},
              //     normalModeChanged: (e) => {this.onModeChange(e.detail);},
              //     playChanged: (e) => {this.onPlayToggled(e.detail);},
              //     opacitiesChanged: (e) => {this.onOpacitiesChanged(e.detail);},
              //     visibilityChanged: (e) => {this.onVisibilityChanged(e.detail);},
              //     colorMapChanged: (e) => {this.onColorMapChanged(e.detail);}
              //   },
              //   // Props
              //   {
              //     nModes: nModes,
              //     iMode: Math.min(animation.modeIdx, nModes - 1),
              //     scaleValue: animation.scale,
              //     play: animation.play,
              //     hasVolume: hasVolume,
              //     isoValue: this.state.isoSurfaces[0].value,
              //     volumeOptions: {
              //       colors: this.state.volume.colors,
              //       opacity: this.state.volume.opacity,
              //       opacityScalarValue: this.state.volume.opacityScalarValue,
              //       range: this.state.volume.range,
              //       histograms: histograms
              //     },
              //     visibilityOptions: this.state.visibility,
              //     colorMaps: ['Red Yellow Blue', 'Viridis', 'Plasma', 'Gray'],
              //     activeMap: this.state.volume.mapName
              //   })
              // }
              ></oc-molecule-menu>
          </oc-molecule-menu-popup>
        </div>
        {/* } */}
      </div>
    )
  }
}
