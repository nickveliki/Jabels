const fetchData = require("./fetchData");
fetchData.setup("../otherTest");
const baseObj1 = {indexKey: "test1", path: "test1"};
const baseObj2 = {indexKey: "test2", path:"test2"};
const baseObj3 = {indexKey: "test3", path: "test3"};
const wrtdef = [];
while(wrtdef.length<100000){
    wrtdef.push(fetchData.updateObject(baseObj1, {test1: Math.round(Math.random()*100)}));
    wrtdef.push(fetchData.updateObject(baseObj2, {test2: Math.round(Math.random()*1000)}));
    wrtdef.push(fetchData.updateObject(baseObj3, {test3: Math.round(Math.random()*10000)}));
}
const starttime = new Date()-0;
fetchData.writeDefinition(wrtdef).then((ful)=>{console.log(ful, new Date()-starttime), process.exit(0)}, (nfl)=>{console.log(nfl), process.exit(1)});
/*const starttime2 = new Date()-0;
fetchData.writeDefinition(wrtdef[0]).catch().then(()=>fetchData.writeDefinition(wrtdef[1])).catch().then(()=>fetchData.writeDefinition(wrtdef[2])).catch().then(()=>fetchData.writeDefinition(wrtdef[3])).catch().then(()=>fetchData.writeDefinition(wrtdef[4])).catch().then(()=>fetchData.writeDefinition(wrtdef[5])).catch().then(()=>fetchData.writeDefinition(wrtdef[6])).catch().then(()=>fetchData.writeDefinition(wrtdef[7])).catch().then(()=>fetchData.writeDefinition(wrtdef[8])).catch().then(()=>{fetchData.writeDefinition(wrtdef[9]).then(console.log(new Date()-starttime2)).catch()}).catch();*/