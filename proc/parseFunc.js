const fs = require("fs");
const path = require("path");
const reqText = (req)=>"const "+req.includes("/")?req.split("/")[req.split("/").length-1]:req+" = require('"+req+"');\r\n"
//const argstext = (arg, index="")=>"const a" + index + " = "+arg+";\r\n";
const fromString = (name, fun, p, req=[]) => {
    if (!p.endsWith(".js")){
        afterdb=false;
        p = p.split(path.sep).filter((item)=>{
            if (item==="db"){
                afterdb=true;
                return false;
            }
            return afterdb;
        }).toString().replace(new RegExp(",", 'g'), path.sep);
        p=path.join(__dirname, "../db", p.endsWith(".json")?p.replace("json", "js"):(p+".js"));
    }
    return new Promise((res, rej)=>{
        let ftext = "";
        ftext+= name+":"+fun;
        fs.readFile(p, (error, data)=>{
            let d = "";
            if (error){
                req.forEach(element => {
                    let addreq=reqText(element);
                    d+=addreq+content;
                });
                d+="module.exports = {\r\n";
                d+=name+": "+fun+"\r\n};"
            }else {
                let content = data.toString();
                if(typeof(req)==="string"){
                    let addreq=reqText(req);
                    if (!content.includes(addreq)){
                        content=addreq+content;
                    };
                }else if (Array.isArray(req)){
                    req.forEach(element => {
                        let addreq=reqText(element);
                    if (!content.includes(addreq)){
                        content=addreq+content;
                    };
                    });
                }
                const afterModuleExports = content.split("module.exports");
                const firstBracket = afterModuleExports[1].indexOf("{");
                let newmodexports=!afterModuleExports[1].includes(name)?afterModuleExports[1].substring(0, firstBracket+1)+ftext+","+afterModuleExports[1].substring(firstBracket+1):afterModuleExports[1];
                d=afterModuleExports[1]!==newmodexports?content.replace(afterModuleExports[1], newmodexports):content;
            }
            fs.writeFile(p, d, (error)=>{
                if (error){
                    rej(error);
                }else res(p);
            })
        })
    })
};
module.exports = fromString;
