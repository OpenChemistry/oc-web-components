import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'oc-slider',
  styleUrl: 'slider.css',
  shadow: true
})
export class OcSlider {

  el: HTMLInputElement;

  @Prop() value: number;
  @Watch('value')
  watchValue(newValue: number) {
    if (this.el) {
      this.el.valueAsNumber = newValue;
    }
  }

  @Prop() label: string;

  @Prop() min: number;
  @Watch('min')
  watchMin(newValue: number) {
    if (this.el) {
      this.el.min = newValue as any;
    }
  }

  @Prop() max: number;
  @Watch('max')
  watchMax(newValue: number) {
    if (this.el) {
      this.el.max = newValue as any;
    }
  }

  @Prop() step: number;
  @Watch('step')
  watchStep(newValue: number) {
    if (this.el) {
      this.el.step = newValue as any;
    }
  }

  @Prop() disabled: boolean = false;
  @Watch('disabled')
  watchDisabled(newValue: boolean) {
    if (this.el) {
      this.el.disabled = newValue;
    }
  }

  @Event() ocChange: EventEmitter;

  componentWillLoad() {
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidLoad() {
    this.watchDisabled(this.disabled);
    this.watchMin(this.min);
    this.watchMax(this.max);
    this.watchStep(this.step);
    this.watchValue(this.value);
  }

  handleChange(e: any) {
    if (e.target.valueAsNumber === this.value) {
      return;
    }

    this.ocChange.emit({value: e.target.valueAsNumber})
  }

  render() {
    return (
      <div class="mui-textfield wrapper">
        <div class="container full-width">
          <div class="start-container">
          <slot name="start"/>
          </div>
          <div class="input-container">
            <input
              class="full-width"
              type='range'
              ref={(el) => {this.el = el;}}
              onInput={this.handleChange}
            />
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
