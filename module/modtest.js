const DBH = require('./database.js')
const Modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket()
const client = new Modbus.client.TCP(socket)
//TCP설정
var options = {
    'host': '192.168.219.102',
    'port': 502
}
socket.connect(options);
// use socket.on('open', ...) when using serialport 
// use socket.on("connect",...) when using tcp
socket.on("connect", function () {
    for (let i = 0; i < 10; i++) {
        console.log(i)
        client.readHoldingRegisters(0, 10).then(function (resp) {
            console.log(resp.response._body);
            socket.end();
        }).catch(function () {
            console.error(
                require("util").inspect(arguments, {
                    depth: null
                })
            );
            socket.end();
        });
    }
    
});
socket.on("error", console.error);
//ocket.destroy()