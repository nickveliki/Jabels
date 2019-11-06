const serve = require("./proc/serve");
const http = require("http");
const fs = require("fs");
const path = require("path");
const basePath = require("./proc/basePath");

//this setup is the recommended way of running if you can't follow my recommendations specified in serve.js
serve(3000, "db");
const server = http.createServer((req, res)=>{
    //hide your database and api implementation form direct access
    if (!req.url.startsWith(basePath.getRel().replace(".."+path.sep,"/"))&&!req.url.startsWith("/proc")){
        fs.readFile(req.url==="/"?"index.html":path.join(__dirname, req.url), (err, data)=>{
            if (err){
                res.write("404");
            }else{
                res.write(data.toString());
            }
            res.end();
        })
    }else{
        res.write("403");
        res.end();
    }
    
})
server.listen(8080);