const fs = require("fs");
const path = require("path");
const parsFunc = require("./parseFunc");
const basePath = require("./basePath");
const setup = (relpath)=>{
    basePath.setPath("..", relpath);
    providePath(basePath.getPath());
}
const definitions = ({definition, strict}) =>{
    return new Promise((res, rej)=>{
        fs.readFile(path.join(basePath.getPath(), "definitions.json"), (error, data)=>{
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
                            
                            if (typeof(definition)!=="string"){
                                return item===(path.join(basePath.getPath(), definition.path)+".json");
                            }
                            return item===definition;
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
const getDefinitionProperty = (definition)=>{
    return new Promise((res, rej)=>{
        getDefinitionProperties(definition).then((fulfilled)=>{
            if(definition.property&&fulfilled[definition.property]){
                res(fulfilled[definition.property]);
            }else {
                rej(definition.property + " not found on "+ definition.path);
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
const getTwig = (definition)=>{
    const branching = definition.Twig.split(".");
    return new Promise((res, rej)=>{
        getDefinitionProperty(definition, branching.shift()).then((fulfilled)=>{
            let prop = fulfilled;
            while(prop!=undefined&&branching.length>0){
                prop = getPropertyProperty(prop, branching.shift());
            }
            if (prop){
                if (prop.name&&prop.path){
                    const required = require(prop.path);
                    res(required[prop.name]);
                }
                res(prop);
            }else {
                rej("dead twig " +Twig + " on "+definition.path);
            }
        }, (rejected)=>{
            rej(rejected);
        })
    })
}
const getTwigBFD = (definition)=>{
    return new Promise((res, rej)=>{
        getTwig(definition).then((fulfilled)=>{
            res(fulfilled);
        }, (rejected)=>{
                if(typeof(rejected)==="string"&&(rejected.startsWith("dead twig")||rejected.includes("not found on"))){
                    getDefault(definition).then((fulfilled)=>{
                        res(getTwig(fulfilled, twig));
                    }, (rejected)=>{
                        rej(rejected);
                    })
                } else {
                    rej(rejected);
                }
        })
    })
}
const providePath =(fpath)=>{
    let gfpath =fpath.split(path.sep);
    if(gfpath[gfpath.length-1].includes(".")){
        gfpath.pop();
    }
    gfpath= gfpath.toString();
    while (gfpath.includes(",")){
        gfpath = gfpath.replace(",", path.sep);
    }
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
    return new Promise((res, rej)=>{
        //console.log({definition:definition.definition});
    
        if (definition.indexKey&&definition[definition.indexKey]){
            let fpath = path.join(basePath.getPath(), definition.path);
        if (!fpath.endsWith(".json")){
            fpath+=".json";
        }    
        getDefinition(fpath).then((fulfilled)=>{
            const content = JSON.parse(fulfilled);
            if (content.indexKey===definition.indexKey){
            let message;
            const findIndexed = content.Versions.filter((item)=>item[definition.indexKey]===definition[definition.indexKey]);
            if (findIndexed.length==1){
                content.Versions[content.Versions.indexOf(findIndexed[0])] = updateObject(findIndexed[0], definition);
                message =  "Version "+definition[definition.indexKey]+" of "+ fpath+" has been sucessfully updated";
            }else {
                content.Versions.push(definition);
                content.Versions.sort((a, b)=>{
                    const ak = a[definition.indexKey];
                    const bk = b[definition.indexKey];
                    return ak>bk?+1:-1}
                    );
                message = "Version " + definition[definition.indexKey] + " of " + fpath+" has been successfully added";
            }
            fs.writeFile(fpath, JSON.stringify(content, (key, value)=>{
                if (typeof(value)==="function"){
                    parsFunc(definition[definition.indexKey]+"_"+key, value, fpath).then((ful)=>{
                    }, (rej)=>{
                    });
                    return {name: definition[definition.indexKey]+"_"+key, path: fpath.replace("json", "js")};
                }
                return value;
            }), (error)=>{
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
                defs = JSON.parse(rejected.dString);
            } else {
                defs = {Definitions: []};
            }
            defs.Definitions.push(fpath);
            console.log(defs);
            fs.writeFile(path.join(basePath.getPath(), "definitions.json"), JSON.stringify(defs), (error)=>{
                if (error){
                    rej(error);
                } else {
                    providePath(fpath).then((fulfilled)=>{
                        fs.writeFile(fpath, JSON.stringify({Versions:[definition], indexKey: definition.indexKey}), (error)=>{
                            if (error){
                                rej(error);
                            } else {
                                res("successfully created "+ fpath);
                            }
                        });
                    }, (rejected)=>{rej(rejected)});
                    
                }
            })
        })
    }else {
        rej("Every Definition must have an Indexkey")
    }
    })
    
    
}
const updateObject = (original, update)=>{
    let combine = {};
    const updateKeys = Object.keys(update);
    const restkeys = Object.keys(original).filter((key)=>!updateKeys.includes(key));
    while (updateKeys.length>0){
        let key = updateKeys.shift();
        combine[key] = update[key];
    }
    while (restkeys.length>0){
        let key = restkeys.shift();
        combine[key] =  original[key];
    }
    return combine;
}
const getIndexKey = (definition) => {
    return new Promise((res, rej)=>{
        getDefinition(definition).then((fulfilled)=>{
            res(JSON.parse(fulfilled).indexKey);
        }, (rejected)=>{
            rej(rejected);
        })
    })
}
const getDefault = (definition) =>{
    return new Promise((res, rej)=>{
        getDefinition(definition).then((fulfilled)=>{
            const definition = JSON.parse(fulfilled);
            let i = 0;
            const defaultDefinition = definition.Versions.filter((item)=>{
                let rs = item[definition.indexKey]==="default"||item[definition.indexKey]==0;
                if (rs){
                    i++;
                }
                if (rs&&i==1){
                    return true;
                }
                return false;
            });
            if (defaultDefinition.length==1){
                res(defaultDefinition[0]);
            } else {
                rej("No default definition available");
            }
        })
    })
}
module.exports = {
    definitions,
    getDefinition,
    getDefinitionProperties,
    writeDefinition, 
    getDefinitionProperty,
    getTwig,
    updateObject,
    getIndexKey,
    getDefault,
    getTwigBFD,
    setup
}

