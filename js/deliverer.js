//Initialize Firestore
firestore = firebase.firestore();

const nameField = document.getElementById("userName");
const addressField = document.getElementById("userAddress");
const cityField = document.getElementById("userCity");
const stateField = document.getElementById("userState");
const zipField = document.getElementById("userZip");
const emailField = document.getElementById("userEmail");
const phoneNumberField = document.getElementById("userPhone");
const editButton = document.getElementById("editButton");

var name = "";
var address = "";
var city = "";
var state = "";
var zip = "";
var email = "";
var phoneNumber = "";

editButton.addEventListener("click", function() {

  window.location.replace("editAccount.html");

});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in. Get their email.
    console.log("The currently logged in user is: " + user.email + ".");
    email = user.email;

    //Check to see if this user is a customer. If not, redirect them to their dashboard.
    firestore.doc("/Users/" + email).get().then(function (doc) {

      if (doc.exists) {

        var docData = doc.data();
        var role = docData.UserRole;

        nameField.innerText = docData.UserName;
        addressField.innerText = docData.UserAddress;
        cityField.innerText = docData.UserCity;
        stateField.innerText = docData.UserState;
        zipField.innerText = docData.UserZipCode;
        emailField.innerText = docData.UserEmail;
        phoneNumberField.innerText = docData.UserPhoneNumber;

        //Redirect user to the dashboard for their role.
        if (role === "Deliverer") return;
        else if (role === "Manager") window.location.replace("manager.html");
        else if (role === "Customer") window.location.replace("customer.html");
        else console.log("The value of role is not an accepted value: -" + role + ".");

      } else console.log("The users document does not exist.");

    });

  } else {
    // No user is signed in. Redirect them to the homepage.
    console.log("No user is signed in, redirecting...");
    window.location.replace("homepage.html");
  }
});