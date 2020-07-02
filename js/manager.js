//Initialize Firestore
firestore = firebase.firestore();
"<link rel='stylesheet' href='css/style2.css'>";

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
var refs = [];
// var vars = [];

//Create HTML References
const duplicator = document.getElementById('duplicator');

function renderPage() {
  firestore.collection("Restaurants").where("RestaurantManager", "==", email).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      var data = doc.data();
      var div = document.createElement('div');
      div.innerHTML = '<br><br><h3 id="h">' + data.RestaurantName + '</h3>' +
        '<h3 id="h">' + data.RestaurantAddress + '</h3>' +
        '<button name="' + data.RestaurantName + '" id="' + doc.id + '" type="submit" class="btn btn-success">View Restaurant</button>';
        div.className = 'card card-body font-weight-bold space';
      duplicator.appendChild(div);
      refs.push(document.getElementById(doc.id));
    });
    eventListeners();
  }).catch(function (error) {
    console.log("Error getting documents: " + error);
  });
}

function eventListeners() {

  refs.forEach(function (elem) {
    elem.addEventListener("click", e => {
      window.location.replace("restaurant.html?restaurant_id=" + elem.id);
    });
  });

}

editButton.addEventListener("click", e => {
  window.location.replace("editAccount.html");
});//end editButton listener

// function getUrlVars() {
//   var hash;
//   var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
//   for (var i = 0; i < hashes.length; i++) {
//     hash = hashes[i].split('=');
//     vars.push(hash[0]);
//     vars[hash[0]] = hash[1];
//   }
//   return vars;
// }

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in. Get their email.
    console.log("The currently logged in user is: " + user.email + ".");
    email = user.email;

    //Check to see if this user is a manager. If not, redirect them to their dashboard.
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
        if (role === "Manager") return;
        else if (role === "Customer") window.location.replace("customer.html");
        else if (role === "Deliverer") window.location.replace("deliverer.html");
        else console.log("The value of role is not an accepted value: -" + role + ".");

      } else console.log("The users document does not exist.");

    });

    renderPage();

    // firestore.collection("Restaurant").where("Restaurant Manager", "==", user.email).get().then(function(querySnapshot) {
    //   querySnapshot.forEach(function(doc) {
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // }).catch(function(error) {
    //   console.log("Error getting documents: " + error);
    // });

  } else {
    // No user is signed in. Redirect them to the homepage.
    console.log("No user is signed in, redirecting...");
    window.location.replace("homepage.html");
  }
});
