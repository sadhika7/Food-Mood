// Initialize Firestore.
firestore = firebase.firestore();

firebase.auth().signOut();

//Create HTML References.
const textEmail = document.getElementById("textEmail");
const textPassword = document.getElementById("textPassword");
const btnSignIn = document.getElementById("btnSignIn1");
const errorHeader = document.getElementById("errorHeader");

//Since there is no initial error, the error message is initially hidden.
errorHeader.style.visibility = "hidden";

//Outside instantiation for scope issues.
var email = " ";
var role = " ";

//Sign-In Event.
btnSignIn.addEventListener("click", e => {
  //Get Email and Password.
  email = textEmail.value.toLowerCase();
  var pass = textPassword.value;

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
  }

  //Sign In (More technical error checking: wrong password, invalid account, etc.)
  firebase
    .auth()
    .signInWithEmailAndPassword(email, pass)
    .catch(function (error) {
      var errorCode = error.code;
      if (errorCode === "auth/user-not-found") {
        errorHeader.innerText =
          "No account was found with that email address, please Sign Up.";
        errorHeader.style.visibility = "visible";
        console.log("The provided email is has not been signed up with.");
      } else if (errorCode === "auth/wrong-password") {
        errorHeader.innerText =
          "Incorrect password for the given email.";
        errorHeader.style.visibility = "visible";
        console.log(
          "The provided password does not match the email's account password."
        );
      } else console.log(error);
    });
});

//Detect Sign-In
firebase.auth().onAuthStateChanged(function (user) {
  //User is signed in.
  if (user) {
    //Accesses users document & sets the appropriate value for role
    var docRef = firestore.collection("Users").doc(email);
    docRef.get().then(function (doc) {
      if (doc.exists) {
        var docData = doc.data();
        role = docData.UserRole;
        //Redirect user to the dashboard for their role.
        if (role === "Customer") window.location.replace("customer.html");
        else if (role === "Manager") window.location.replace("manager.html");
        else if (role === "Deliverer")
          window.location.replace("deliverer.html");
        else
          console.log(
            "The value of role is not an accepted value: -" + role + "."
          );
      } else {
        console.log("The users document does not exist.");
        firebase.auth().signOut();
      }
    });
  }
});
