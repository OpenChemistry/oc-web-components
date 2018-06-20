import { Component, Prop, Event, EventEmitter } from '@stencil/core';

import { IVibrations } from '@openchemistry/types';
import { Caffeine } from '@openchemistry/sample-data';

import * as d3 from "d3";
// import { scaleLinear } from 'd3';

@Component({
  tag: 'oc-vibrational-spectrum',
  styleUrl: 'vibrational-spectrum.css',
  shadow: true
})
export class MyComponent {

  @Event() barSelected: EventEmitter;
  
  @Prop() vibrations_: IVibrations;
  vibrations: IVibrations = Caffeine.vibrations;
  // vibrations: IVibrations = {
  //   frequencies: [10, 20, 40, 80],
  //   intensities: [5, 30, 15, 20],
  //   modes: [1, 2, 3, 4]
  // }

  xScale: d3.ScaleLinear<any, any>;
  yScale: d3.ScaleLinear<any, any>;
  xAxis: any ;
  yAxis: any;
  xLabel: any;
  yLabel: any;
  containerElement: any;
  svg: any;

  selectedBar: number = -1;

  width: number;
  height: number;
  margin = {top: 20, right: 20, bottom: 50, left: 50, };

  renderQueue = 0;


  componentWillLoad() {
    console.log('Component is about to be rendered');
  }

  componentDidLoad() {
    console.log('Component has been rendered');
    this.renderChart();
    window.addEventListener('resize', this.asyncRenderChart.bind(this));
  }

  setupChart() {

  }

  asyncRenderChart() {
    this.renderQueue += 1;
    let myQueue = this.renderQueue;
    setTimeout(()=>{
      if (myQueue >= this.renderQueue) {
        this.renderChart();
      }
    }, 50);


  }

  renderChart() {
    if (this.svg) {
      this.svg.remove();
    }

    this.svg = d3.select(this.containerElement)
                .append("svg")
                .attr("width",  "100%")
                .attr("height", "100%");
    this.addXAxis(this.svg, this.vibrations.frequencies, 'Frequency (cm\u207B\u00B9)');
    this.addYAxis(this.svg, this.vibrations.intensities, "Intensity");
    this.addBars(this.svg, this.vibrations);
  }

  onResize() {
    console.log("Resize!");
  }

  addXAxis(svg: any, x: number[], label: string) {
    let delta = d3.max(x) - d3.min(x);
    let bottom = Math.max(0, d3.min(x) - delta * 0.05);
    let top = d3.max(x) + delta * 0.05;
    let range = [bottom, top];
    let w = parseInt(svg.style("width"), 10);
    let h = parseInt(svg.style("height"), 10);
    let scale = d3.scaleLinear()
      .domain(range)
      .range([this.margin.left, w - this.margin.right]);
    let axis = d3.axisBottom(scale)
      .tickFormat(d3.format('.0f'));
    svg.append('g')
      .attr('transform', 'translate(0, ' + (h - this.margin.bottom) + ')')
      .classed('x axis', true)
      .call(axis);
    // text label for the x axis
    svg.append("text")            
      .attr("transform",
            "translate(" + (w/2) + " ," + 
                          (h - this.margin.bottom / 4) + ")")
      .style("text-anchor", "middle")
      .text(label);
    this.xScale = scale;
    this.xAxis = axis;
    this.xLabel = label;
  }

  addYAxis(svg: any, y: number[], label: string) {
    let range = [0, d3.max(y)];
    // let w = parseInt(svg.style("width"), 10);
    let h = parseInt(svg.style("height"), 10);
    let scale = d3.scaleLinear()
      .domain(range)
      .range([h - this.margin.bottom, this.margin.top]);
    let axis = d3.axisLeft(scale)
      .tickFormat(d3.format('.2f'));
    svg.append('g')
      .attr('transform', 'translate(' + (this.margin.left) + ', 0)')
      .classed('y axis', true)
      .call(axis);
    // text label for the y axis
    svg.append("text")
      .attr("transform", "translate(" + this.margin.left / 4 + ", " + h / 2 + ") rotate(-90)")
      .style("text-anchor", "middle")
      .text(label);   
    this.yScale = scale;
    this.yAxis = axis;
    this.yLabel = label;
  }

  addBars(svg: any, vibrations: IVibrations) {
    let data = [];

    for(let i = 0; i < vibrations.intensities.length; i++) {
      data.push({
        'index': i,
        'frequency': vibrations.frequencies[i],
        'intensity': vibrations.intensities[i],
        'mode': vibrations.modes[i]
      });
    }

    var t = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);
  
    let w = parseInt(svg.style("width"), 10);
    let barWidth = Math.min(7, w / 100);
    svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("id", (d) => { return "bar" + d.index;})
      .attr("class", "bar")
      .attr("width", barWidth)
      .on('click', (d) => {
        this.barSelectedHandler(d.index, svg);
      })
      .attr("x", (d) => { return this.xScale(d.frequency) - barWidth / 2; })
      .attr("y", () => { return  this.yScale(0); })
      .transition(t)
        .attr("y", (d) => { return  this.yScale(d.intensity); })
        .attr("height", (d) => { return this.yScale(0) - this.yScale(d.intensity) ; })
  }

  barSelectedHandler(index: number, svg: any) {
    // TODO The must be a better way todo this selec
    const bars = svg.selectAll('.bar');
    bars.classed('selected', false);
    let thisBar = svg.select("#bar" + index);

    if (this.selectedBar == index) {
      this.selectedBar = -1;
    } else {
      thisBar.classed('selected', true);
      thisBar.classed('hover', true);
      this.selectedBar = index;
    }
    this.barSelected.emit(this.selectedBar);
  }

  componentWillUpdate() {
    console.log('Component will update and re-render');
  }

  componentDidUpdate() {
    console.log('Component did update');

  }

  componentDidUnload() {
    console.log('Component removed from the DOM');

  }

  generateLine (data, frequencyRange, intensityRange, gamma) {
    var freqRange = [ 0.0, 0.0 ];
    var prefactor = gamma / 3.14;
    var lineFreqData = [];
    var numberOfPoints = 400;
    let increment = (frequencyRange[1] - frequencyRange[0]) / (numberOfPoints - 1);
    for (let i = 0; i < numberOfPoints; ++i) {
      let freqIntensity = 0.0;
      let currentFreq = frequencyRange[0] + i * increment;
      for (let j = 0; j < data.intensities.length; ++j) {
        let xx0 = currentFreq - data.frequencies[j];
        freqIntensity += prefactor * data.intensities[j] / (xx0*xx0 + gamma*gamma);
      }
      if (freqIntensity > freqRange[1]) {
        freqRange[1] = freqIntensity;
      }
      lineFreqData.push([
        currentFreq,
        freqIntensity
      ]);
    }
    let normalization = intensityRange[1] / freqRange[1];
    for (let i = 0; i < numberOfPoints; ++i) {
      lineFreqData[i][1] *= normalization;
    }

    return lineFreqData;
  }


  render() {
    return (
      <div ref={(ref)=>{this.containerElement=ref;}} style={{width:'100%', height:'100%'}}>
      </div>
    );
  }
}
