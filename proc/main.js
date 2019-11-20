const fetchData = require("./fetchData");
fetchData.setup("../otherTest");
const baseobj = {indexKey: "test", path: "test"};
const wrtdef = [];
while(wrtdef.length<1000){
    wrtdef.push(fetchData.updateObject(baseobj, {test: Math.round(Math.random()*100)}));
}
const starttime = new Date()-0;
fetchData.writeDefinition(wrtdef).then((ful)=>{console.log(ful, new Date()-starttime)}, (nfl)=>{console.log(nfl)});
/*const starttime2 = new Date()-0;
fetchData.writeDefinition(wrtdef[0]).catch().then(()=>fetchData.writeDefinition(wrtdef[1])).catch().then(()=>fetchData.writeDefinition(wrtdef[2])).catch().then(()=>fetchData.writeDefinition(wrtdef[3])).catch().then(()=>fetchData.writeDefinition(wrtdef[4])).catch().then(()=>fetchData.writeDefinition(wrtdef[5])).catch().then(()=>fetchData.writeDefinition(wrtdef[6])).catch().then(()=>fetchData.writeDefinition(wrtdef[7])).catch().then(()=>fetchData.writeDefinition(wrtdef[8])).catch().then(()=>{fetchData.writeDefinition(wrtdef[9]).then(console.log(new Date()-starttime2)).catch()}).catch();*/