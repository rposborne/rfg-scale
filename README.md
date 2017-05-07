# Dyno Scale

This is a proof of concept to use webusb to acquire scale data from a Dyno M25-US

## Requirements

WebUsb requires some prework before it can be used. 

1. Enable expiermental platform features chrome://flags/#enable-experimental-web-platform-features
2. Must be on localhost or https://

## Things Learned

There are many hoops to jump through before you can stat talking to the usb device in question. Also... macs don't work.

1. Open connection to the device with `device.open()`
2. Set a default configuration.
3. claimInterface
4. speak to the usb device / read from the device with `device.transferOut` and `device.transferIn(endpointNumber, maxBytesPerMessage)`

This behaves like a file and will read the n number of bytes from the pointer.  We solved this with recursing to the end of the buffer.

The DataView / Array buffer that is passed by the promise of transferIn is highly dependent on your device.  For the M25 we use an Uint8Array,  the data is a 6 digit array where indexs 4, 5 are used to calculate the weight of the scale.

Massive thanks to [http://steventsnyder.com/reading-a-dymo-usb-scale-using-python/](http://steventsnyder.com/reading-a-dymo-usb-scale-using-python/) for a push to the right direction on how the data was being sent.