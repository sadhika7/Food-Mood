//Create HTML References.
const textEmail = document.getElementById("textEmail");
const sendEmail = document.getElementById("sendEmail");

errorHeader.style.visibility = "hidden";

sendEmail.addEventListener('click', e => {

    var email = textEmail.value;

    if(email == "") {
        errorHeader.innerText = "Please enter an email."
        errorHeader.style.visibility = "visible";
        return;
    }

    firebase.auth().sendPasswordResetEmail(email).then(function() {

        errorHeader.innerText = "Your password recovery email was sent, please check your email."
        errorHeader.style.visibility = "visible";
        
    }).catch(function(error) {

        var errorCode = error.code;
        if(errorCode === 'auth/user-not-found') {
            errorHeader.innerText = "No account was found with that email address, please Sign Up."
            errorHeader.style.visibility = "visible";
        }

    });

});