const DBH = require('./database.js')
const Modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket() // 이놈을 여러개로 만들어야 하지 않나?
const client = new Modbus.client.TCP(socket)

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
  //통신해본다.
  for (let i = 0; i < Devices.length; i++) {
    //tcp설정
    var options = {
      'host': Devices[i].IpAddress,
      'port': Devices[i].Port
    }
    console.log(options)
    socket.connect(options)
    socket.on("connect", function () {//connect tcp
      var targetFrames = Frames[Devices[i].ChannelName]
      console.log(targetFrames);
      for (let fi = 0; fi < targetFrames.length; fi++) {
        console.log(targetFrames[fi]);
        if (Frames[i].FunctionCode == 3) {
          client.readHoldingRegisters(targetFrames[fi].StartAddress, targetFrames[fi].ReadByte)
            .then(function (resp) {
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
      }
      socket.on('end',function(){
        console.log("연결 제거")
      })
    });
    socket.on("error", ()=>{console.log(options, "이거 문제네")});
  }
}
