'use strict';
const serialport = require('serialport');
const port = new serialport('/dev/ttyACM0', {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    },
    err => {
    if (err) {
        return console.log('Error: ', err.message);
    }
});
const Readline = require('@serialport/parser-delimiter');

const parser = port.pipe(new Readline({delimiter: '\r\n'}));

let format = process.argv[2];

format = (format == undefined ? 'string' : format);
format = format.toLowerCase();

parser.on('data', input => {
    if (format == 'string') {
        console.log(input.toString('utf8'));
    } else if (format == 'json') {
        console.log(JSON.stringify(input));
    }
})
