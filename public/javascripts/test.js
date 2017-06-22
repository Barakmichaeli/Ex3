/**
 * Created by barak on 16/06/2017.
 */


function login() {
    var userName = document.getElementById("usernameField").value;
    var password = document.getElementById("passwordField").value;
    if (userName.length == 0 || password.length == 0) {
        document.getElementById("loginDiv").innerHTML =
            "Please fill all the fields";
        return;
    }

    var http = new XMLHttpRequest();
    var params = userName + '/' + password;
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.href = "/mainPage.html"
        }
        else {
            document.getElementById("loginDiv").innerHTML =
                this.responseText;
        }
    };
    http.open("POST", "http://127.0.0.1:3000/login/" + params, true);
    http.send();
}


function
register() {
    var userName = document.getElementById("usernameField").value;
    var password = document.getElementById("passwordField").value;
    if (userName.length == 0 || password.length == 0) {
        document.getElementById("registerDiv").innerHTML =
            "please fill al the fields";
            return;
    }
    var http = new XMLHttpRequest();
    var params = userName + '/' + password;


    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //Exists
            window.location.href = "/login.html"
        }
        if (this.readyState == 4 && this.status == 500) {
            document.getElementById("registerDiv").innerHTML =
                this.responseText;
        }
    };
    http.open("POST", "http://127.0.0.1:3000/register/" + params, true);
    http.send();
}


function add() {
    var id = document.getElementById("sendID").value;
    var item = document.getElementById("sendItem").value;
    var http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        //Implement
        if (this.readyState == 4 && this.status == 200) {
            //Exists
            document.getElementById("enterItem").innerHTML =
                this.responseText;
        }

        if (this.readyState == 4 && this.status == 500) {
            document.getElementById("enterItem").innerHTML =
                this.responseText;
        }
    };
    var obj = {id: id, data: item};
    var data = JSON.stringify(obj);
    http.open("POST", "http://127.0.0.1:3000/item", true);
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(data);
}

// Sheich is Sheich!!!!!!!


function getAllItems() {
    var http = new XMLHttpRequest();
    //var params = userName + '/' + password;
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //window.location.href = "/login.html"
            console.log("Get all items got response 'OK'")
            document.getElementById("ItemSelected").innerHTML =
                this.responseText.replace(/"/g, "");
        }
        if (this.readyState == 4 && this.status == 500) {
            document.getElementById("ItemSelected").innerHTML =
                this.responseText;
        }
        if (this.readyState == 4 && this.status == 404) {
            console.log("Get all items got response 'PAGE NOT FOUND (404)'")
            document.getElementById("ItemSelected").innerHTML =
                this.responseText;
        }
    };
    console.log("Before sending the request");
    http.open("GET", "http://127.0.0.1:3000/items", true);
    http.send();
    console.log("After sending the request");
}

function handleItem() {

    var http = new XMLHttpRequest();
    var radio1= document.getElementById("getItemById");
    var radio2 = document.getElementById("deleteById");
    var id = document.getElementById("handlerID").value;

    var method = false;

    if(radio1.checked)
        method = "GET";
    else
        method = "DELETE";

    if(id.length ==0 || !method ){
        document.getElementById("ItemSelected").innerHTML = "Please fill all the fields";
        return;
    }


    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            document.getElementById("ItemSelected").innerHTML = this.responseText;
        }
        if (this.readyState == 4 && this.status == 500) {
            document.getElementById("ItemSelected").innerHTML = this.responseText;

        }
        if (this.readyState == 4 && this.status == 404) {
        }document.getElementById("ItemSelected").innerHTML = this.responseText;
    };
    http.open(method, "http://127.0.0.1:3000/item/" + id, true);
    http.send();
}


