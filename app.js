const app = document.getElementById("app");
const sendb = document.createElement("button");
const logindata = document.createElement("div");
const username = document.createElement("input");
const password = document.createElement("input");
password.type="password";
const error = document.createElement("p");
error.style="color:red;";
logindata.appendChild(username);
logindata.appendChild(document.createElement("br"));
logindata.appendChild(password);
logindata.appendChild(document.createElement("br"));
logindata.appendChild(sendb);
logindata.appendChild(document.createElement("br"));
logindata.appendChild(error);
sendb.innerHTML = "Login";
sendb.onclick = () => {
    if (!key){
        if (username.value.length>7&&password.value.length>7){
            let retr = [];
            let userSplit = (username.value + password.value).split("")
            userSplit.forEach((item, index)=>{
                const hex = item.charCodeAt(0).toString(16);
                if (index%2==0){
                    retr.push(hex);
                }else{
                    retr.unshift(hex);
                }
            });
            let i = 0;
            let final = "";
            while(retr.length>0){
                i++;
                if (i%7==0){
                    final+=retr.splice(i%retr.length, 1).toString();
                }
            }
            setRetrieve(final);
            error.innerHTML = "";
            sendb.innerHTML = "Logout";
        } else {
            if (username.value.length<8){
                error.innerHTML+="Username must have at least 8 symbols\r\n";
            }
            if (password.value.length<8){
                error.innerHTML+="Password must have at least 8 Symbols"
            }
        }
    } else {
        unsetRetrieve();
        sendb.innerHTML = "Login";
    }
    
};
app.appendChild(logindata);