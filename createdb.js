const mongo = require("mongodb");

(new mongo.MongoClient("mongodb://localhost:27017/store")).connect()
.then( function(client){
    let result1 = createUserCollection(client);
    let result2 = createProductCollection(client);
    let result3 = createWatchListCollection(client);
    let result4 = createCategoryCollection(client);

    Promise.all([result1, result2, result3, result4]).then(function(){
        console.log("collections created succesfully");
        client.close();
    });

}).catch(function(err){
    console.log(err);
});



async function createUserCollection(client){
    await client.db().createCollection("user", {
        "validator" : {
            "$jsonSchema" : {
                "bsonType" : "object",
                "required" : [ "name", "mobile", "password", "dateOfBirth", "createdAt"],
                "properties" : {
                    "name" : {
                        "bsonType" : "string",
                        "description" : "the real user name"
                    },
                    "mobile" : {
                        "bsonType" : "string",
                        "pattern" : "^01[0-9]{9}$",
                        "description" : "mobile number of the user"
                    },
                    "dateOfBirth" : {
                        "bsonType" : "long"
                    },
                    "password" : {
                        "bsonType" : "string"
                    },
                    "createdAt" : {
                        "bsonType" : "long"
                    }
                }
            }
        }
    });
    return client.db().collection("user").createIndex({"mobile": 1}, {"unique" : true});
    
}

async function createProductCollection(client){

    await client.db().createCollection("product", {
        "validator" : {
            "$jsonSchema" : {
                "bsonType" : "object",
                "required" : [ "owner", "name", "categoryList", "price", "quantity", "createdAt"],
                "properties" : {
                    
                    "name": {
                        "bsonType" : "string",
                        "description" : "product's name"
                    },
                    "owner" : {
                        "bsonType" : "objectId",
                        "description" : "id of the product's owner"
                    },
                    "categoryList" : {
                        "bsonType" : "array",
                        "items" : {
                            "bsonType" : "string"
                        }
                    },
                    "price" : {
                        "bsonType" : "decimal",
                        "minimum" : 0,
                        "description" : "price of the product"
                    },
                    "quantity" : {
                        "bsonType" : "int",
                        "minimum" : 0
                    },
                    "createdAt" : {
                        "bsonType" : "long"
                    }
                }
            }
        }
    });
    
    return client.db().collection("product").createIndex({"price" : 1});
    
}

async function createWatchListCollection(client){

    return client.db().createCollection("watchList", {
        "validator": {
            "$jsonSchema" : {
                "bsonType" : "object",
                "required" : ["name", "userId", "products", "createdAt"],
                "properties" : {
                    "name" : {
                        "bsonType" : "string",
                        "description" : "name of the list"
                    },
                    "userId" : {
                        "bsonType" : "objectId",
                        "description" : " owner of the list"
                    },
                    "products" : {
                        "bsonType" : "array",
                        "description" : "products Ids in the list",
                        "items" : {
                            "bsonType" : "objectId"
                        }
                    },
                    "createdAt" : {
                        "bsonType" : "long",
                        "description" : " time stamp when the list was created"
                    }
                }
            }
        }
    });
    

}

async function createCategoryCollection(client){

    await client.db().createCollection("category", {
        "validator" : {
            "$jsonSchema" : {
                "bsonType" : "object",
                "properties" : {
                    "name" : {
                        "bsonType" : "string"
                    },
                    "createdAt" : {
                        "bsonType" : "long"
                    }
                } 
            }
        }
    });
    return client.db().collection("category").createIndex({"name" : 1}, {"unique": true});
}


