import { Component, Prop, Event, EventEmitter, Watch, h } from '@stencil/core';

import { isNil } from "lodash-es";
import * as d3 from "d3";
import { IEnergy } from '../../interfaces';

@Component({
  tag: 'oc-energy-plot',
  styleUrl: 'energy-plot.css',
  shadow: true
})
export class EnergyPlot {

  @Event() pointSelected: EventEmitter;
  
  @Prop() energies: IEnergy[];
  @Watch('energies') energiesHandler() {
    this.energiesHasChanged = true;
  }

  xScale: d3.ScaleLinear<any, any>;
  yScale: d3.ScaleLinear<any, any>;
  xAxis: any ;
  yAxis: any;
  xLabel: any;
  yLabel: any;
  containerElement: any;
  svg: any;
  tooltip: any;

  energiesHasChanged: boolean = false;

  margin = {top: 20, right: 20, bottom: 50, left: 50, };

  renderQueue = 0;

  componentDidLoad() {
    this.tooltip = d3.select(this.containerElement).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
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
    }, 100);
  }

  renderChart() {
    if (this.svg) {
      this.svg.remove();
    }

    if (isNil(this.energies) ||
        this.energies.length <= 0
    ) {
      return;
    }

    this.svg = d3.select(this.containerElement)
                .append("svg")
                .attr("width",  "100%")
                .attr("height", "100%");
    this.addXAxis(this.svg, this.energies.length, "");
    this.addYAxis(this.svg, this.energies, "Free energy (kcal/mol)");
    this.addLine(this.svg, this.energies);
    this.addPoints(this.svg, this.energies);
  }

  addXAxis(svg: any, n: number, label: string) {
    let range = [0 - 0.25, n - 1 + 0.25];
    let w = parseInt(svg.style("width"), 10);
    let h = parseInt(svg.style("height"), 10);
    let scale = d3.scaleLinear()
      .domain(range)
      .range([this.margin.left, w - this.margin.right]);
    let emptyLabels: string[] = [];
    for (let i = 0; i < n; ++i) {
      emptyLabels.push("");
    }
    let axis = d3.axisBottom(scale)
      .ticks(n)
      .tickFormat(d3.format(""));
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

  addYAxis(svg: any, energies: IEnergy[], label: string) {
    let y: number[] = [];
    for (let energy of energies) {
      y.push(energy.energy);
    }
    let yMin: number = d3.min(y);
    let yMax: number = d3.max(y);
    let delta = yMax - yMin;
    let range = [yMin - 0.05 * delta, yMax + 0.05 * delta];
    // let w = parseInt(svg.style("width"), 10);
    let h = parseInt(svg.style("height"), 10);
    let scale = d3.scaleLinear()
      .domain(range)
      .range([h - this.margin.bottom, this.margin.top]);
    let axis = d3.axisLeft(scale)
      .tickFormat(d3.format('i'));
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

  addPoints(svg: any, energies: IEnergy[]) {
    let data = [];

    for(let i = 0; i < energies.length; i++) {
      data.push({
        'index': i,
        'label': energies[i].label,
        'energy': energies[i].energy
      });
    }

    svg.selectAll(".point")
    .data(data)
    .enter().append("circle")
      .attr("id", (d) => { return "point" + d.index;})
      .attr("r", () => {return 5})
      .attr("cx", (d) => { return this.xScale(d.index) })
      .attr("cy", (d) => { return  this.yScale(d.energy); })
      .attr("class", "point")
      .on('click', (d) => {
        this.pointSelected.emit(d.index);
      })
      .on('mouseover', (d) => {
        let thisPoint = this.svg.select("#point" + d.index);
        thisPoint.classed('hover', true);        

        this.tooltip
          .transition()
            .style("opacity", .9);
        
        this.tooltip
          .html(`${d.label}<br>${d.energy.toFixed(2)} kcal/mol`)
          .style("left", this.xScale(d.index) + "px")
          .style("top", this.yScale(d.energy) + "px");
      })
      .on('mouseout', (d) => {
        let thisPoint = this.svg.select("#point" + d.index);
        thisPoint.classed('hover', false);

        this.tooltip
          .transition()
            .style("opacity", 0);
      });
  }

  addLine(svg: any, energies: IEnergy[]) {
    let data = [];

    for(let i = 0; i < energies.length; i++) {
      data.push({
        'index': i,
        'label': energies[i].label,
        'energy': energies[i].energy
      });
    }

    const line = d3.line()
      .x((d: any) => {return this.xScale(d.index)})
      .y((d: any) => {return this.yScale(d.energy)});

    svg.append("path")
      .datum(data)
      .attr("d", line)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('class', 'line');
  }

  componentDidUpdate() {
    if (this.energiesHasChanged) {
      this.renderChart();
      this.energiesHasChanged = false;
    }    
  }

  render() {
    return (
      <div ref={(ref)=>{this.containerElement=ref;}} style={{width:'100%', height:'100%'}}>
      </div>
    );
  }
}
