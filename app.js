var express = require('express');
var fs = require('fs');
var path = require('path');
var jsonfile = require('fs');
var app = express();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

var file = './usersList.json';
var items = './itemList.json';
var UIDcountrer = 1;
var logedInUsers = {}; // {barak : UID}
var logedInUsersTag = {}; //{uid , barak};
configureLists();


app.get("/",function(req,res){
    res.sendFile(path.join(__dirname + "/" + "public" + "/" + "hello.html" ));
});
// Set the public directory for all static files
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login/:userId/:password', function (req, res) {
    var name = req.params.userId;
    var pass = req.params.password;

    authenticationLogin(name, pass, function (val) {
        //Exist
        if (val) {
            console.log(logedInUsers);
            var uid = logedInUsers[req.params.user];
            //Already logged in
            if (uid) { // Return his UID
                res.cookie('uid', uid);
            } else {
                UIDcountrer++;
                logedInUsers[name] = UIDcountrer;
                logedInUsersTag[UIDcountrer] = name;

                var options = {
                    maxAge: 1000 * 60 * 60, // would expire after 60 minutes
                    httpOnly: true, // The cookie only accessible by the web server
                    // signed: true // Indicates if the cookie should be signed
                }
                res.cookie('uid', UIDcountrer, options);
            }
            res.status(200).send("OK");
        } else {
            res.status(500).send("Opps, The user doesnt exist ");
        }
    });
})

app.post('/register/:userId/:password', function (req, res) {
    var name = req.params.userId;
    var pass = req.params.password;
    //False = dont exist
    authenticationRegister(name, function (val) {
        //If val == true then the user is authentic to register
        if (val) {
            var obj = {userName: name, password: pass};
            var jsonObj = JSON.stringify(obj, null, 2);
            //Callback when created
            jsonfile.appendFile(file, jsonObj, function (err) {
                console.error(err)
            });
            res.status(200).send("redirect");
        } else {
            res.status(500).send("Opps, The user is already exists  ");
        }
    });
});


app.use('/', function (req, res, next) {

    if (logedInUsersTag[req.cookies.uid]) {
        var username = logedInUsersTag[req.cookies.uid];
        UIDcountrer++;
        logedInUsers[username] = UIDcountrer;
        delete logedInUsersTag[req.cookies.uid];
        logedInUsersTag[UIDcountrer] = username;

        var options = {
            maxAge: 1000 * 60 * 60, // would expire after 60 minutes
            httpOnly: true, // The cookie only accessible by the web server
            // signed: true // Indicates if the cookie should be signed
        }
        res.cookie('uid', UIDcountrer);
        next();
    } else {
        console.log("NUSER DOESNT EXIST");
        res.status(500).send("cant access private page without cookie");
    }
});

app.post("/item", upload.array(), function (req, res, next) {

    var id = req.body.id;
    var data = req.body.data;
    var obj = {id: id, data: data};

    fs.readFile(items, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }

        var bool = false;
        if (data.length != 0) {
            var text = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
            var arr = JSON.parse(text);
            //Search for if the item exist
            for (x in arr) {
                if (arr[x].id === id) {
                    bool = true;
                    break;
                }
            }
        }
        if (!bool) {
            //item doesnt exis in the file then enter
            jsonfile.appendFile(items, JSON.stringify(obj), function (err) {
                console.error(err)
            });
            res.status(200).send("Thank you!");
        } else {
            res.status(500).send("This ID is already exist");
        }
    });
})

//Overwrite
app.put('/item', function (req, res, next) {
    var id = req.body.id;
    var data = req.body.data;
    fs.readFile(items, function (err, data) {

        var arr = JSON.parse(data);
        var obj = {id: id, data: data};
        //Search for if the item exist
        for (x in arr) {
            if (arr[x].id === id) {
                arr[x] = obj;
                console.log("exist!");
                res.send("Item exist");
            }
        }
        //We write a new item
        fs.writeFile(items, JSON.stringify(arr), function (err) {
            if (err)
                throw new Error("Error while updating the file");
        });
    });
});


// respond with "hello world" when a GET request is made to the homepage
app.get('/items', function (req, res) {
    fs.readFile(items,"utf-8", function (err, data) {
        if (err) {
            throw (err);
        }

        if(data.length == 0){
            res.status(500);
            res.send("The list is empty");
            return;
        }


        var text = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
        var itemsArray = JSON.parse(text);
        var list = "";

        for (var i = 0 ; i < itemsArray.length ; i++) {
            list += itemsArray[i].data +'<br>' ;
            }
            console.log(list);

        res.send(JSON.stringify(list));
    })
})

app.get('/item/:id', function (req, res) {

    var id = req.params.id;
    var data = fs.readFileSync(items, "utf-8");
    // Emptry list
    if(data.length == 0){
        res.status(500);
        res.send("No match foumd");
        return;
    }
    var text = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
    var itemsArray = JSON.parse(text);

    for (i in itemsArray) {
        console.log("currnt id is: " + itemsArray[i].id);
        if (itemsArray[i].id === id) {
            console.log("Found a match!")
            res.send(itemsArray[i].data);
            return;
        }
    }
    res.send("No match find!");
});


// Delete item by id
app.delete('/item/:id', function (req, res) {
    var id = req.params.id;
    var data = fs.readFileSync(items, "utf-8");

    if (data.length != 0) {
        var text = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
        var itemsArray = JSON.parse(text);
        for (i in itemsArray) {
            //Found
            if (itemsArray[i].id === id) {
                itemsArray.splice(i, 1);
                var newFile = JSON.stringify(itemsArray).replace("[", "").replace("]", "");
                console.log(newFile);
                fs.writeFile(items, newFile, null, function (err) {
                    if (err) throw new Error("error");
                })
                res.status(200).send("Item deleted!");
                return;
            }
        }
    }

    console.log("log");
    res.status(404).send("No match find!");
    return;
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log("Server: nothing else cought it, so error")
    var err = new Error('Not Found');
    err.status = 404;
    next(err);

});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function authenticationRegister(userName, callback) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        //Convert the JSON file to apropriate format
        if (data.length !== 0) {
            var text = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
            //Convert the array json to js array
            var obj = JSON.parse(text);
            for (i in obj) {
                if (obj[i].userName === userName) {
                    callback(false);
                    return;
                }
            }
        }
        callback(true);
    });
}

function authenticationLogin(userName, pass, callback) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }

        if (data.length !== 0) {
            var x = data.replace(/}{/g, "},{").replace(/^{/, "[{") + "]";
            var x = JSON.parse(x);
            for (i in x) {
                if (x[i].userName === userName && x[i].password == pass) {
                    callback(true);
                    return;
                }
            }
        }
        callback(false);
    });
}

function configureLists() {
    console.log("Configure");
    jsonfile.appendFile(file, "", function (err) {
        if (err)
            throw Error("Error while creating user list");
    });

    jsonfile.appendFile(items, "", function (err) {
        if (err)
            throw Error("Error while creating items list");
    });
}

module.exports = app;