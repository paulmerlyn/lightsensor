/* Express web server that reads data from its serial port and streams data via Server-Sent Events */
'use strict';

// Import installed remote modules
const express = require('express');
const serialport = require('serialport');
const Readline = require('@serialport/parser-delimiter'); // scoped package

// Import a local module
const sse = require('./sse');

// Set up the express server software and middleware
const app = express();
app.use(express.static(__dirname + '/public'));
app.use(sse);

// Declare/initialize variables
const serverPort = 3000;
let reading = 0; // initialize light reading level

// Retrieve format from CLI argument
let format = process.argv[2];
format = (format == undefined ? 'string' : format);
format = format.toLowerCase();

// Instantiate a serial port object, associating the port name with a properties object and error handler
const port = new serialport('/dev/ttyACM0', {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    },
    err => {
    if (err) {
        return console.log('Error instantiating serialport object: ', err.message);
    }
});

// Instantiate parser, a transformer that emits data received by the port after each newline.
const parser = port.pipe(new Readline({delimiter: '\r\n'})); // like port, parser is also an event emitter

// Declare route handlers i.e. map route to a callback
app.listen(serverPort, () => {
    console.log(`Express server listening on port ${serverPort}`);
})

app.get('/', (request, response) => {
    response.sendfile('./public/lightchart.html');
})

app.get('/stream', function(request, response) {
    response.sseSetup();

    // ... and define a handler for a data event
    parser.on('data', input => {
        if (format == 'string') {
            console.log(input.toString('utf8')); // log the data value of the Buffer object as a string
        } else if (format == 'json') {
            console.log(JSON.stringify(input)); // log the Buffer object received by the serial port
        }
        console.log(input);
        console.log(typeof input);
        reading = parseInt(input.toString('utf8'), 10);
        response.sseSend(reading);
    })

    port.on('close', () => {
        console.log('Serial port has disconnected');
        response.sseSend({data: 0});
    })
})