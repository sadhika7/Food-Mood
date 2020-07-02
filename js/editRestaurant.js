//Initialize Firestore
firestore = firebase.firestore();

var email = "";
var vars = [];

//Create HTML References.
const restName = document.getElementById("restName");
const restAddress = document.getElementById("restAddress");
const restCity = document.getElementById("restCity");
const restState = document.getElementById("restState");
const restZip = document.getElementById("restZip");
var restPhoneNumber = document.getElementById("restPhoneNumber");
const restTags = document.getElementById("restTags");
const errorHeader = document.getElementById('errorHeader');
var Sbutton = document.getElementById("Sbutton");

errorHeader.style.visibility = "hidden";



function renderFilters() {

    firestore.doc("Tags/Tags").get().then(function (doc) {

        if (doc && doc.exists) {

            var data = doc.data();
            var filters = data.Tags.split(", ");

            filters.forEach(element => {

                restTags.innerHTML += "<option value='" + element + "'>" + element + "</option>";

            });

        }

    })

}

function renderPage() {

    firestore.collection("Restaurants").doc(vars['restaurant_id']).get().then(function (doc) {
        if (doc.exists) {

            var docData = doc.data();
            restName.defaultValue = docData.RestaurantName;
            restAddress.defaultValue = docData.RestaurantAddress;
            restCity.defaultValue = docData.RestaurantCity;
            restState.defaultValue = docData.RestaurantState;
            restZip.defaultValue = docData.RestaurantZip;
            restPhoneNumber.defaultValue = docData.RestaurantPhoneNumber;
            // fileButton.defaultValue = docData.RestaurantImage;
            populateTags(docData.RestaurantTags);
        } else console.log("The restaurant document does not exist.");

    }).catch(function (error) {

        console.log("The restaurant document does not exist.");
        console.log(error);

    });

}

function populateTags(string) {

    var tagsArray = string.split(",");
    var tagsIndex = 0;

    for (var i = 0; i < restTags.length; i++) {
        if (tagsArray[tagsIndex] === restTags[i].value) {
            restTags[i].setAttribute("selected", "selected");
            tagsIndex++;
        }
    }

}

//thank you for this function xD
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

function getTagsString() {

    var tagsArray = getSelections(restTags);
    var string = "";

    console.log(tagsArray);

    tagsArray.forEach(element => {

        string += element + ",";

    });

    string = string.substring(0, string.length - 1);

    return string;

}

function getSelections(select) {

    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;

}

console.log("The currently logged in user is: " + email + ".");

Sbutton.addEventListener('click', e => {
    var name = restName.value;
    var address = restAddress.value;
    var city = restCity.value;
    var state = restState.value;
    var zip = restZip.value;
    var phoneNumber = restPhoneNumber.value;
    var tags = getTagsString();
    // var image = fileButton.value;

    if (name == "") {
        errorHeader.innerText = "Please enter a restaurant name."
        errorHeader.style.visibility = "visible";
        console.log("The 'name' field was left empty.");
        return;
    } else if (address == "") {
        errorHeader.innerText = "Please enter a restaurant address."
        errorHeader.style.visibility = "visible";
        console.log("The 'address' field was left empty.");
        return;
    } else if (city == "") {
        errorHeader.innerText = "Please enter a restaurant city."
        errorHeader.style.visibility = "visible";
        console.log("The 'city' field was left empty.");
        return;
    } else if (state == "") {
        errorHeader.innerText = "Please enter a restaurant state."
        errorHeader.style.visibility = "visible";
        console.log("The 'state' field was left empty.");
        return;
    } else if (zip == "") {
        errorHeader.innerText = "Please enter a restaurant zip."
        errorHeader.style.visibility = "visible";
        console.log("The 'zip' field was left empty.");
        return;
    } else if (phoneNumber == "") {
        errorHeader.innerText = "Please enter a restaurant phone number."
        errorHeader.style.visibility = "visible";
        console.log("The 'phoneNumber' field was left empty.");
        return;
    }


    if (vars[0] == "restaurant_id") {//edit existing rest // you clicked edit information
        firestore.collection("Restaurants").doc(vars['restaurant_id']).update({
            "RestaurantName": name,
            "RestaurantAddress": address,
            "RestaurantCity": city,
            "RestaurantState": state,
            "RestaurantZip": zip,
            "RestaurantPhoneNumber": phoneNumber,
            "RestaurantTags": tags
        }).then(function () {
            console.log("Document Successfully Updated.");
            window.location.replace("restaurant.html?restaurant_id=" + vars['restaurant_id']);
        }).catch(function (error) {
            console.log("Error updating document: " + error);
        });
    } else {//create a new menu // you clicked create your restaurant
        var newRestRef = firestore.collection("Restaurants").doc();
        var restInfo = { //if email is changed, rest manager will be lost
            "RestaurantManager": email,
            "RestaurantName": name,
            "RestaurantAddress": address,
            "RestaurantCity": city,
            "RestaurantState": state,
            "RestaurantZip": zip,
            "RestaurantPhoneNumber": phoneNumber,
            "RestaurantTags": tags
        };
        console.log("newRestRef: " + newRestRef);
        console.log("id: " + newRestRef.id);
        console.log(restInfo);
        newRestRef.set(restInfo).then(function () {
            //original menu made on restaurant creation.
            var newMenuRef = firestore.collection("Restaurants").doc(newRestRef.id).collection("Menus").doc();
            var menuInfo = { "MenuName": name + " Complete Menu", "ParentRestaurant": newRestRef.id };
            newMenuRef.set(menuInfo).then(function () {
                console.log("Document Successfully Written.");
                window.location.replace("restaurant.html?restaurant_id=" + newRestRef.id);
            }).catch(function (error) {
                console.log("Error Creating the Menu Document." + error);
            });

        }).catch(function (error) {
            console.log("Error writing document to Restaurant Collection: " + error);
            console.log("restinfo: " + restInfo);
            console.log("id: " + restInfo.id);
        });

    }

});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        email = user.email;
        console.log("The currently logged in user is: " + email + ".");
        getUrlVars();
        renderFilters();
        if (vars[0] == "restaurant_id") renderPage();
    } else {
        // No user is signed in.
        console.log("No user is signed in");
    }
});
