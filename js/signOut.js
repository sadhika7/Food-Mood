//Create HTML Reference.
const signOut = document.getElementById("signOut");

//Sign-Out Event.
signOut.addEventListener('click', e=> {

    firebase.auth().signOut();

});

firebase.auth().onAuthStateChanged(function(user) {

    //User is signed in.
    if(user) {
    }
    //User is not signed in.
    else window.location.replace("homepage.html");

});