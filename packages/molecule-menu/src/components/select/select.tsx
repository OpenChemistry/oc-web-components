import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  tag: 'oc-select',
  styleUrl: 'select.css',
  shadow: true
})
export class OcSelect {

  @Prop() value: string;
  el: HTMLSelectElement;
  @Watch('value')
  watchValue(newValue: string) {
    if (this.el) {
      this.el.value = newValue;
    }
  }

  @Prop() label: string;

  @Prop() options: SelectOption[] = [];

  @Event() ocChange: EventEmitter;

  componentDidLoad() {
    this.watchValue(this.value);
  }
  
  render() {
    return (
      <div class="mui-textfield">
        <div class="container full-width">
          <div class="start-container">
          <slot name="start"/>
          </div>
          <div class="input-container mui-select">
            <select ref={(el) => {this.el = el}}
              onChange={(e: any) => {this.ocChange.emit({value: e.target.value})}}
            >
              {
                this.options.map(({value, label}) => (
                  <option value={value} key={value}>{label}</option>
                ))
              }
            </select>
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
