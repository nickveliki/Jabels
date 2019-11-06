const app = document.getElementById("app");
const sendb = document.createElement("button");
sendb.innerHTML = "Send Test Request";
sendb.onclick = () => {
    if(key){
    getDefinitions(undefined, console.log);
    }
};
app.appendChild(sendb);