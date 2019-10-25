const fetchData = require("./fetchData");
fetchData.writeDefinition({path: "test/test", indexKey: "test", test:"oiuztre", mock:{yaba:{daba:"doo"}}}).then((fulfilled)=>{
console.log("fullfilled: "+fulfilled);
fetchData.getTwig({path: "test/test", indexKey: "test", test:"oiuztre"}, "mock.yaba.daba").then((fulfilled)=>{
    console.log("fulfilled",fulfilled);
}, (rejected)=>{
    console.log("rejected", rejected);
});
}, (rejected)=>{
    console.log("rejected: "+ rejected);
});

