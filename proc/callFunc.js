const child = require("child_process");
const basePath = require("./basePath");
const path = require("path");
module.exports = (fpath, funcname, args)=>{
    fpath = path.join(basePath.getPath(), fpath);
    const options = {
        env: {props:JSON.stringify({
            path: fpath,
            args, 
            funcname
        })}
        
    }
    child.exec("node './mount.js'", options, (err, stdout, stderr)=>{
        if (err){
            return {error: 500, message: err};
        }
        if(stdout){
            return stdout;
        }
        if(stderr){
            return {error: 500, message: stderr};
        }
    })
}