import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'oc-toggle',
  styleUrl: 'toggle.css',
  shadow: true
})
export class OcToggle {

  el: HTMLButtonElement;

  @Prop() value: boolean;
  @Watch('value')
  watchValue(newValue: boolean) {
    if (this.el) {
      if (newValue) {
        this.el.className = "mui-btn mui-btn--small mui-btn--raised mui-btn--primary";
      } else {
        this.el.className = "mui-btn mui-btn--small mui-btn--raised";
      }
    }
  }

  @Prop() disabled: boolean = false;

  @Prop() label: string;

  @Event() ocChange: EventEmitter;

  componentDidLoad() {
    this.watchValue(this.value);
  }

  render() {
    return (
      <div class="container">
        <div class="label-container">
          <label>{this.label}</label>
        </div>
        <div class="toggle-container">
          <button
            ref={el => {this.el = el;}}
            onClick={() => {this.ocChange.emit({value: !this.value})}}
            disabled={this.disabled}
          />
        </div>
      </div>
    )
  }
}
