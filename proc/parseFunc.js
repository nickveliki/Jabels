const fs = require("fs");
const path = require("path");
const basePath = require("./basePath");
const reqText = (req)=>"const "+req.includes("/")?req.split("/")[req.split("/").length-1]:req+" = require('"+req+"');\r\n"
//const argstext = (arg, index="")=>"const a" + index + " = "+arg+";\r\n";
const fromString = (name, fun, p, req=[]) => {
    if (p.endsWith(".json")){
        p = p.replace(".json", ".js");
    }else if (!p.endswith(".js")){
        p = p+".js";
    }
    if(!p.includes(basePath.getPath())){
        p = basePath.getPath()+p;
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
