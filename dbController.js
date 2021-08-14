
const mongo = require("mongodb");
const url = "mongodb://localhost:27017/store";

function Controller(){

}

Controller.client = null;
Controller.createConnection = async function(){
    if(Controller.client) return Controller.client;

    return Controller.client = new mongo.MongoClient(url).connect();
}


Controller.prototype.createUser = async function(name, mobile, password, dob, createdAt){
    
    var client = await Controller.createConnection();

    return client.db().collection("user").insertOne({
        "name" : name,
        "mobile" : mobile,
        "dateOfBirth" : new mongo.Long(dob, true),
        "password" : password,
        "createdAt" : new mongo.Long(createdAt, true)
    }).then( function(result){
        console.log(result);
        return { succeeded : true, id: result.insertedId }
    }).catch(function(err){
        console.log(err);
        if(err.code == 1100)
            return { succeeded : false, reason: "duplicate"};
        else if(err.code == 121)
        console.log(err);
        return { succeeded : false, reason: "invalid"}; 
   
        });

}

Controller.prototype.getUser = async function(mobile, projection){
    var client = await Controller.createConnection();

    return client.db().collection("user").findOne({"mobile": mobile},{ "projection": projection });
}

Controller.prototype.createCategory = async function(name){
    var client = await Controller.createConnection();

    return client.db().collection("category")
        .insertOne({ 
            "name" : name,
             "createdAt" : new mongo.Long((Date.now().toString(10)))
        })
        .then( function(result){
            console.log(result);
            return { succeeded : true, id: result.insertedId }
        }).catch(function(err){
            console.log(err);
            if(err.code == 1100)
                return { succeeded : false, reason: "duplicate"};
            else if(err.code == 121)
            console.log(err);
            return { succeeded : false, reason: "invalid"}; 
       
            });
        ;
}

Controller.prototype.createCategory = async function(name){

    var client = await Controller.createConnection();
    
    return client.db().collection("category").insertOne({ "name" : name, "createdAt" :  new mongo.Long(Date.now().toString(10))})
    .then((result)=>{
        return { succeeded : true, id: result.insertedId }
    })
    .catch((err)=>{
        return { succeeded : false, reason: "duplicate" }
    });
}

Controller.prototype.addCategories = async function(categories){

    categories.forEach(async function(category ) {
        await Controller.prototype.createCategory(category);
    });
}


Controller.prototype.createProduct = async function(ownerId, name, categories, price, quantity ){

    let client = await Controller.createConnection();

    return client.db().collection("product").insertOne({
        "name" : name,
        "owner" : new mongo.ObjectId(ownerId),
        "categoryList" : categories,
        "price" : new mongo.Decimal128(price),
        "quantity":new mongo.Int32(quantity),
        "createdAt" : new mongo.Long(Date.now().toString(10))
    })
    .then( function(result){
        console.log(result);
        return { succeeded : true, id: result.insertedId }
    }).catch(function(err){
        console.log(err);
        return { succeeded : false, reason: "invalid"}; 
   });

}


Controller.prototype.getProducts = async function(page, order, categories,ownerId){

    let pageSize = 4;
    if(!page) page = 0;

    let sortDoc = { price: 1};
    let query = {};


    if(categories)
     query = {"categoryList" : {"$in" : categories}};
    
    if(ownerId){
        if(categories){
            query = { "$and": [ {"owner": mongo.ObjectId(ownerId)}, query ] }
        }else{
            query = {"owner": mongo.ObjectId(ownerId)};
        }
    }

    if(order == "DESC")
        sortDoc = {price: -1};


    let client = await Controller.createConnection();
    return client.db().collection("product").find(query).sort(sortDoc).skip(page * pageSize).limit(pageSize).toArray()
    .then(function(result){
        return result;
    })
    .catch(function(error){
        return [];
    });

}


Controller.prototype.getUniqueProduct = async function(id){

    var client = await Controller.createConnection();

    return client.db().collection("product").findOne({ "_id" : new mongo.ObjectId(id)})
    .then(function(result){
        return result;
    })
    .catch(function(err){
        return null;
    })
}


module.exports.db = new Controller();
