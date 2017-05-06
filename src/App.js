import React, { Component } from 'react';
import './App.css';
window.device = null;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      device: null
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

      navigator.usb.addEventListener('disconnect', device => {
        console.log('device lost', device);
        this.setState({ connected: false, device: null })
      });

      this.connect = () => {
        navigator.usb.requestDevice({ filters: [{ vendorId: 0x0922, productId: 0x8003 }] })
          .then(device => this.bindDevice(device))
          .catch(error => { this.setState({ connected: false, device: null }) });
      }

      this.getWeight = () => {
        const { device } = this.state;

        device.open((a, b, c) => {
          console.log('a,b,c', a, b, c);
        })
      }
    }

    this.bindDevice.bind(this);
  }

  bindDevice(device) {
    console.log(device.productName);
    console.log(device.manufacturerName);
    console.log('device', device);
    window.device = device;
    device.open()
      .then(() => {
        console.log('opened', device);
        this.setState({ connected: true, device: device })

        if (device.configuration === null) {
          return device.selectConfiguration(1);
        }
      })
      .then(() => device.claimInterface(0))
      .then(() => device.controlTransferOut({
        'requestType': 'class',
        'recipient': 'interface',
        'request': 0x22,
        'value': 0x01,
        'index': 0x02
      }))
      .catch((e) => {
        console.log('e', e)
      })
  }

  render() {
    return (
      <div className="App">
        <h2 onClick={this.connect} >Register Device</h2>

        <p>
          Scale {this.state.connected ? "Online" : "Offline"}
        </p>

        <a onClick={this.getWeight}>Get Scale Weight</a>

        <pre><code>{JSON.stringify(this.state.device, null, 4)}</code></pre>
        {!navigator.usb &&
          <p>Please enable chrome::web usb</p>
        }
      </div>
    );
  }
}

export default App;
