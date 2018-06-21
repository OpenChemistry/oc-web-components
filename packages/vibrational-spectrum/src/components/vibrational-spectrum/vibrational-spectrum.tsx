import { Component, Prop, Event, EventEmitter } from '@stencil/core';

import { IVibrations } from '@openchemistry/types';

import { isNil } from "lodash-es";
import * as d3 from "d3";

@Component({
  tag: 'oc-vibrational-spectrum',
  styleUrl: 'vibrational-spectrum.css',
  shadow: true
})
export class MyComponent {

  @Event() barSelected: EventEmitter;
  
  @Prop() vibrations: IVibrations;

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

    if (isNil(this.vibrations) ||
        isNil(this.vibrations.frequencies) ||
        isNil(this.vibrations.intensities)
    ) {
      return;
    }

    this.svg = d3.select(this.containerElement)
                .append("svg")
                .attr("width",  "100%")
                .attr("height", "100%");
    this.addXAxis(this.svg, this.vibrations.frequencies, 'Frequency (cm\u207B\u00B9)');
    this.addYAxis(this.svg, this.vibrations.intensities, "Intensity");
    this.addBars(this.svg, this.vibrations);
    this.addTheoryLine(this.svg, this.vibrations);
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
      .on('mouseover', function() {
        d3.select(this).classed('hover', true);
      })
      .on('mouseout', function() {
        d3.select(this).classed('hover', false);
      })
      .attr("x", (d) => { return this.xScale(d.frequency) - barWidth / 2; })
      .attr("y", () => { return  this.yScale(0); })
      .transition()
        .attr("y", (d) => { return  this.yScale(d.intensity); })
        .attr("height", (d) => { return this.yScale(0) - this.yScale(d.intensity) ; })
  }

  addTheoryLine(svg: any, vibrations: IVibrations) {
    let xRange = this.xScale.domain();
    let yRange = this.yScale.domain();
    let lineData = this.generateTheoryLine(vibrations, xRange, yRange, 40);
    const line = d3.line()
      .x((d: any) => {return this.xScale(d.x)})
      .y((d: any) => {return this.yScale(d.y)});

    svg.append("path")
      .datum(lineData)
      .attr("d", line)
      .attr('stroke-width', 0)
      .attr('fill', 'none')
      .attr('class', 'line')
      .transition()
        .attr('stroke-width', 2.5)
      
  }

  addExperimentalLine(svg: any, vibrations: IVibrations) {
    console.log(svg, vibrations);
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

  generateTheoryLine (data: IVibrations, frequencyRange, intensityRange, gamma: number) : any[] {
    let freqRange = [ 0.0, 0.0 ];
    let prefactor = 0.5 * gamma / Math.PI;
    let lineFreqData = [];
    let numberOfPoints = 400;
    let increment = (frequencyRange[1] - frequencyRange[0]) / (numberOfPoints - 1);
    let ggSq = (0.5 * gamma) ** 2;
    for (let i = 0; i < numberOfPoints; ++i) {
      let freqIntensity = 0.0;
      let currentFreq = frequencyRange[0] + i * increment;
      for (let j = 0; j < data.intensities.length; ++j) {
        let xx0 = currentFreq - data.frequencies[j];
        freqIntensity += prefactor * data.intensities[j] / (xx0 * xx0 + ggSq);
      }
      if (freqIntensity > freqRange[1]) {
        freqRange[1] = freqIntensity;
      }
      lineFreqData.push({
        'x': currentFreq,
        'y': freqIntensity
      });
    }
    let normalization = intensityRange[1] / freqRange[1];
    for (let i = 0; i < numberOfPoints; ++i) {
      lineFreqData[i].y *= normalization;
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
