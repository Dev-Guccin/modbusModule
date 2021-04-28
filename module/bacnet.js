
var i = 1
console.log(`This process is pid ${process.pid}`);
console.log(process.argv[2]); // test1
console.log(process.argv[3]); // test2
function sleep(ms) {
    const wakeUpTime = Date.now() + ms
    while (Date.now() < wakeUpTime) {}
  }
while(true){
    sleep(3000)
    console.log(i++);
}