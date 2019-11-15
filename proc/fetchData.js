const fs = require("fs");
const path = require("path");
const parsFunc = require("./parseFunc");
const basePath = require("./basePath");
const callFunc = require("./callFunc");
const setup = (relpath)=>{
    basePath.setPath("..", relpath);
    providePath(basePath.getPath());
}
const definitions = ({definition, strict}) =>{
    return new Promise((res, rej)=>{
        fs.readFile(path.join(basePath.getPath(), "definitions.json"), (error, data)=>{
            if (error){
                rej({error:404, message:error});
            } else {
                const dString = data.toString();
                const defs = [];
                try{
                    const Definitions = JSON.parse(dString).Definitions;
                    if (strict){
                        let searchterm;
                        if (typeof(definition)!=="string"){
                            searchterm = (path.join(basePath.getPath(), definition.path)+".json");
                        }else{
                            searchterm=definition;
                        }
                        const search = searchDefinition(Definitions, searchterm);
                        if(search){
                            defs.push(search);
                        }
                    }else{
                        Definitions.filter((item)=>{
                            if (!definition){
                                return true;
                            }
                            return item.includes(definition)||definition.includes(item);
                        }).map((item)=>{
                            defs.push(item);
                        })
                    } 
                    
                } catch (e){
                    rej({error: 500, message:e});
                }
                if (defs.length>0){
                    res(defs);
                } else {
                    rej({error: 404, message: dString, dString});
                }
                
            }
        })
    })
}
const searchDefinition = (definition, indexKeyValue, exact=true, index=false)=>{
    if(typeof(indexKeyValue)!=="string"){
        if(indexKeyValue[definition.indexKey]){
            indexKeyValue=indexKeyValue[definition.indexKey];
        }else{
            return index?-1:undefined;
        }
    }
    if (definition.Versions&&definition.Versions.length>0||Array.isArray(definition)){
        let search = definition.Versions?definition.Versions.map((item)=>item):definition.map((item)=>item);
        let bound = Math.round(search.length/2);
        while(search.length>1){
            if (indexKeyValue<(Array.isArray(definition)?search[bound]:search[bound][definition.indexKey])){
                search.splice(bound, search.length-bound);
            }else{
                search.splice(0, bound);
            }
            bound=Math.round(search.length/2);
        }
        if(!exact||search[0]===indexKeyValue||search[0][definition.indexKey]===indexKeyValue){
            if(index){
                return Array.isArray(definition)?definition.indexOf(search[0]):definition.Versions.indexOf(search[0]);
            }
            return search[0];
        }
    }
    return index?-1:undefined;
}
const getDefinition = (definition)=>{
    return new Promise((res, rej)=>{
        definitions({definition, strict:true}).then((fulfilled)=>{
            const path = fulfilled[0];
            fs.readFile(path, (error, data)=>{
                if (error){
                    rej({error:404, message:error});
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
                const findKey = searchDefinition(content, definition);
                if (findKey){
                    res(findKey);
                } else {
                    rej({error:404, message:"no matching indexed property value found"});
                }
            } else {
                rej({error:409, message:"indexKeys don't match, can't find appropriate Version"});
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
                rej({error:404, message:definition.property + " not found on "+ definition.path});
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
                    const required = callFunc(prop.path, prop.name, definition.args);
                    res(required);
                }
                res(prop);
            }else {
                rej({error:404, message:"dead twig " +Twig + " on "+definition.path});
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
    let pathwrite = "";
    while(gfpath.length>0){
        pathwrite+=gfpath.shift()+path.sep;
            if (!fs.existsSync(pathwrite)){
                fs.mkdirSync(pathwrite);
            } 
        }
    }
const writeDefinition = (definition)=>{
    return new Promise((res, rej)=>{
        if (definition.indexKey&&definition[definition.indexKey]){
            let fpath = path.join(basePath.getPath(), definition.path);
        if (!fpath.endsWith(".json")){
            fpath+=".json";
        }
        definition.path=undefined;
        const indexKey = definition.indexKey;
        definition.indexKey=undefined;    
        getDefinition(fpath).then((fulfilled)=>{
            const content = JSON.parse(fulfilled);
            if (content.indexKey===indexKey){
            let message;
            const findIndexed = content.Versions.filter((item)=>item[indexKey]===definition[indexKey]);
            if (findIndexed.length==1){
                content.Versions[content.Versions.indexOf(findIndexed[0])] = updateObject(findIndexed[0], definition);
                message =  "Version "+definition[indexKey]+" of "+ fpath+" has been sucessfully updated";
            }else {
                content.Versions.push(definition);
                content.Versions.sort((a, b)=>{
                    const ak = a[indexKey];
                    const bk = b[indexKey];
                    return ak>bk?+1:-1}
                    );
                message = "Version " + definition[indexKey] + " of " + fpath+" has been successfully added";
            }
            fs.writeFile(fpath, JSON.stringify(content, (key, value)=>{
                if (typeof(value)==="function"){
                    parsFunc(definition[indexKey]+"_"+key, value, fpath).then((ful)=>{
                    }, (rej)=>{
                    });
                    return {name: definition[indexKey]+"_"+key, path: fpath.replace("json", "js")};
                }
                return value;
            }), (error)=>{
                if (error){
                    rej({error:500, message:error});
                }else {
                    res(message);
                }
            } )
            } else {
                rej({error:409, message:"indexKeys must match"});
            }
            
        }, (rejected)=>{
            let defs;
            if(rejected.dString){
                defs = JSON.parse(rejected.dString);
            } else {
                defs = {Definitions: []};
            }
            defs.Definitions.push(fpath);
            defs.Definitions.sort();
            fs.writeFile(path.join(basePath.getPath(), "definitions.json"), JSON.stringify(defs), (error)=>{
                if (error){
                    rej({error:500, message:error});
                } else {
                    providePath(fpath);
                    fs.writeFile(fpath, JSON.stringify({Versions:[definition], indexKey: indexKey}), (error)=>{
                        if (error){
                            rej({error:500, message:error});
                        } else {
                            res("successfully created "+ fpath);
                        }
                    });
                    
                    
                }
            })
        })
    }else {
        rej({error:409, message:"Every Definition must have an Indexkey"})
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
                rej({error:404, message:"No default definition available"});
            }
        })
    })
}
const DeleteVersion = (...definitions)=>new Promise((res, rej)=>{
    let samepath = true;
    if(definitions.length > 1){
        for (let i = 1; i < definitions.length&&samepath; i++){
            samepath = definitions[i].path===definitions[i-1].path;
        }
    }
    if (!samepath){
        rej({error: 409, message:"can only target versions of the same definition together"});
    } else{
        getDefinition(definitions[0]).then((ful)=>{
            const def = JSON.parse(ful);
            const indexes = definitions.map((item)=>item[def.indexKey]);
            def.Versions = def.Versions.filter((item)=>!indexes.includes(item[def.indexKey]));
            fs.writeFile(path.join(basePath.getPath(), definitions[0].path+".json"), JSON.stringify(def), (error)=>{
                if(error){
                    rej({error: 500, message:error});
                }else{
                    res("Deletion complete");
                }
            })
        }, (nfl)=>{rej(nfl)})
    }
    
    
    
})


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
    setup,
    DeleteVersion,
    searchDefinition
}

