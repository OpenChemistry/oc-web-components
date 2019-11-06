import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'oc-icon-button',
  styleUrl: 'icon-button.css',
  shadow: true
})
export class OcIconButton {

  el: HTMLButtonElement;

  @Prop() icon: any;

  @Prop() disabled: boolean = false;

  @Event() ocChange: EventEmitter;

  render() {
    return (
      <button
        ref={el => {this.el = el;}}
        class="mui-btn mui-btn--small mui-btn--fab"
        onClick={() => {this.ocChange.emit({})}}
        disabled={this.disabled}
      >
        {
          this.icon &&
          <img class="oc-icon" src={this.icon}/>
        }
      </button>
    )
  }
}
