// Initialize Firestore
firestore = firebase.firestore();

//Create HTML References.
const textEmail = document.getElementById("textEmail");
const textPassword = document.getElementById("textPassword");
const confirmPassword = document.getElementById("confirmPassword");
const nameField = document.getElementById("name");
const addressField = document.getElementById("address");
const cityField = document.getElementById("city");
const stateField = document.getElementById("state");
const zipCodeField = document.getElementById("zipCode");
const phoneNumberField = document.getElementById("phoneNum");
const btnSignUp = document.getElementById("btnSignUp");
const radioRole = document.getElementsByName("role");
const errorHeader = document.getElementById("errorHeader");

//Since there is no initial error, the error message is initially hidden.
errorHeader.style.visibility = "hidden";

//Outside instantiation for scope issues.
var role = " ";
var email = "";
var name = "";
var address = "";
var city = "";
var state = "";
var zipCode = "";
var phoneNumber = "";

//Sign Up Event
btnSignUp.addEventListener("click", e => {
  //Get Email, Password & Role.
  email = textEmail.value.toLowerCase();
  var pass = textPassword.value;
  var confPass = confirmPassword.value;
  name = nameField.value;
  address = addressField.value;
  city = cityField.value;
  state = stateField.value;
  zipCode = zipCodeField.value;
  phoneNumber = phoneNumberField.value;
  role = getRadioVal();

  errorHeader.innerText = "";

  //Error Checking(Seeing if email field is empty, etc.)
  if (email == "") {
    errorHeader.innerText = "Please enter an email address.";
    errorHeader.style.visibility = "visible";
    console.log("The 'email' field was left empty.");
    return;
  } else if (pass == "") {
    errorHeader.innerText = "Please enter a password.";
    errorHeader.style.visibility = "visible";
    console.log("The 'password' field was left empty.");
    return;
  } else if (confPass == "") {
    errorHeader.innerText = "Please confirm your password.";
    errorHeader.style.visibility = "visible";
    console.log("The 'confirm password' field was left empty.");
    return;
  } else if (pass != confPass) {
    errorHeader.innerText = "The 2 passwords do not match.";
    errorHeader.style.visibility = "visible";
    console.log("The passwords do not match");
    return;
  } 
  else if (name == "") {
    errorHeader.innerText = "Please enter your name.";
    errorHeader.style.visibility = "visible";
    console.log("No name was entered.");
    return;
  } else if (address == "") {
    errorHeader.innerText = "Please enter your address.";
    errorHeader.style.visibility = "visible";
    console.log("No address was entered.");
    return;
  } else if (city == "") {
    errorHeader.innerText = "Please enter your city.";
    errorHeader.style.visibility = "visible";
    console.log("No city was entered.");
    return;
  } else if (state == "") {
    errorHeader.innerText = "Please enter your state.";
    errorHeader.style.visibility = "visible";
    console.log("No state was entered.");
    return;
  } else if (zipCode == "") {
    errorHeader.innerText = "Please enter your zipCode.";
    errorHeader.style.visibility = "visible";
    console.log("No zipCode was entered.");
    return;
  } else if (phoneNumber == "") {
    errorHeader.innerText = "Please enter a phone number.";
    errorHeader.style.visibility = "visible";
    console.log("No phone number was entered.");
    return;
  } else if (role == " ") {
    errorHeader.innerText = "Please select a role.";
    errorHeader.style.visibility = "visible";
    console.log("No role was selected.");
    return;
  }

  //Sign Up
  firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function (error) {
      var errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        errorHeader.innerText =
          "Email already has an account, please sign in";
        errorHeader.style.visibility = "visible";
        console.log("The provided email is already being used.");
      } else if (errorCode === "auth/invalid-email") {
        errorHeader.innerText = "The provided email is not valid.";
        errorHeader.style.visibility = "visible";
        console.log("The provided email is not a valid format.");
      } else if (errorCode === "auth/weak-password") {
        errorHeader.innerText =
          "The password provided is too weak, please choose another.";
        errorHeader.style.visibility = "visible";
        console.log("The provided password is not strong enough.");
      }
    });
});

//Detecting Sign-In.
firebase.auth().onAuthStateChanged(function (user) {
  //User is signed in.
  if (user) {
    //Creates the users file in the database.
    firestore.collection("Users").doc(email).set({
        UserEmail: email,
        UserName: name,
        UserAddress: address,
        UserCity: city,
        UserState: state,
        UserZipCode: zipCode,
        UserRole: role,
        UserPhoneNumber: phoneNumber
      })
      .then(function () {
        console.log("Document successfully written!");

        //Redirect user to the dashboard for their role.
        if (role === "Customer") window.location.replace("customer.html");
        else if (role === "Manager") window.location.replace("manager.html");
        else if (role === "Deliverer")
          window.location.replace("deliverer.html");
        else
          console.log(
            "The value of role is not an accepted value: " + role + "."
          );
      })
      .catch(function (error) {
        console.log("Error writing document: " + error);
      });
  }
});

//Iterates over the "Role" radio buttons and returns the value of the selected radio button.
function getRadioVal() {
  var val = " ";
  for (var i = 0, len = radioRole.length; i < len; i++) {
    if (radioRole[i].checked) {
      val = radioRole[i].value;
      break;
    }
  }
  return val;
}
