const fs = require("fs");
const path = require("path");
const defPath = path.join(__dirname, "../db/definitions.json"); 
const definitions = ({definition, strict}) =>{
    return new Promise((res, rej)=>{
        fs.readFile(defPath, (error, data)=>{
            if (error){
                rej(error);
            } else {
                const dString = data.toString();
                const defs = [];
                try{
                    JSON.parse(dString).Definitions.filter((item)=>{
                        if (!definition){
                            return true;
                        }
                        if (strict){
                            let fpath = path.join(__dirname, "../db/",definition.path);
                            if (!fpath.endsWith(".json")){
                                fpath+=".json";
                            }
                            console.log(fpath);
                            return item===fpath;
                        } 
                        return item.includes(definition)||definition.includes(item);
                    }).map((item)=>{
                        defs.push(item);
                    })
                } catch (e){
                    rej(e);
                }
                if (defs.length>0){
                    res(defs);
                } else {
                    rej({dString});
                }
                
            }
        })
    })
}
const getDefinition = (definition)=>{
    return new Promise((res, rej)=>{
        definitions({definition, strict:true}).then((fulfilled)=>{
            const path = fulfilled[0];
            fs.readFile(path, (error, data)=>{
                if (error){
                    rej(error);
                } else {
                    res(data.toString());
                }
            })
        }, (rejected)=>{rej(rejected)});
    })
}
const getDefinitionProperties = (definition)=>{
    return new Promise((res, rej)=>{
        getDefinition(definition).then((fulfilled)=>{
            const content = JSON.parse(fulfilled);
            if (definition.indexKey===content.indexKey){
                const findKey = content.Versions.filter((item)=>item[definition.indexKey]===definition[definition.indexKey]);
                if (findKey.length===1){
                    res(findKey[0]);
                } else {
                    rej("no matching indexed property value found");
                }
            } else {
                rej("indexKeys don't match, can't find appropriate Version");
            }
        }, (rejected)=>{
            rej(rejected);
        })
    })
}
const getDefinitionProperty = (definition, property)=>{
    return new Promise((res, rej)=>{
        getDefinitionProperties(definition).then((fulfilled)=>{
            if(fulfilled[property]){
                res(fulfilled[property]);
            }else {
                rej(property + " not found on "+ definition.path);
            }
        }, (rejected)=>{
            rej(rejected);
        })
    });
}
const getPropertyProperty = (parentProperty, childProperty)=>{
    if (parentProperty[childProperty]){
        return parentProperty[childProperty];
    }
    return undefined;
}
const getTwig = (definition, Twig)=>{
    const branching = Twig.split(".");
    return new Promise((res, rej)=>{
        getDefinitionProperty(definition, branching.shift()).then((fulfilled)=>{
            let prop = fulfilled;
            while(prop!=undefined&&branching.length>0){
                prop = getPropertyProperty(prop, branching.shift());
            }
            if (prop){
                res(prop);
            }else {
                rej("dead twig " +Twig + " on "+definition.path);
            }
        }, (rejected)=>{
            rej(rejected);
        })
    })
}
const providePath =(fpath)=>{
    let gfpath =fpath.split(path.sep);
    gfpath.pop();
    gfpath= gfpath.toString();
    while (gfpath.includes(",")){
        gfpath = gfpath.replace(",", path.sep);
    }
    console.log(gfpath);
    return new Promise((res, rej)=>{
        fs.exists(gfpath, (exists)=>{
            if (!exists){
                fs.mkdir(gfpath, (error)=>{
                    if (error){
                        rej(error);
                    } else {
                        res(true);
                    }
                });
            } else {
                res(true);
            }    
        }  
    )
})}
const writeDefinition = (definition)=>{
    if (definition.indexKey&&definition[definition.indexKey]){
        let fpath = path.join(__dirname, "../db/", definition.path);
    if (!fpath.endsWith(".json")){
        fpath+=".json";
    }
    return new Promise((res, rej)=>{
        getDefinition(fpath).then((fulfilled)=>{
            const content = JSON.parse(fulfilled);
            if (content.indexKey===definition.indexKey){
            let message;
            const findIndexed = content.Versions.filter((item)=>item[definition.indexKey]===definition[definition.indexKey]);
            if (findIndexed.length==1){
                content.Versions[content.Versions.indexOf(findIndexed[0])]=definition;
                message =  "Version "+definition[definition.indexKey]+" of "+ fpath+" has been sucessfully overwritten";
            }else {
                content.Versions.push(definition);
                content.Versions.sort((a, b)=>{
                    const ak = a[definition.indexKey];
                    const bk = b[definition.indexKey];
                    return ak>bk?+1:-1}
                    );
                message = "Version " + definition[definition.indexKey] + " of " + fpath+" has been successfully added";
            }
            fs.writeFile(fpath, JSON.stringify(content), (error)=>{
                if (error){
                    rej(error);
                }else {
                    res(message);
                }
            } )
            } else {
                rej("indexKeys must match");
            }
            
        }, (rejected)=>{
            let defs;
            if(rejected.dString){
                defs = JSON.parse(dString);
            } else {
                defs = {Definitions: []};
            }
            defs.Definitions.push(fpath);
            fs.writeFile(defPath, JSON.stringify(defs), (error)=>{
                if (error){
                    rej(error);
                } else {
                    providePath(fpath).then((fulfilled)=>{
                        console.log(fulfilled);
                        fs.writeFile(fpath, JSON.stringify({Versions:[definition], indexKey: definition.indexKey}), (error)=>{
                            if (error){
                                console.log("writeFile")
                                rej(error);
                            } else {
                                res("successfully created "+ fpath);
                            }
                        });
                    }, (rejected)=>{rej(rejected)});
                    
                }
            })
        })
    })
    }else {
        rej("Every Definition must have an Indexkey")
    }
    
}

module.exports = {
    definitions,
    getDefinition,
    getDefinitionProperties,
    writeDefinition, 
    getDefinitionProperty,
    getTwig
}
