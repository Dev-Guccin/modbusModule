#!/usr/bin/env node
const shell = require('shelljs');
 
//shell.cd('~')
//실행중인 task확인하기
var tasklist = shell.exec('pm2 list');
if(tasklist.code == 0 ){
    console.log("접근 성공");
    //pid뽑기
    data = tasklist.stdout.replace(/ /g,"").replace(/│/g,",").split("\n").slice(3,-2)//공백제거,줄바꿈,유의미 열만 출력
    console.log(data)
    //checklist
    modbusCheck = false
    bacnetCheck = false
    dbCheck = false
    // 값이 있는지 체크한다.
    data.forEach(function(line){
      list = line.split(",")
      console.log(list)
      if(list[2] == "modbus")//실행스크립트랑 이름 맞는지 판별
        modbusCheck = true
      else if(list[2] == "bacnet")
        bacnetCheck = true
      else if(list[2] == "db")
        dbCheck = true
    });
    console.log(modbusCheck, bacnetCheck, dbCheck);
    //모든 프로세스 종료시키기
    shell.exec('pm2 delete modbus bacnet db');
    //모든 프로세스 다시 시작
    shell.exec('pm2 start module/modbus.js module/bacnet.js module/db.js');
}