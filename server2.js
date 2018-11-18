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

// Convert streamed data at serial port to a stream of newline-delimitted events ...
const parser = port.pipe(new Readline({delimiter: '\r\n'})); // parser is an event emitter object

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
            console.log(input.toString('utf8'));
        } else if (format == 'json') {
            console.log(JSON.stringify(input));
        }
        console.log(input);
        console.log(typeof input);
        reading = parseInt(input.toString('utf8'), 10);
        response.sseSend(reading);
    })

})