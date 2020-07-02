//Initialize Firestore
firestore = firebase.firestore();

const submitButton = document.getElementById("Sbutton");
const menuName = document.getElementById("menuName");
const errorHeader = document.getElementById("errorHeader");
const foodDuplicator = document.getElementById('foodDuplicator');
const addFoodButton = document.getElementById('AddFoodButton');
const newFoodPrice = document.getElementById('newFoodPrice');
const newFoodName = document.getElementById('newFoodName');
const newDescription = document.getElementById('newDescription');
const newSpiceLevel = document.getElementById('newSpiceLevel');
const deleteMenuButton = document.getElementById('DeleteMenuButton');
const restPage = document.getElementById("restPage");

errorHeader.style.visibility = "hidden";

var vars = [];
//we need some destructuring so we can just say menu.get().then()...
//we need to pull repeating functions into one callable function, like how I did with addFood


//this function only runs after the user is authenticated
//AND there is a menu_id in the url
//which means they must be trying to edit, not create.
function renderPage() {

    firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).get().then(function (doc) {
        if (doc && doc.exists) {
            var data = doc.data();
            //fill menu name
            menuName.defaultValue = data.MenuName;
            //list existing food
            firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc(vars['menu_id']).collection("Food").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();
                    var FoodName = data.FoodName
                    var FoodPrice = data.FoodPrice;
                    var FoodDescription = data.FoodDescription;
                    var FoodSpiceLevel = data.FoodSpiceLevel;
                    console.log(data);
                    var div = document.createElement('div');
                    //here is whats going inside the duplicator div when first rendered.
                    div.innerHTML = '<div id="' + FoodName + 'Div">' +
                        '<p>' +
                        '<input type="submit" value="Edit Food Item" class="btn btn-info" state ="unclicked" id="EditFoodButton' + FoodName + '"></input>' +
                        ' ' + FoodName + ' - $' + FoodPrice +
                        '<br>'+ '->' +
                        FoodDescription+
                        '<br>'+ '->Spice Level: '+
                        FoodSpiceLevel+
                        '</p>' +
                        '</div>';
                    foodDuplicator.appendChild(div);
                    handleFoodDiv(doc.id, FoodName, FoodPrice,FoodDescription,FoodSpiceLevel);
                });
            }).catch(function (error) {
                console.log("Error getting documents: " + error);
            });
            //end foodDuplicator div
        } else console.log("The menu document does not exist.");
    }).catch(function (error) {
        console.log("Error getting menu document: " + error);
    });
}//end renderPage


function handleFoodDiv(foodId, FoodName, FoodPrice, FoodDescription, FoodSpiceLevel) {
    var foodDiv = document.getElementById(FoodName + "Div");
    var editButton = document.getElementById("EditFoodButton" + FoodName);

    editButton.addEventListener("click", e => {
        foodDiv.innerHTML = '<div id="duringEdit' + FoodName + '">' +
            '<input type="submit" class="btn btn-danger" value="Discard Changes" id="DiscardEditButton' + FoodName + '"></input>' +
            '<br>'+
            '<hr>'+
            ' Food Name: <input type="text" size="20" id="edit' + FoodName + '">' + '<br>'+
            ' Food Price: $ <input type="double" size="2" id="edit' + FoodPrice + '">' + ' '+ '<br>'+
            ' Veg/Non-Veg: <input type="text" size="14" id="edit' + FoodDescription + '">' + ' '+ '<br>'+
            ' Spice Level: <input type="double" size="2" id="edit' + FoodSpiceLevel + '">' + ' '+
            '<br>'+
            '<hr>'+
            '<input type="submit" class="btn btn-success" value="Update" id="SubmitEditButton' + FoodName + '"></input>' + ' ' +
            '<hr'+
            '<br>'+
            '<input type="submit" class="btn btn-danger" value="DELETE" id="DeleteFoodButton' + FoodName + '"></input>' +
            '</div><hr/>';
        foodNameInput = document.getElementById("edit" + FoodName);
        priceInput = document.getElementById("edit" + FoodPrice);
        descriptionInput = document.getElementById("edit"+FoodDescription);
        spiceLevel = document.getElementById("edit"+FoodSpiceLevel);
        foodNameInput.defaultValue = FoodName;
        priceInput.defaultValue = FoodPrice;
        descriptionInput.defaultValue = FoodDescription;
        spiceLevel.defaultValue = FoodSpiceLevel;
        discardEditButton = document.getElementById("DiscardEditButton" + FoodName);
        updateFoodButton = document.getElementById("SubmitEditButton" + FoodName);
        deleteFoodButton = document.getElementById("DeleteFoodButton" + FoodName);

        discardEditButton.addEventListener("click", e => {
            foodDiv.innerHTML = '<div id="' + FoodName + 'Div">' +
                '<p>' +
                '<input type="submit" class="btn btn-success" value="Edit" id="EditFoodButton' + FoodName + '"></input>' +
                + FoodName + ' - $' + FoodPrice + ' -> '+
                '<br>'+
                FoodDescription+ ' -> '+
                '<br>'+ 'Spice Level'+
                FoodSpiceLevel+
                '</p>' +
                '</div>';
            handleFoodDiv(foodId, FoodName, FoodPrice, FoodDescription, FoodSpiceLevel);
        });//end discard listener

        updateFoodButton.addEventListener("click", e => {
            if (foodNameInput.value == "") {
                errorHeader.innerText = "Please enter a Name for your Food Item.";
                errorHeader.style.visibility = "visible";
                console.log("The Food Name field was left empty.");
                return;
            } else if (priceInput.value == "") {
                errorHeader.innerText = "Please enter a Price for your Food Item.";
                errorHeader.style.visibility = "visible";
                console.log("The Food Price field was left empty.");
                return;
            } else if (foodNameInput.value != "" && priceInput.value != "") {
                console.log("update in progress")
            } else {
                console.log("if you see this, add more conditions")
            }//end text field conditions if

            updateFood(foodId, foodNameInput.value, priceInput.value, descriptionInput.value, spiceLevel.value);
            setTimeout(backToMenu, 2000);
        });//end update listener

        deleteFoodButton.addEventListener("click", e => {//need some sort of "confirm delete" thing
            deleteFood(foodId);
            setTimeout(backToMenu, 2000);
        });//end delete listener
    });//end editButton listener

}//end handleFoodDiv

function backToMenu() {
    window.location.replace("editMenu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
}

restPage.addEventListener("click", e => {

    window.location.replace("restaurant.html?restaurant_id=" + vars['restaurant_id']);

});

//either set new menu, or update existing menu//redirect to menu.html?...
submitButton.addEventListener("click", e => {
    name = menuName.value;
    // console.log(checkMenuName());

    //text fields will probably still accept space bar as acceptable input :(
    if (name == "") {
        errorHeader.innerText = "Please enter a Menu Name.";
        errorHeader.style.visibility = "visible";
        console.log("The 'menuName' field was left empty.");
        return;
    } else if (newFoodName.value != "" && newFoodPrice.value == "") {
        errorHeader.innerText = "Please enter a Price for your New Food Item.";
        errorHeader.style.visibility = "visible";
        console.log("The 'Food Price' field was left empty.");
        return;
    } else if (newFoodName.value == "" && newFoodPrice.value != "") {
        errorHeader.innerText = "Please enter a Name for your New Food Item.";
        errorHeader.style.visibility = "visible";
        console.log("The 'Food Name' field was left empty.");
        return;
    } else if (newFoodName.value == "" && newFoodPrice.value == "") {
        console.log("all clear");
    } else {
        console.log("Whoops, you forgot to add that new food item. Let me get that for you :)");
    }//end text field IF conditions


    if (vars[1] == "menu_id") {//restaurant exists, update with this info then redirect // you got here by clicking edit information
        //UPDATE MENU
        if (newFoodName.value == "" && newFoodPrice.value == "") {//new food item fields are empty, only update menu info
            firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).update({
                "MenuName": name,
            }).then(function () {
                console.log("Document successfully Updated.");
                window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
            }).catch(function (error) {
                console.log("Error updating menu: " + error + ".");
            });
        } else if (newFoodName.value != "" && newFoodPrice != "" && newDescription != "" && newSpiceLevel != "") {//new food item fields aren't empty, update menu AND set new food item
            firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).update({
                "MenuName": name,
            }).then(function () {//updated menu, now add new food item too
                console.log("Document successfully Updated.");
                addFood(newFoodName.value, newFoodPrice.value, newDescription.value, newSpiceLevel.value, vars['menu_id']);
                window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
            }).catch(function (error) {
                console.log("Error updating menu: " + error + ".");
            });
        } else {
            console.log("how TF you do that")
        }//end if

    } else {//CREATE MENU
        //restaurant does not exist // you got here by clicking add menu
        //get docReference of next doc (newMenuRef).This contains firestore info of doc including the unique .id
        //save text field info as parameters for menu
        //create new menu doc using the newMenuRef and give it menuInfo
        //Redirect to new url
        if (newFoodName.value == "" && newFoodPrice.value == "" && newDescription.value == "" && newSpiceLevel.value == "") {//new food item fields are empty, only set menu info
            var newMenuRef = firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc();
            var menuInfo = { "MenuName": name, "ParentRestaurant": vars['restaurant_id'] };
            newMenuRef.set(menuInfo).then(function () {
                console.log("Document successfully written.");
                window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + newMenuRef.id);
            }).catch(function (error) {
                console.log("Error writing document: " + error + ".");
            });
        } else if (newFoodName.value != "" && newFoodPrice.value != "" && newDescription.value!="" && newSpiceLevel.value!="") {//new food item fields aren't empty, set menu AND set new food item
            var newMenuRef = firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc();
            var menuInfo = { "MenuName": name, "ParentRestaurant": vars['restaurant_id'] };
            newMenuRef.set(menuInfo).then(function () {
                console.log("Document successfully written.");
                addFood(newFoodName.value, newFoodPrice.value, newDescription.value, newSpiceLevel.value, newMenuRef.id);
                window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + newMenuRef.id);
            }).catch(function (error) {
                console.log("Error writing document: " + error + ".");
            });
        } else {
            console.log("fatal error: document will now self destruct -g")
        }//end if newfood text != "" , create menu, else create menu AND food
    }//end if create menu
});//end submit button Event Listener

//DELETE ENTIRE MENU
deleteMenuButton.addEventListener("click", e => {
    if (vars[1] == "menu_id") {
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).delete().then(function () {
            console.log("Menu successfully deleted!");
            window.location.replace("restaurant.html?restaurant_id=" + vars['restaurant_id']);
        }).catch(function (error) {
            console.error("Error removing document: ", error);
        });
    } else {
        errorHeader.innerText = "You must create a Menu before it can be deleted!"
        errorHeader.style.visibility = "visible";
    }//end if
});//end delete menu button listener

//add 1 food item,menu info can't be blank
addFoodButton.addEventListener("click", e => {
    name = menuName.value;
    errorHeader.innerText = "";

    //text fields will probably still accept space bar as acceptable input :(
    if (name == "") {
        errorHeader.innerText = "Please enter a Menu Name.";
        errorHeader.style.visibility = "visible";
        console.log("The 'menuName' field was left empty.");
        return;
    } else if (newFoodName.value != "" && newFoodPrice.value == "") {
        errorHeader.innerText = "Please enter a Price for your New Food Item.";
        errorHeader.style.visibility = "visible";
        console.log("The 'Food Price' field was left empty.");
        return;
    } else if (newFoodName.value == "" && newFoodPrice.value != "") {
        errorHeader.innerText = "Please enter a Name for your New Food Item.";
        errorHeader.style.visibility = "visible";
        console.log("The 'Food Name' field was left empty.");
        return;
    } else if (newFoodName.value == "" && newFoodPrice.value == "") {
        errorHeader.innerText = "Please enter a Name and Price for your New Food Item.";
        errorHeader.style.visibility = "visible";
        console.log("both fields left empty");
        return;
    } else if (newFoodName.value != "" && newFoodPrice.value != "") {
        console.log("Both Fields contain info, continue to creation!");
    } else {
        console.log("need another condition")
    }//end text field IF conditions

    //create the food item AND update menu JIC new info, then Redirect back to correct editmenu.html?...
    if (vars[1] == 'menu_id') {//adding food item to existing menu // you came from edit menu information
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).update({
            "MenuName": name,
        }).then(function () {//updated menu, now add new food item too
            console.log("Menu successfully Updated.");
            addFood(newFoodName.value, newFoodPrice.value, newDescription.value, newSpiceLevel.value, vars['menu_id']);
            window.location.replace("editMenu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
        }).catch(function (error) {
            console.log("Error updating menu: " + error + ".");
        });
    } else {//adding food item to a menu that will need to be created right here and now // you came from add menu
        var newMenuRef = firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc();
        var menuInfo = { "MenuName": name, "ParentRestaurant": vars['restaurant_id'] };
        newMenuRef.set(menuInfo).then(function () {
            console.log("Menu successfully written.");
            console.log(newMenuRef.id);
            addFood(newFoodName.value, newFoodPrice.value, newDescription.value , newSpiceLevel.value, newMenuRef.id);
            window.location.replace("editMenu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + newMenuRef.id);
        }).catch(function (error) {
            console.log("Error writing document: " + error + ".");
        });
    }
});//end addFoodButton listener

function getUrlVars() {
    var hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}//end getUrlVars

// function checkFoodName() {
//make sure entered food name doesn't already exist. this would mess up the function of this page
// }//end checkFoodName

function deleteFood(name) {
    firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id'] + "/Food/" + name).delete().then(function () {
        errorHeader.innerText = "Delete In Progress! Please Wait..."
        errorHeader.style.visibility = "visible";
        console.log("Food successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}//end deleteFood

function updateFood(foodId, newName, newPrice, newDescription, newSpiceLevel) {
    firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id'] + "/Food/" + foodId).update(
        {
            "FoodName": newName,
            "FoodPrice": newPrice,
            "FoodDescription":newDescription,
            "FoodSpiceLevel":newSpiceLevel
        }).then(function () {
            errorHeader.innerText = "Update In Progress! Please Wait..."
            errorHeader.style.visibility = "visible";
            console.log("Food successfully Updated.");
        }).catch(function (error) {
            console.log("Error writing Food: " + error + ".");
        });
}//end updateFood

function addFood(newName, newPrice, newDescription, newSpiceLevel, parentMenu) {
    var newFoodRef = firestore.collection("/Restaurants/" + vars['restaurant_id'] + "/Menus/" + parentMenu + "/Food/").doc();
    var foodInfo = {
        "FoodName": newName,
        "FoodPrice": newPrice,
        "FoodDescription": newDescription,
        "FoodSpiceLevel":newSpiceLevel,
        "ParentMenu": parentMenu
    };
    newFoodRef.set(foodInfo).then(function () {
        console.log("Food successfully written.");
    }).catch(function (error) {
        console.log("Error writing Food: " + error + ".");
    });
}//end addFood

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        email = user.email;
        console.log("The currently logged in user is: " + email + ".");
        getUrlVars();
        if (vars[1] == "menu_id") renderPage();
    } else {
        // No user is signed in.
        console.log("No user is signed in");
    }
});//end auth
