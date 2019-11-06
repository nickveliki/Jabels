let Path;
let rel;
const path = require("path")
module.exports={
    getPath: ()=>Path,
    setPath: (...args)=>{
        console.log(args);
        Path= path.join(__dirname, ...args);
        rel = path.join(...args);
    },
    getRel: ()=>rel
}