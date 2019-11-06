import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'oc-toggle',
  styleUrl: 'toggle.css',
  shadow: true
})
export class OcToggle {

  el: HTMLInputElement;

  @Prop() value: boolean;
  @Watch('value')
  watchValue(newValue: boolean) {
    if (this.el) {
      this.el.checked = newValue;
    }
  }

  @Prop() disabled: boolean = false;
  @Watch('disabled')
  watchDisabled(newValue: boolean) {
    if (this.el) {
      this.el.disabled = newValue;
    }
  }

  @Prop() label: string;

  @Event() ocChange: EventEmitter;

  componentDidLoad() {
    this.watchDisabled(this.disabled);
    this.watchValue(this.value);
  }

  render() {
    return (
      <div class="container">
        <div class="label-container">
          <label>{this.label}</label>
        </div>
        <div class="toggle-container">
          <input
            type="checkbox"
            ref={el => {this.el = el;}}
            onChange={() => {this.ocChange.emit({value: !this.value})}}
          />
        </div>
      </div>
    )
  }
}
