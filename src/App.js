import React, { Component } from "react";
import "./App.css";
class App extends Component {
  constructor(props) {
    super(props);

    this.USB_FILTERS = [
      { vendorId: 0x0922, productId: 0x8003 },
      { vendorId: 0x0922, productId: 0x8004 }
    ];

    this.UNIT_MODES = { 2: "g", 11: "oz" };
    this.SCALE_STATES = { 2: "±", 4: "+", 5: "-" };

    this.state = {
      connected: false,
      device: null,
      shouldRead: null,
      weight: 0,
      unit: "g",
      scaleState: ''
    };

    if (navigator.usb) {
      navigator.usb.getDevices({ filters: this.USB_FILTERS }).then(devices => {
        devices.forEach(device => {
          this.bindDevice(device);
        });
      });

      navigator.usb.addEventListener("connect", e => {
        console.log("device connected", e);
        this.bindDevice(e.device);
      });

      navigator.usb.addEventListener("disconnect", e => {
        console.log("device lost", e);
        this.setState({ connected: false, device: null });
      });

      this.connect = () => {
        navigator.usb
          .requestDevice({ filters: this.USB_FILTERS })
          .then(device => this.bindDevice(device))
          .catch(error => {
            console.error(error);
            this.setState({ connected: false, device: null });
          });
      };
    }

    this.getWeight = this.getWeight.bind(this);
    this.stopWeight = this.stopWeight.bind(this);
    this.bindDevice = this.bindDevice.bind(this);
  }

  getWeight() {
    this.setState({ shouldRead: true });
    const { device } = this.state;
    const { endpointNumber, packetSize } = device.configuration.interfaces[
      0
    ].alternate.endpoints[0];
    let readLoop = () => {
      device
        .transferIn(endpointNumber, packetSize)
        .then(result => {
          let data = new Uint8Array(result.data.buffer);
          let weight = (data[4] + 256 * data[5]);
          const unitMode = data[2];
          const scaleState = data[1];
          console.log("data", data);

          this.setState({
            weight: weight,
            unit: this.UNIT_MODES[unitMode],
            scaleState: this.SCALE_STATES[scaleState]
          });

          if (this.state.shouldRead) {
            readLoop();
          }
        })
        .catch(err => {
          console.error("USB Read Error", err);
        });
    };
    readLoop();
  }

  stopWeight() {
    this.setState({ shouldRead: false });
  }

  bindDevice(device) {
    device
      .open()
      .then(() => {
        console.log(
          `Connected ${device.productName} ${device.manufacturerName}`,
          device
        );
        this.setState({ connected: true, device: device });

        if (device.configuration === null) {
          return device.selectConfiguration(1);
        }
      })
      .then(() => device.claimInterface(0))
      .catch(err => {
        console.error("USB Error", err);
      });
  }

  render() {
    const { connected, shouldRead, weight, unit, scaleState } = this.state;
    return (
      <main>
        <h1>
          Scale {connected ? "Online" : "Offline"}
        </h1>

        {!navigator.usb &&
          <p>
            Please enable chrome://flags/#enable-experimental-web-platform-features
          </p>}

        {connected &&
          !shouldRead &&
          <button onClick={this.getWeight}>Get Scale Weight</button>}

        {shouldRead && <button onClick={this.stopWeight}>Hold</button>}

        <button onClick={this.connect}>Register Device</button>

        {connected &&
          <span className="scale">
            <small>{scaleState}</small>
            {weight}
            <small>{unit}</small>
          </span>}
      </main>
    );
  }
}

export default App;
