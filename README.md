# DYMO Scale with WebUSB

This is a proof of concept to use "webUSB" to get weight data from a DYMO M25-US

## Requirements

WebUsb requires some setup before it can be used.

1. Enable experimental platform features chrome://flags/#enable-experimental-web-platform-features
2. Must be on localhost or https://

## Lessons

There are many hoops to jump through before you can start talking to the USB device in question.

1. Open connection to the device with `device.open()`
2. Set a default configuration.
3. `device.claimInterface(interfaceNumber)`
4. speak to the usb device / read from the device with `device.transferOut` and `device.transferIn(endpointNumber, maxBytesPerMessage)`

This behaves like a file and will read the N number of bytes from the pointer.  We solved getting the most recent data with recursing to the end of the buffer.

The DataView / Array buffer that passed into the promise of transferIn is highly dependent on your device.  For the DYMO M25 we use an Uint8Array,  the data is a 6 digit array where index 4 and 5 added together calculate the weight on the scale.

`Uint8Array(6) [3, 2, 11, 255, 0, 0]`

| Index | What is it? | Values |
| ------------- | ------------- | ------------- |
| 0 | Scale Battery Level? | 3 | < If you observe this drop note the battery level and open an issue.
| 1 | Scale State | Zeroed (2), Positive (4), Negative(5) |
| 2 | Unit Mode | Grams (2), Ounces (11) |
| 3 | Scale Factor | 0 or 255
| 4 | Raw Weight | 0-255
| 5 | Raw Weight Multiples of 256 |  0-255

## Warning on Macs

In OS X USB devices that use the HID device class are opened by IOUSBHID and can not be used by in any meaningful way without writing a codeless kext or disabling IOUSBHID.

### Disabling HID kext for development
`sudo kextunload -b com.apple.driver.usb.IOUSBHostHIDDevice`
It will disable any external USB keyboard.

`sudo kextload -b com.apple.driver.usb.IOUSBHostHIDDevice`
Will re-enable your external USB keyboard and disable the scale.

another option is to reboot your machine.

Massive thanks to [http://steventsnyder.com/reading-a-dymo-usb-scale-using-python/](http://steventsnyder.com/reading-a-dymo-usb-scale-using-python/) for a push to the right direction on how the data was being sent.
