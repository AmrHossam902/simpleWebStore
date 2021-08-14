
const express = require("express");
const {db} = require("./dbController");
const validator = require("./inputValidation");
const fs = require("fs");


var productsRouter = express.Router();

productsRouter.get("/", async function(req, res){
    
    console.log(req.query);
    try {
        let page = req.query["page"];
        let order = req.query["order"];
        let filter = req.query["filter"] && JSON.parse(req.query["filter"]);
        let mine = req.query["mine"];

        console.log(page, order, filter, mine);


        var result = await db.getProducts(page,order ,filter, (new Boolean(mine))? req._id: undefined) ;  
    } catch (error) {
        console.log(error);
        res.status(400);
        res.end(error);
        return;
    }
    

    console.log(result);
    res.status(200);
    res.contentType("text/html");
    res.write('<!DOCTYPE html>\
    <html lang="en">\
    <head>\
        <meta charset="UTF-8">\
        <meta http-equiv="X-UA-Compatible" content="IE=edge">\
        <meta name="viewport" content="width=device-width, initial-scale=1.0">\
        <link rel="stylesheet" href="../styles/image.css">\
        <title>Document</title>\
    </head>\
    <body>');

    result.forEach(function(product, i, list){
        res.write( "<div>\
            <h2>" +product.name + "</h2>\
            <h5> Quantity :"+ product.quantity +"</h5>\
            <h5> Price : "+ product.price.toString() +" Egp</h5>\
            <h5> CategoryList : "+ product.categoryList + "</h5>\
            <img src='../uploads/" + product._id.toString() + ".jpg'/>\
        </div><hr/>"); 
    });

    res.end("</body></html>");
});

productsRouter.get("/new", function(req, res){
    res.sendFile(__dirname + "/views/newproduct.html", function(err){
        res.end();
    });
});

productsRouter.post("/new", function(req, res){

    var form = require("formidable").IncomingForm();
    //name, img, owner, price, categoryList, Quantity
    form.parse(req,async function(err, fields, files) {
        if(err){
            res.status(400);
            res.end(err);
            return;
        }

        
        let { name, price, quantity, categories} = fields;
        categories = JSON.parse(categories);
        categories = validator.removeDuplicatedCategories(categories);
        
        if(name.length <2
          || !validator.validatePrice(price)
          || !validator.validateQuantity(quantity) 
          || !validator.validateCategories(categories)
          || !validator.validateImage(files.img)){
              res.status(400);
              res.end("incorrect Input");
              return;
          }
        
        //inset categories first
        await db.addCategories(categories);
        
        //create product
        var result = await db.createProduct(req._id, name, categories, price, quantity);

        //storing image
        
        var perImage = fs.createWriteStream("./public/uploads/" + result.id.toString() + ".jpg", {"flags" : "w"})
        var tmpImage = fs.createReadStream(files.img.path, {"flags" : "r"})
        tmpImage.on("error", function(error){
            console.log(error);
        })
        tmpImage.pipe(perImage);

        tmpImage.on("end", function(){
            fs.rm(files.img.path, function(){});
            tmpImage.close();
            perImage.close();
            res.status(201);
            res.setHeader("Location", "/products/"+result.id.toString());
            res.end();
        })

    });

});

productsRouter.get("/:productId", async function(req, res){
    console.log(req.params["productId"].toString());
    var result = await db.getUniqueProduct(req.params["productId"].toString());

    if(result){
        res.status(200);
        res.contentType("text/html");
        res.write( '<!DOCTYPE html>\
        <html lang="en">\
        <head>\
            <meta charset="UTF-8">\
            <meta http-equiv="X-UA-Compatible" content="IE=edge">\
            <meta name="viewport" content="width=device-width, initial-scale=1.0">\
            <link rel="stylesheet" href="../styles/image.css">\
            <title>Document</title>\
        </head>\
        <body>\
        <div>\
            <h2>' +result.name + '</h2>\
            <h5> Quantity :'+ result.quantity +'</h5>\
            <h5> Price : '+ result.price.toString() +' Egp</h5>\
            <h5> CategoryList : '+ result.categoryList + '</h5>\
            <img src="../uploads/' + result._id.toString() + '.jpg"/>\
        </div>\
        </body></html>');
        res.end();
    }
    else{
        res.status(404);
        res.end();
    }
})



module.exports = productsRouter;