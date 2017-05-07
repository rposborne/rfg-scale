import React, { Component } from 'react';
import './App.css';
window.device = null;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      device: null,
      grams: 0
    }

    if (navigator.usb) {
      navigator.usb.getDevices()
        .then((devices) => {
          devices.forEach(device => {
            this.bindDevice(device)
          });
        });

      navigator.usb.addEventListener('connect', e => {
        console.log('device connected', e);
        this.bindDevice(e.device)
      });

      navigator.usb.addEventListener('disconnect', e => {
        console.log('device lost', e);
        e.device.close()
        this.setState({ connected: false, device: null })
      });

      this.connect = () => {
        navigator.usb.requestDevice({ filters: [{ vendorId: 0x0922, productId: 0x8003 }] })
          .then(device => this.bindDevice(device))
          .catch(error => {
            this.setState({ connected: false, device: null })
          });
      }
    }

    this.getWeight = this.getWeight.bind(this);
    this.bindDevice = this.bindDevice.bind(this);
  }

  getWeight() {
    const { device } = this.state;
    let readLoop = () => {
      device.transferIn(2, 8).then(result => {
        let data = new Uint8Array(result.data.buffer)
        let grams = data[4] + (256 * data[5])
        this.setState({ grams: grams })
        readLoop();
      });
    }
    readLoop();
  }

  bindDevice(device) {
    device.open()
      .then(() => {
        console.log(`Connected ${device.productName} ${device.manufacturerName}`);
        this.setState({ connected: true, device: device })

        if (device.configuration === null) {
          return device.selectConfiguration(1);
        }
      })
      .then(() => device.claimInterface(0))
      .catch((err) => {
        console.error('USB Error', err)
      })
  }

  render() {
    const { connected } = this.state
    return (
      <div>
        <h1>
          Scale {connected ? "Online" : "Offline"}
        </h1>
        
        { connected &&
          <button onClick={this.getWeight}>Get Scale Weight</button>
        }
        
        <button onClick={this.connect} >Register Device</button>

        <h2>{this.state.grams}g</h2>
        {!navigator.usb &&
          <p>Please enable chrome::web usb</p>
        }
      </div>
    );
  }
}

export default App;
