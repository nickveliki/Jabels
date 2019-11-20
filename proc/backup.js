const fs = require("fs");
const basepath = require("./basePath");
const path = require("path");
console.log(basepath.getPath());
const backupPath = path.join(basepath.getPath(), "..", "dback");
const times = [];
let longestbackup = 0;
let fastestbackup = 0;
module.exports = () =>{
    const starttime = new Date()-0;
    console.log("backup initiated");
    if(fs.existsSync(path.join(basepath.getPath(), "definitions.json"))){
        console.log("backup: definitions found");
    let definitions;
    try{
        console.log("backup: reading definitions");
        definitions = JSON.parse(fs.readFileSync(path.join(basepath.getPath(), "definitions.json")).toString()).Definitions;
        fs.writeFileSync(path.join(backupPath, "definitions.json"), JSON.stringify({Definitions: definitions}));
    }catch (e) {
        console.log("backup: error in definitions");
        definitions = getBackupDefinitions();
        fs.writeFileSync(path.join(basepath.getPath(), "definitions.json"), JSON.stringify({Definitions: definitions}));
        console.log(e);
    }
    definitions.forEach((element) => {
        let content;
        try{
            console.log("backup: reading " + element);
            content = JSON.parse(fs.readFileSync(element));
            fs.writeFileSync(element.replace(basepath.getPath(), backupPath), JSON.stringify(content));
        }catch (e){
            console.log("backup: error in " + element);
            content = JSON.parse(fs.readFileSync(element.replace(basepath.getPath(), backupPath)));
            fs.writeFileSync(element, JSON.stringify(content));
        }
    });

};
const endtime = new Date()-starttime;
times.push(endtime);
let meantime = 0;
times.forEach((item)=>{
    if (item>longestbackup){
        longestbackup = item;
    }
    if (fastestbackup==0||item<fastestbackup){
        fastestbackup = item;
    }
    meantime+=item;
})
meantime = meantime/times.length;
console.log("backup finished, " + endtime +"ms");
console.log("median backup time " + meantime.toFixed(2) + "ms, longest backup time: "+longestbackup + "ms, fastest backup: "+ fastestbackup + "ms");
}

const getBackupDefinitions = ()=>{
    if (fs.existsSync(path.join(backupPath, "definitions.json"))){
            return JSON.parse(fs.readFileSync(path.join(backupPath, "definitions.json"))).Definitions;
    }
    return [];
}