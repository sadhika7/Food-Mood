//Initialize Firestore
firestore = firebase.firestore();

const description = document.getElementById("form10");
const image = document.getElementById("blah");
const submitFeedback = document.getElementById("feedbackSubmit");
const ratingRadio = document.getElementsByName("rating");
const typeRadio = document.getElementsByName("typeRadio");
const errorHeader = document.getElementById("errorHeader");
const fileButton = document.getElementById("fileButton");

var vars = [];
getUrlVars();

// document.getElementsByName("rating").forEach(function (elm) {
//   if (elm.checked) {
//     ratingRadio = elm.value;
//   }
// });

// document.getElementsByName("inlineMaterialRadiosExample").forEach(function (elm1) {
//   if (elm1.checked) {
//     ratingRadio = elm1.value;
//   }
// });



// var storage = firebase.storage();
// var pathReference = storage.ref('images/IMG_20180906_122757_940.jpg');

// pathReference.getDownloadURL().then(function (url) {
//     console.log(url);
//     pic.src = url;
// }).catch(function (error) {
//     console.log(error);
// });

var email = "";
var type = "";

submitFeedback.addEventListener("click", e => {

    if (type == "") {
        errorHeader.innerText = "Please Choose A FeedBack Type";
        errorHeader.style.display = "inline-block"
        return;
    } else if (description.value == "") {
        console.log("stupid");
        errorHeader.innerText = "Please Enter A Description";
        errorHeader.style.display = "inline-block"
        return;
    }


    errorHeader.innerText = "";
    errorHeader.style.display = "none";
    writeFeedback();
});

fileButton.addEventListener('change', function (e) {

    var file = e.target.files[0];
    var storageRef = firebase.storage().ref('images/' + file.name);
    storageRef.put(file);
    console.log(fileButton.value);

});


function writeFeedback() {

    var feedbackDescription = description.value;
    var feedbackImage = image;
    var rating = getRating();
    if (feedbackImage == "http://placehold.it/180") {
        feedbackImage = "No Image";
    }


    var feedbackRef = firestore.collection("Users").doc(email).collection("feedback").doc();
    var feedbackInfo = {
        UserName: email,
        UserType: type,
        UserDescription: feedbackDescription,
        UserImage: fileButton.value,
        UserRating: rating
    }



    feedbackRef.set(feedbackInfo).then(function () {

        firestore.doc("Users/" + email + "/Orders/" + vars['order_id']).update({
            "FeedbackSubmitted": "True"
        }).catch(function(error) {
            console.log("Error updating document: " + error);
        });

        console.log("Feedback successfully written!");
    }).catch(function (error) {
        console.log("Error writing document: " + error);
    });

}//end writeFeedback

function giveType(feedbackType) {//sets type when clicking a radio button. called from html
    type = feedbackType;
}

function getRating() {
    var rating = 0;
    var i = 0;

    while (!ratingRadio[i].checked) {
        i++;
        if (i == 5) {
            rating = 0;
            return rating;
        }

    }//end while radio !checked
    rating = ratingRadio[i].value;
    return rating;


}//end getRating

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


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        email = user.email;
        console.log("The currently logged in user is: " + email + ".");

        //Check to see if this user is a customer. If not, redirect them to their dashboard.
        firestore.doc("Users/" + email).get().then(function (doc) {

            if (doc.exists) {
                //you good fam nothin to do here
                var docData = doc.data();

            } else {
                // No user is signed in.
                console.log("No user is signed in");
                window.location.replace = "homepage.html";
            }//end if doc.exists
        });//end user get then

    } else {
        console.log("user isn't signed in")
        window.location.replace("homepage.html");
    }//end if user
});//end firebase auth