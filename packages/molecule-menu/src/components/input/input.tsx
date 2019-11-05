import { Component, Prop, Watch, Event, EventEmitter, h } from '@stencil/core';

function debounce(func, wait) {
  let timeout : any;
  let lastValue: string;
  return (e) => {
    lastValue = e.target.value;
    clearTimeout(timeout)
    timeout = setTimeout(() => func(lastValue), wait)
  }
}

@Component({
  tag: 'oc-input',
  styleUrl: 'input.css',
  shadow: true
})
export class OcInput {

  el: HTMLInputElement;

  onInputChange: (e: any) => void;

  @Prop() value: string;
  @Watch('value')
  watchValue(newValue: string, oldValue: string) {
    if (this.el && newValue !== oldValue) {
      this.el.value = newValue;
    }
  }

  @Prop() debounce: number = 0;
  @Watch('debounce')
  watchDebounce(newValue: number) {
    this.onInputChange = debounce(this.handleInputChange, newValue);
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
    this.handleInputChange = this.handleInputChange.bind(this);
    this.watchDebounce(this.debounce)
  }

  componentDidLoad() {
    this.watchDisabled(this.disabled);
    this.watchValue(this.value, undefined);
  }

  handleInputChange(newValue: any)  {
    this.ocChange.emit({value: newValue})
  }

  render() {
    return (
      <div class="mui-textfield">
        <input
          class="full-width"
          ref={(el) => {this.el = el;}}
          onInput={this.onInputChange}
        />
      </div>
    )
  }
}
