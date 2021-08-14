
function validateMobile(str){
    
    return (new RegExp(/^01\d{9}$/)).test(str);
}

function validateDate(str){
    return (new RegExp(/^\d{6,}$/)).test(str);
}

function validateBirthDate(str){
    let isValidDate = validateDate(str);
    if(!isValidDate)
        return false;
    
    let bDate = Number.parseInt(str);
    let now = Date.now();

    let age = (now - bDate) /(1000 * 60 * 60 * 24 * 30 * 12) ;

    if(age < 18)
        return false;
    else
        return true;
}


function validatePrice(str){
    return (new RegExp(/^\d*(\.)?\d*$/)).test(str);
}

function validateQuantity(str){
    return (new RegExp(/^(\d{1,})$/)).test(str);
}

function validateCategories(list){

    if(!list instanceof Array)
        return false;
    if(list.length == 0)
        return false;

    for(let i=0; i< list.length; i++){
        if(list[i].length == 0)
            return false;
    }

    return true;
}

function removeDuplicatedCategories(categories){

    let set = new Set(categories);
    let unique = [...set];
    return unique;
}

function validateImage(img){
    if(img.size == 0 ||
        img.name.length == 0 ||
        (img.type != "image/jpeg")
    )
        return false;
    else
        return true;
}



module.exports = {
    validateDate, 
    validateMobile, 
    validatePrice, 
    validateQuantity, 
    validateCategories, 
    removeDuplicatedCategories,
    validateImage,
    validateBirthDate
}