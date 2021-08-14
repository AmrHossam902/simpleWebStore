const express = require("express");
const {db} = require("./dbController");
const validator = require("./inputValidation");
const fs = require("fs");
const crypto = require("crypto");


let { password_secret } = JSON.parse( fs.readFileSync("./keys/keys.json").toString("utf-8") );

var registerationRouter = express.Router();


registerationRouter.get("/", function(req, res){
    res.sendFile(__dirname + "/views/register.html", function(err){
        res.end();
    });
});


registerationRouter.post("/", async function(req, res){
    var {name, mobile, password, dateOfBirth} = req.body;
    
    if(! validator.validateBirthDate(dateOfBirth)
        || !validator.validateMobile(mobile)
        || name.length == 0
        || password.length < 8){
        res.status(400);
        res.end("incorrect Input");
        return;
    }

    password = crypto.createHmac("sha256", password_secret).update(password).digest("hex");

    var result =  await db.createUser(name, mobile, password, dateOfBirth, Date.now().toString(10));
    console.log(result);
    if(result.succeeded){
        res.status(201);
    }
    else
        res.status(400);
    res.end(JSON.stringify(result));
});

module.exports = registerationRouter;
