import { Component, State, h } from '@stencil/core';

import { MoreIcon } from '../../icons';

@Component({
  tag: 'oc-molecule-menu-popup',
  styleUrl: 'molecule-menu-popup.css',
  shadow: true
})
export class MoleculeMenuPopup {

  @State() open = false;
  
  render() {   
    return (
      <div class='main-container'>
        <div class='menu-button-container'>
          <div class='open-menu-button' onClick={() => {this.open = !this.open}}>
            <img class='open-menu-icon' src={MoreIcon}/>
          </div>
        </div>
        <div hidden={!this.open} class='menu-container'>
          <div class='menu-card'>
            <slot />
          </div>
        </div>
      </div>
    )
  }
}
