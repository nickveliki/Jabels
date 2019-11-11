let Path;
let rel;
const path = require("path")
module.exports={
    getPath: ()=>Path,
    setPath: (...args)=>{
        Path= path.join(__dirname.replace(`node_modules${path.sep}jables${path.sep}`,""), ...args);
        rel = path.join(...args);
    },
    getRel: ()=>rel
}