import { Component, State } from '@stencil/core';

import '@ionic/core';
import 'ionicons';

@Component({
  tag: 'oc-molecule-menu-popup',
  styleUrl: 'molecule-menu-popup.css',
  shadow: true
})
export class MoleculeMenuPopup {

  popoverController: any;
  popover: any;
  menuComponent: any;
  @State() open = false;

  componentDidLoad() {
    // this.presentMenu(true);
  }

  async presentMenu(dismiss = false) {
    
    await this.popoverController.componentOnReady();

    this.popover = await this.popoverController.create({
      component: this.menuComponent,
      translucent: true
    });

    // this.open = true;
    await this.popover.present();
    if (dismiss) {
      await this.popover.dismiss();
    }
    return;

  }

  render() {
    return (
      <div>
        <ion-button fill="clear" onClick={() => {this.presentMenu()}}>
          <ion-icon name='more'></ion-icon>
        </ion-button>
        <ion-popover-controller ref={ref => {this.popoverController = ref;}}>
        </ion-popover-controller>
        <oc-molecule-menu ref={ref => {this.menuComponent = ref;}}/>
      </div>
    )
  }
}