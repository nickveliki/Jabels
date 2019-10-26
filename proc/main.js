const fetchData = require("./fetchData");
fetchData.writeDefinition({path: "test/test", indexKey: "test", test:"default", mock:"no shmock", milk: "cold", dudu:1.3, doSomething:(object)=>Object.keys(object).toString()}).then((fulfilled)=>{
console.log("fullfilled: "+fulfilled);
fetchData.getTwigBFD({path: "test/test", indexKey: "test", test:"oiuztre"}, "doSomething").then((fulfilled)=>{
    console.log("fulfilled",fulfilled({a:1, b:2}));
}, (rejected)=>{
    console.log("rejected", rejected);
});
}, (rejected)=>{
    console.log("rejected: "+ rejected);
});