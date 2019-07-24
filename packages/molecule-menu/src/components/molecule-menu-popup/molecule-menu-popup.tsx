import { Component, State, h } from '@stencil/core';

import { MoreIcon } from '../../icons';

import '@ionic/core';
import 'ionicons';

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
            <ion-icon color='dark' src={MoreIcon}></ion-icon>
          </div>
        </div>
        <div hidden={!this.open} class='menu-container'>
          <ion-card class='menu-card'>
            <slot />
          </ion-card>
        </div>
      </div>
    )
  }
}
