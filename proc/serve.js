const fetchData = require("./fetchData");
const https = require("http");
const key = "48F45558F75902B7EBBDF2D815A1D4109146CC56C985B3571BC2F40A3899B6B399B2865C920DDE5B988EB23F44AB38D2863D8733D507CD701C9104E8A929B45EC11A4C1C39923C07E8E7BD1BC5C3245ADB317ACE423089AA1812F20CA84E2E59DAE509D2053D3AE878B91DABA72A8C7232D4513243A297FCD38120D97C034AF2546880587FAFAC432522D2FB50005430CE5D4189B873971F3D1E760CB026D553C1B85640C55185988B2AB6BB5B4591B2FC90836A4B6CA6BC028C81EA5845274A8E35BC87E53CAF2D076DCF4CDC41429AFB1EE258B81846EE17A126C2A1EEEC376B8DF982F039AEC28FF26A2EF7E777CF32C25816D55B62B0603DCFDC994CCA017080BB723D9D479EA74439EC6A867948F48E719F9A349E609668D8E093ED4098D54252BBABF8E1B5F2CE5A37DB3890226FDB750BF5B882CB5D2C652E04341983E97F0A909001180A901756CD1EDD7E5278E5420C605F7D26EB1FDFD485AB7AC33B82002E93FD36700F17A6F9245EFC49B93FAA40E48C136212A1126E10666CAC"
const activeKeys = [];
const timeStamps = [];
const block = [];
const Refs = [];
const server = https.createServer((req, res)=>{
    if (!block.includes(req.headers.origin)){
    Refs.push(req.headers.referer);
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080"); //adapt this to service your needs. It is not recommended to run the database api and the app on the same domain names due to the mechanism of method call. If you are restricted in domain names, make your API and App listen on different ports
    proc(req, res);
    }
        
})
const proc = (req, res)=>{
    const resObj = {};
    const buffer = [];
    req.addListener("data", (data)=>{
        buffer.push(data);
    });
    req.addListener("end", ()=>{
        const data = buffer.length!=0?JSON.parse(buffer.toString()):undefined;
        keystuff(data, resObj).then((ful)=>{
            if(data.path&&(data.path.includes("regKeys")||"regKeys".includes(data.path))){
                res.write("403: regKeys is only accessible to admin");
                res.end()
            }else{
                urlSwitch(req.url).then((ful)=>{
                    ful(data).then((ful)=>{
                        resObj["data"]=ful;
                        res.write(JSON.stringify(resObj));
                        res.end();
                    }, (rej)=>{
                        resObj["error"]=rej;
                        res.write(otos(resObj));
                        res.end();
                    })
                }, (rej)=>{
                    resObj["error"]=rej;
                    res.write(otos(resObj));
                    res.end();
                })
            }
            
        }, (rej)=>{
            console.log(rej);
            if (data&&data.retrievalHint){
                const defP = {path:"regKeys", indexKey:"retrievalHint", retrievalHint:data.retrievalHint};
                fetchData.getDefinitionProperty(defP, "regKey").then((ful)=>{
                    resObj["nextKey"]=ful;
                    activeKeys.push(ful);
                    timeStamps.push(wrtdate());
                    res.write(JSON.stringify(resObj));
                    res.end();
                }, (reject)=>{
                    const newKey = nextKey("");
                    defP["regKey"]=newKey;
                    fetchData.writeDefinition(defP).then((ful)=>{
                        resObj["nextKey"]=newKey;
                        activeKeys.push(newKey);
                        timeStamps.push(wrtdate());
                        res.write(JSON.stringify(resObj));
                        res.end();
                    }, (rej)=>{
                        res.write(otos(reject)+" | "+otos(rej));
                        res.end();
                    })
                })
            }else{
                res.write("invalid Key");
                res.end();
            }
        })
    })
}
const wrtdate= ()=>{
    return new Date().valueOf();
}
const keystuff = (data, resObj)=>{
    const key = data!=undefined?data.key:undefined;
    return new Promise((res, rej)=>{
        let validKey = false;
        if (key&&activeKeys.includes(key)){
            validKey=true;
            let newKey = nextKey(key);
            const index = activeKeys.indexOf(key);
            activeKeys.splice(index, 1, newKey);
            timeStamps.splice(index, 1, wrtdate());
            resObj["nextKey"]=newKey;
        }
        if (validKey){
            if(data.retrievalHint){
                const wrtobj = {definition: {path:"regKeys", indexKey:"retrievalHint", retrievalHint:data.retrievalHint, regKey: nextKey(nextKey(resObj["nextKey"]))}};
                fetchData.writeDefinition(wrtobj).then((ful)=>{
                    resObj["writeKey"]=ful;
                    res("key saved for later use");
                }, (rej)=>{
                    resObj["writeKey"]=rej;
                    res("failed to save key for later use");
                })
            }else {
                res("new key distributed to user");
            }
        } else {
            rej("something fucked up");
        }        
    })
}
const otos = (o)=>typeof(o)==="object"?JSON.stringify(o):o.toString();
const urlSwitch = (url)=>{
    console.log(url);
    return new Promise((res, rej)=>{
        switch(url){
            case "/definition": res(fetchData.definitions);
            break;
            case "/getDefinition":  res(fetchData.getDefinition);
            break;
            case "/getProperties": res(fetchData.getDefinitionProperties);
            break;
            case "/getProperty": res(fetchData.getDefinitionProperties);
            break;
            case "/getDefault": res(fetchData.getDefault);
            break;
            case "/getIndexKey": res(fetchData.getIndexKey);
            break;
            case "/getTwig" : res(fetchData.getTwig);
            break;
            case "/getTwigBFD": res(fetchData.getTwigBFD);
            break;
            case "/writeDefinition": res(fetchData.writeDefinition);
            break;
            default: rej("invalid url called");
}})
}
const nextKey = (nkey)=>{
    let returnstatement = "";
    for (let i =0; i < key.length/2; i++){
        const APISub = parseInt(key.substr(i*2, 2), 16);
        const keySub = parseInt(nkey.substr(i*2, 2), 16)||Math.floor(Math.random()*256);
        const newNum = (APISub + keySub)%256;
        returnstatement+=newNum.toString(16);
    }
    return returnstatement;
}
module.exports = (port, dbpath)=>{
    try{
        fetchData.setup(dbpath)
        server.listen(port);
        setInterval(() => {
            let refCounts = [];
            let badRefs = [];
            Refs.map((item)=>{
                if (!badRefs.includes(item)){
                    badRefs.push(item);
                    refCounts.push(1);
                }else{
                    refCounts[badRefs.indexOf(item)]++;
                }
            });
            refCounts.forEach((item, index)=>{
                if (item>100){
                    block.push(badRefs[index]);
                    console.log(badRefs[index] +" has been blocked");
                }
            })
            if(Refs.length>0){
                console.log(Refs);
            }
            Refs.splice(0, Refs.length);
        }, 1000);
        setInterval(()=>{
            let lastTick = new Date().valueOf();
            let expired = [];
            timeStamps.forEach((item, index)=>{
                if (lastTick-item>600000){
                    expired.push(index);
                }
            })
            expired.forEach((item)=>{
                activeKeys.splice(item, 1);
                timeStamps.splice(item, 1);
            })
        }, 36000);
    } catch (e){
        console.log(e);
    }
    
}
