
const express = require("express");
const jwt = require("jsonwebtoken");
const {db} = require("./dbController");
const fs = require("fs");
const https = require("https");

let { jwt_secret } = JSON.parse( fs.readFileSync("./keys/keys.json").toString("utf-8") );

var registeration = require("./registeration");
var login = require("./login");
var products = require("./products");

var app = express();

app.use(function prepareCookies(req, res, next){
    req.cookies = new Object();

    if(req.headers["cookie"]){
        let cookiesStr = req.headers["cookie"];
        let cookiesArr = cookiesStr.split(";");
        cookiesArr.forEach(function(cookie, i, arr){
        let [key, value] = cookie.split("=");
        req.cookies[key] = value;
    });
    }
    
    next();
});

app.use(function prepareBody(req, res, next){
    if(req.headers["content-type"] == "application/json"){
        req.setEncoding("utf-8");
        req.on("data", function(chunk){
            req.body = JSON.parse(chunk);
            next();
        });
    }
    else
        next();
});


function authorize(req, res, next){
    
    if(req.url == "/registeration" || req.url == "/login"){
        next();
    }
    else if(req.cookies && req.cookies["token"]){
        jwt.verify(req.cookies["token"], jwt_secret, function(err, decoded){
            if(err){
                console.log(err);
                res.status(401);
                res.end(err);
            }else{
                console.log(req.cookies["token"]);
                req._id=decoded._id;
                next();
            }
                
        });

    }else{
        res.status(403);
        res.end();
        return;
    }
    
}

app.use(authorize);

app.use(express.static("public"));



app.use("/registeration", registeration);
app.use("/login", login);
app.use("/products", products);



app.post("/category",async function(req, res){

    if( req.body["name"].length <2){
        res.status(400);
        res.end();
        return;
    }

    let result = await db.createCategory(req.body["name"]);
    if(result.succeeded){
        res.status(201);
    }
    else
        res.status(400);
    res.end(JSON.stringify(result));
});



https.createServer({
    key: fs.readFileSync('./keys/localhost.key'),
    cert: fs.readFileSync('./keys/localhost.cert')
  }, app).listen(5555);

