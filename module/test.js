const modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket()
const options = {
    'host': '127.0.0.1',
    'port': '502'
}
const client = new modbus.client.TCP(socket)

socket.on('connect', function () {// connect 이벤트 설정
        setInterval(function () {
            client.readHoldingRegisters(0, 2)
              .then(function (resp) {
                console.log(resp.response._body.valuesAsArray)
              }).catch(function () {
                console.error(arguments)
                socket.end()
              })
          }, 200)
        /*client.readHoldingRegisters(0, 10)
            .then(function (resp) {
                console.log(resp.response._body.valuesAsArray)
                socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    }*/
})

socket.on('error', console.error)
socket.connect(options) //주어진 소켓에서 연결을 시작한다//이거 비동기식, 연결되면 'connect'이벤트 발생