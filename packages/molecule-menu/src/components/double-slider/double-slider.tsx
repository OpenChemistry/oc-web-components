import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'oc-double-slider',
  styleUrl: 'double-slider.css',
  shadow: true
})
export class OcDoubleSlider {

  el0: HTMLInputElement;
  el1: HTMLInputElement;

  @Prop() value: [number, number];
  @Watch('value')
  watchValue(newValue: [number, number]) {
    newValue = newValue || [0, 1];

    if (this.el0) {
      this.el0.valueAsNumber = newValue[0];
    }

    if (this.el1) {
      this.el1.valueAsNumber = newValue[1];
    }
  }

  @Prop() label: string;

  @Prop() min: number;
  @Watch('min')
  watchMin(newValue: number) {
    for (let el of [this.el0, this.el1]) {
      if (el) {
        el.min = newValue as any;
      }
    }
  }

  @Prop() max: number;
  @Watch('max')
  watchMax(newValue: number) {
    for (let el of [this.el0, this.el1]) {
      if (el) {
        el.max = newValue as any;
      }
    }
  }

  @Prop() step: number;
  @Watch('step')
  watchStep(newValue: number) {
    for (let el of [this.el0, this.el1]) {
      if (el) {
        el.step = newValue as any;
      }
    }
  }

  @Prop() disabled: boolean = false;
  @Watch('disabled')
  watchDisabled(newValue: boolean) {
    for (let el of [this.el0, this.el1]) {
      if (el) {
        el.disabled = newValue;
      }
    }
  }

  @Event() ocChange: EventEmitter;

  componentDidLoad() {
    this.watchDisabled(this.disabled);
    this.watchMin(this.min);
    this.watchMax(this.max);
    this.watchStep(this.step);
    this.watchValue(this.value);
  }

  handleChange(slider: 0 | 1, newValue: number) {
    let value = [this.el0.valueAsNumber, this.el1.valueAsNumber];
    switch(slider) {
      case 0: {
        if (newValue > this.el1.valueAsNumber) {
          newValue = this.el1.valueAsNumber
          this.el0.valueAsNumber = newValue;
        }
        break;
      }
      case 1: {
        if (newValue < this.el0.valueAsNumber) {
          newValue = this.el0.valueAsNumber
          this.el1.valueAsNumber = newValue;
        }
        break;
      }
      default: {
        return;
      }
    }

    value[slider] = newValue;
    this.ocChange.emit({value});
  }

  render() {
    return (
      <div class="mui-textfield wrapper">
        <div class="container full-width">
          <div class="start-container">
            <slot name="start"/>
          </div>
          <div class="input-container">
            <div class="slider-container">
              <input
                class="full-width"
                type='range'
                ref={(el) => {this.el0 = el;}}
                onInput={(e: any) => {this.handleChange(0, e.target.valueAsNumber)}}
              />
            
              <input
                class="full-width slider"
                type='range'
                ref={(el) => {this.el1 = el;}}
                onInput={(e: any) => {this.handleChange(1, e.target.valueAsNumber)}}
              />
            </div>
          </div>
          <div class="end-container">
            <slot name="end"/>
          </div>
        </div>
        <label>{this.label}</label>
      </div>
    )
  }
}
