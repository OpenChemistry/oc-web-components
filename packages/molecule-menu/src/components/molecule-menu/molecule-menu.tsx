import { Component, State, Event, EventEmitter } from '@stencil/core';

// import { isNil } from "lodash-es";
import '@ionic/core';
import 'ionicons';

@Component({
  tag: 'oc-molecule-menu',
  styleUrl: 'molecule-menu.css'
})
export class MoleculeMenu {

  @State() isoValue: number = 0.01;
  @State() openMenu: boolean = true;
  @Event() isoValueChanged: EventEmitter;

  componentWillLoad() {
    console.log('MoleculeMenu is about to be rendered');
  }

  componentDidLoad() {
    console.log('MoleculeMenu has been rendered');
  }

  componentWillUpdate() {
    console.log('MoleculeMenu will update and re-render');
  }

  componentDidUpdate() {
    console.log('MoleculeMenu did update');
  }

  componentDidUnload() {
    console.log('MoleculeMenu removed from the DOM');
  }

  isoValueHandler(val: number) {
    this.isoValue = val;
    this.isoValueChanged.emit(val);
  }

  render() {
    return (
      <div style={{paddingBottom: "1rem"}}>
        <ion-card>
        {this.openMenu &&
        <ion-card-content>
            <ion-item>
              <ion-label color="primary" position="stacked">Isovalue: {this.isoValue.toFixed(4)}</ion-label>
              <ion-range
                debounce={150}
                min={0}
                max={1}
                step={0.01}
                value={this.isoValue}
                onIonChange={ (e: CustomEvent)=>{this.isoValueHandler(e.detail.value)}}
              />
            </ion-item>
          </ion-card-content>
        }
        </ion-card>
        {/* <ion-fab
          edge={true}
          vertical="bottom"
          horizontal="center"
        >
          <ion-fab-button
            style={{zIndex: "99"}}
            color="secondary"
            // onClick={() => {this.openMenu = !this.openMenu;}}
          >
          +
          </ion-fab-button>
        </ion-fab> */}
      </div>
    )
  }
}
