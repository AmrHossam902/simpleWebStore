
const express = require("express");
const jwt = require("jsonwebtoken");
const {db} = require("./dbController");
const validator = require("./inputValidation");
const fs = require("fs");
const crypto = require("crypto");


let { jwt_secret, password_secret } = JSON.parse( fs.readFileSync("./keys/keys.json").toString("utf-8") );


var loginRouter =express.Router();


loginRouter.get("/", function(req, res){
    res.sendFile(__dirname + "/views/login.html", function(err){
        res.end();
    });
});

loginRouter.post("/", async function(req, res){

    let { mobile, password } = req.body;

    if(!validator.validateMobile(mobile)
        || password.length < 8){
            res.status(400);
            res.end("incorrect Input");
            return;
        }
    
    
    var result = await db.getUser(mobile, {"mobile":1, "password": 1});

    if(result){
        if(mobile == result.mobile){
            let cryptoPassword = crypto.createHmac("sha256", password_secret).update(password).digest("hex");
            if(cryptoPassword == result.password){
                res.status(200);
                console.log(result._id);
                let token = jwt.sign({"_id" : result._id}, jwt_secret, { "expiresIn" : '1h'});
                res.cookie("token", token, {"httpOnly": true});
                res.end();
                return;
            }
        }
    }
    
    res.status(401);
    res.end(result);
    return;
    
});

module.exports = loginRouter;