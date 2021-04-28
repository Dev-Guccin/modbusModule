const DBH = require('./database.js')
const Modbus = require('jsmodbus')
const net = require('net')
const sockets = []
const clients = []

var Devices = []
var Frames = {}
function Device() {
    ChannelName = ""
    ComType = ""
    IpAddress = ""
    Port = 0
    Period = 0
    WatiTime = 0
    Active = 0
}
function Frame() {
    ChannelName = ""
    FrameName = ""
    FunctionCode = 0
    DeviceAddress = 0
    StartAddress = 0
    ReadByte = 0
    Active = 0
}
//DB에서 파일을 긁어온다.
DBH.device_select("devices", function (rows) {
    rows.forEach(row => {
        tmp = new Device();
        tmp.ChannelName = row["ChannelName"]
        tmp.ComType = row["ComType"]
        tmp.IpAddress = row["IpAddress"]
        tmp.Port = row["Port"]
        tmp.Period = row["Period"]
        tmp.Active = row["Active"]
        Devices.push(tmp)//리스트에 패킷데이터를 저장한다.
        Frames[tmp.ChannelName] = [] //ChannelName을 key값으로 리스트를 생성해준다. 리스트에는 frames들이 들어갈계획
    })
    //Frame데이터를 DB에서 빼내온다.
    DBH.device_select("frames", function (rows) {
        rows.forEach(row => {
            tmp = new Frame();
            tmp.ChannelName = row["ChannelName"]
            tmp.FrameName = row["FrameName"]
            tmp.FunctionCode = row["FunctionCode"]
            tmp.DeviceAddress = row["DeviceAddress"]
            tmp.ReadByte = row["ReadByte"]
            tmp.Active = row["Active"]
            Frames[tmp.ChannelName].push(tmp)//channelname에 맞게 리스트에 차례로 삽입한다. 나중에 패킷 보낼때 사용함.
        })
    })
    console.log("start 통신", Devices.length)
    modbusStart()
})
function modbusStart() {
    for (let i = 0; i < Devices.length; i++) { // 소켓을 설정하고 열어준다.
        sockets[i] = new net.Socket() //socket을 객체로 다루기 위해 설정해준다.
        clients[i] = new Modbus.client.TCP(sockets[i]) // tcp를 열어준다.

        //tcp설정
        var options = {
          'host': Devices[i].IpAddress,
          'port': Devices[i].Port
        }
        sockets[i].on("connect", function () {//소켓이 연결되는 경우 어떻게 사용할 건지
            console.log("connected", Devices[i])
            var targetFrames = Frames[Devices[i].ChannelName]
            for (let fi = 0; fi < targetFrames.length; fi++) {
                if (targetFrames[fi].FunctionCode == 3) {
                    setInterval(function () {
                        clients[i].readHoldingRegisters(targetFrames[fi].StartAddress, targetFrames[fi].ReadByte)
                          .then(function (resp) {
                            console.log(resp.response._body.valuesAsArray)
                            //이제 여기서 데이터를 정규화 하는 작업 해야함
                            
                          }).catch(function () {
                            console.error(arguments)
                            sockets[i].end()
                          })
                      }, 2000)
                }
            }

        });     
        sockets[i].on("error", function () {//에러가 발생하면 어떻게 할건지
            console.log("errored", Devices[i])
        });     
        sockets[i].connect(options)// 실제로 포트를 열어준다.
    }

}
