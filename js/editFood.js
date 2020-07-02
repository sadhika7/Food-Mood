//Initialize Firestore
firestore = firebase.firestore();

const submitFoodButton = document.getElementById("Sbutton");
const FoodName = document.getElementById("FoodName");
const FoodPrice = document.getElementById("FoodPrice");
const errorHeaderFood = document.getElementById("errorHeader");

errorHeaderFood.style.visibility = "hidden";

var name = "";
var price = "";
var vars = [];

getUrlVars();

//some instances accessing firebase we are using firestore.collection().doc().collection().doc()
//and dome are using firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id'])...
//we should probably stick to one or the other, but I think that for destructuring, the second one is the only way, and its shorter too
//because we can't save an entire collection to a variale, but we can for a doc.
//I will leave it like this for now because the first way is easy to visualize 

//this function only runs after the user is authenticated
//AND there is a food_id in the url
//which means they must be trying to edit, not create, SO, fill the text fields
function renderPage() {
    firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc(vars['menu_id']).collection("Food").doc(vars['food_id']).get().then(function (doc) {
        if (doc.exists) {
            var docData = doc.data();
            FoodName.defaultValue = docData.FoodName;
            FoodPrice.defaultValue = docData.FoodPrice;
        } else console.log("The Food document does not exist.");
        console.log(vars);
    }).catch(function (error) {
        console.log("The Food document does not exist.");
        console.log(error);
    });
}//end renderPage



submitFoodButton.addEventListener("click", e => {

    name = FoodName.value;
    price = FoodPrice.value;
    errorHeaderFood.innerText = "";
    // console.log(checkFoodName());

    if (name == "") {//THE TEXT FIELDS WILL PROBABLY ACCEPT SPACE BAR ALONE//PLZ FIX ME
        errorHeaderFood.innerText = "Please enter a Food Name."
        errorHeaderFood.style.visibility = "visible";
        console.log("The 'Food Name' field was left empty.");
        return;
    } else if (price == "") {
        errorHeaderFood.innerText = "Please enter a Food Price."
        errorHeaderFood.style.visibility = "visible";
        console.log("The 'Food Price' field was left empty.");
        return;
    }

    if (vars[2] == "food_id") {
        //food exists, update with this info then redirect // you got here by clicking edit food //not yet a thing
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id'] + "/Food/" + vars['food_id']).update({
            "FoodName": name,
            "FoodPrice": price
        }).then(function () {
            console.log("Document successfully Updated.");
            window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
        }).catch(function (error) {
            console.log("Error writing document: " + error + ".");
        });
    } else {//food doesn't exist// you clicked add food item
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id'] + "/Food/" + vars['food_id']).set(
            {
                "FoodName": name,
                "FoodPrice": price,
                "ParentMenu": vars['menu_id']
            }).then(function () {
                console.log("Document successfully written.");
                window.location.replace("menu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
            }).catch(function (error) {
                console.log("Error writing document: " + error + ".");
            });
    }//end if
});//end submit button Event Listener


function getUrlVars() {
    var hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// function checkFoodName() {
//still need this?
// }//end checkFoodName

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        email = user.email;
        console.log("The currently logged in user is: " + email + ".");
        getUrlVars();
        if (vars[2] == "food_id") renderPage();
    } else {
        // No user is signed in.
        console.log("No user is signed in");
    }
});