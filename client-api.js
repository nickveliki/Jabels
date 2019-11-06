const fqdn = "http://localhost:3000"; //modify this to fit the protocoltype and domain name of your database server
const Retrieve = "test"; //specify a unique application registration name. You need it to obtain keys
let key = undefined;
let keyIssued = undefined;
let inter = setInterval(() => {
    if (keyIssued&&key&&new Date().valueOf()-keyIssued>500000){
        getKey(true);
    }
}, 60000);
const getKey =(retrievalHint=false) =>{
    fetch(fqdn, {
        method:"POST",
        body: key?JSON.stringify({key, retrievalHint:retrievalHint?Retrieve:undefined}):JSON.stringify({retrievalHint: Retrieve})
    }).then(Response=>Response.text()).then(data=>{ keyDat(data);
        });
}
getKey();
const communicate = (direction, object, func) =>{
    object["key"]=key;
    fetch(fqdn+"/"+direction, {
        method:"POST",
        body: JSON.stringify(object)
    }).then(Response=>Response.text()).then(data=>{
        let D = keyDat(data);
        func(D);
    })
}
//object can contain "path" key, this will filter results. 
//If the strict key is set to true, only an exact match will be searched for 
const getDefinitions = (object={}, func)=> {communicate("definition", object, func)};

//object must contain "path" key, search is strict
const getDefinition = (object, func)=> {communicate("getDefinition", object, func)};

//object must contain "path" key, 
//and it must have a key specified by the definition's indexKey
const getProperties = (object, func)=> {communicate("getProperties", object, func)};

//instead of yielding all properties, this only produces one property
//mus have "path" key, indexKey, and property key 
const getProperty = (object, func)=> {communicate("getProperty", object, func)};

//if a Default Verion is set for a definition, it will search this Default Version
//requires "path" key
const getDefault = (object, func) => {communicate("getDefault", object, func)};

//retrieves the name of the IndexKey of a definition
//requires "path" key
const getIndexKey = (object, func) => {communicate("getIndexKey", object, func)};

//retrieves a nested property of a definition Version
//requires "path", indexKey and "Twig" keys
//Twig structure: "rootproperty.nestedProperty[.nestedProperty...]"
const getTwig = (object, func) => {communicate("getTwig", object, func);}

//retrieves a nested Property and falls back on definition Default if it is undefined in the specified version
const getTwigBFD = (object, func) => {communicate("getTwigBFD", object, func);}

//create a new Definition
//requires "path", "indexKey" and indexkey (specify this as "default" or 0 to create a default fallback version)
//if there is already a definition at the specified path, the "indexKey" must be equal to the indexKey specified there
//existing Versions can be updated by selecting the IndexKey of this Version. New keys will be appended, existing keys overwritten, undefined keys remain untouched
const writeDefinition = (object) => {communicate("writeDefinition", object, console.log);}

let tries = 0;
keyDat = (data)=>{
    try{
        const Data = JSON.parse(data);
        key = Data.nextKey;
        keyIssued = new Date().valueOf();
        tries = 0;
        return Data.data;
    } catch (e){
        console.log(data);
        key=undefined;
        if(tries<3){
            setTimeout(()=>{
                getKey();
            }, 200);
            
        }else{
            console.log("tried to get new key 3 times. Please call Admin, I don't know what to do");
        }
        tries++;
    }
}
