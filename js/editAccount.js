//Initialize Firestore
firestore = firebase.firestore();

const errorHeader = document.getElementById("errorHeader");
const userName = document.getElementById("acc-name");
const userAddress = document.getElementById("acc-addr");
const userCity = document.getElementById("acc-city");
const userState = document.getElementById("acc-state");
const userZip = document.getElementById("acc-zip");
const userPhone = document.getElementById("acc-phone");
const dashboard = document.getElementById("dashButton");
const saveButton = document.getElementById("saveButton");
const userAccount = document.getElementById("accountButton");
errorHeader.style.visibility = "hidden";
var role = "";

function renderPage(userData) {
    role = userData.UserRole;
    userName.defaultValue = userData.UserName;
    userAddress.defaultValue = userData.UserAddress;
    userCity.defaultValue = userData.UserCity;
    userState.defaultValue = userData.UserState;
    userZip.defaultValue = userData.UserZipCode;
    userPhone.defaultValue = userData.UserPhoneNumber;

};//end renderPage


saveButton.addEventListener("click", e => {

    updateAccount();

});//end save listener

userAccount.addEventListener("click", e => {
    window.location.replace(role + ".html");
});

function checkFields() {

    var fieldsCorrect = true;

    var name = userName.value;
    var address = userAddress.value;
    var city = userCity.value;
    var state = userState.value;
    var zip = userZip.value;
    var phone = userPhone.value;

    var namePattern = RegExp(userName.pattern);
    var addressPattern = RegExp(userAddress.pattern);
    var cityPattern = RegExp(userCity.pattern);
    var statePattern = RegExp(userState.pattern);
    var zipPattern = RegExp(userZip.pattern);
    var phonePattern = RegExp(userPhone.pattern);

    var nameResult = namePattern.test(name);
    var addressResult = addressPattern.test(address);
    var cityResult = cityPattern.test(city);
    var stateResult = statePattern.test(state);
    var zipResult = zipPattern.test(zip);
    var phoneResult = phonePattern.test(phone);

    console.log(nameResult);
    console.log(addressResult);
    console.log(cityResult);
    console.log(stateResult);
    console.log(zipResult);
    console.log(phoneResult);

    if(((!nameResult || !addressResult) || (!cityResult || !stateResult)) || (!zipResult || !phoneResult)) {
        fieldsCorrect = false;
    }

    console.log(fieldsCorrect);

    return fieldsCorrect;

}

function updateAccount() {

    if(checkFields()) {
        var name = userName.value;
        var address = userAddress.value;
        var city = userCity.value;
        var state = userState.value;
        var zip = userZip.value;
        var phone = userPhone.value;
    
        if (name == "") {
            errorHeader.innerText = "Please enter a name."
            errorHeader.style.visibility = "visible";
            console.log("The 'name' field was left empty.");
            return;
        } else if (address == "") {
            errorHeader.innerText = "Please enter an address."
            errorHeader.style.visibility = "visible";
            console.log("The 'address' field was left empty.");
            return;
        } else if (city == "") {
            errorHeader.innerText = "Please enter a city."
            errorHeader.style.visibility = "visible";
            console.log("The 'city' field was left empty.");
            return;
        } else if (state == "") {
            errorHeader.innerText = "Please enter a state."
            errorHeader.style.visibility = "visible";
            console.log("The 'state' field was left empty.");
            return;
        } else if (zip == "" || zip.length != 5) {
            errorHeader.innerText = "Please enter a valid zip code."
            errorHeader.style.visibility = "visible";
            console.log("The 'zip' field was left empty or was not 5 digits.");
            return;
        } else if (phone == "") {
            errorHeader.innerText = "Please enter a phone number."
            errorHeader.style.visibility = "visible";
            console.log("The 'phone number' field was left empty.");
            return;
        } else {
            errorHeader.style.visibility = "hidden";
            firestore.doc("Users/" + email).update({
                UserAddress: address,
                UserCity: city,
                UserName: name,
                UserPhoneNumber: phone,
                UserState: state,
                UserZipCode: zip
            }).then(function () {
                window.location.replace(role + ".html");
            }).catch(function (error) {
                console.error("Error updating document: ", error);
            });//end doc.update.then.catch
        }

    }

}//end updateAccount

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        email = user.email;
        console.log("The currently logged in user is: " + email + ".");

        //Check to see if this user is a customer. If not, redirect them to their dashboard.
        firestore.doc("Users/" + email).get().then(function (doc) {

            if (doc.exists) {

                var docData = doc.data();
                renderPage(docData);

            } else {
                // No user is signed in.
                console.log("No user is signed in");
            }//end if doc.exists
        });//end user get then

    } else {
        console.log("user isn't signed in")
        window.location.replace("homepage.html");
    }//end if user
});
