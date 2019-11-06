const serve = require("./proc/serve");
const http = require("http");
const fs = require("fs");
const path = require("path");
//this setup is the recommended way of running if you can't follow my recommendations specified in serve.js
serve(3000);
const server = http.createServer((req, res)=>{
    //hide your database form direct access if you want to run everything on the same name
    if (!req.url.startsWith("/db")){
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