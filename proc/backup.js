const fs = require("fs");
const basepath = require("./basePath");
const path = require("path");
const backupPath = path.join(basepath.getPath(), "..", "dback");
const crypto = require("crypto");
const times = [];
let longestbackup = 0;
let fastestbackup = 0;
let sec;
const backup = ({iv, key}) =>{
    sec = {key, iv};
    console.log(new Date().toUTCString());
    const starttime = new Date()-0;
    console.log("backup initiated");
    if(fs.existsSync(path.join(basepath.getPath(), "definitions.jdf"))){
        console.log("backup: definitions found");
    let definitions;
    try{
        console.log("backup: reading definitions");
        const defbuf = fs.readFileSync(path.join(basepath.getPath(), "definitions.jdf"));
        definitions = JSON.parse(crypto.createDecipheriv("aes-128-gcm", sec.key, sec.iv).update(defbuf).toString()).Definitions;
        console.log(definitions);
        fs.writeFileSync(path.join(backupPath, "definitions.jdf"), defbuf);
    }catch (e) {
        console.log("backup: error in definitions");
        fs.writeFileSync(path.join(basepath.getPath(), "definitions.jdf"), getBackupDefinitions());
        console.log(e);
    }
    definitions.forEach((element) => {
        try{
            console.log("backup: reading " + element.split("#")[0]);
            const elbuf = fs.readFileSync(element.split("#")[0]);
            const iv = Buffer.from(element.split("#")[1].split(","));
            const reading = crypto.createDecipheriv("aes-128-gcm", sec.key, iv).update(elbuf);
            content = JSON.parse(reading.toString());
            fs.writeFileSync(element.split("#")[0].replace(basepath.getPath(), (backupPath+path.sep)), elbuf);
         }catch (e){
            console.log("error in "+ element.split("#")[0]);
            fs.writeFileSync(element.split("#")[0], fs.readFileSync(element.split("#")[0].replace(basepath.getPath(), (backupPath+path.sep))));
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
    if (fs.existsSync(path.join(backupPath, "definitions.jdf"))){
            return fs.readFileSync(path.join(backupPath, "definitions.jdf"));
    }
    return [];
}
module.exports = backup;