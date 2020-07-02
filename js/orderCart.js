//Initialize Firestore
firestore = firebase.firestore();

const subtotalText = document.getElementById("Subtotal");
const deliveryFeeText = document.getElementById("Delivery");
const totalText = document.getElementById("Total");
const tipRadio = document.getElementsByName("options");
const otherTip = document.getElementById("otherTip");
const tipAmount = document.getElementById("TipAmount");
const submitOtherPerc = document.getElementById("submitOther%");
const submitOtherDoll = document.getElementById("submitOther$");
const tipExplain = document.getElementById("tipExplain");
const placeOrder = document.getElementById("placeOrder");
const restPage = document.getElementById("restPage");
const ccName = document.getElementById("cc-name");
const ccNum = document.getElementById("cc-number");
const ccExp = document.getElementById("cc-exp");
const ccCode = document.getElementById("x_card_code");
const ccZip = document.getElementById("x_zip");

var email = "";
var subtotal = 0;
var deliveryFee = 5;
var total = 0;
var tipAmnt = 0;
var parentRest = "";
getRadioVal();

//gets total of all items in the customer's cart
function renderTotals() {

    firestore.collection("Users/"+email+"/cart").get().then(function(querySnapshot) {
        parentRest = querySnapshot.docs[0].data().ParentRest;
        console.log(parentRest);

        querySnapshot.forEach(function(doc) {
            var data = doc.data();
            subtotal = subtotal + data.TotalCost;
        });

        subtotalText.innerHTML = "$"+subtotal.toFixed(2);
        deliveryFeeText.innerHTML = "$"+deliveryFee.toFixed(2);
        total = subtotal + deliveryFee;
        tipAmnt = total*tip;
        total = total + tipAmnt;
        tipAmount.innerHTML = "$" + tipAmnt.toFixed(2);
        totalText.innerHTML = "$" + total.toFixed(2);

    }).catch(function(error) {
        console.log("Error getting documents: " + error);
    });

}

function updateTotal() {

    total = subtotal + deliveryFee;
    tipAmnt = total*tip;
    total = total + tipAmnt;
    tipAmount.innerHTML = "$" + tipAmnt.toFixed(2);
    totalText.innerHTML = "$" + total.toFixed(2);

}

function updateTotalDollarAmnt() {

    total = subtotal + deliveryFee;
    tipAmnt = parseFloat(tip);
    total = total + tipAmnt;
    tipAmount.innerHTML = "$" + tipAmnt.toFixed(2);
    totalText.innerHTML = "$" + total.toFixed(2);

}

restPage.addEventListener("click", function() {
            
    window.location.replace("restaurant.html?restaurant_id=" + parentRest);

});

function checkCard() {

    var filledOut = true;

    var namePatt = RegExp(ccName.pattern);
    var nameVal = ccName.value;
    var nameResult = namePatt.test(nameVal);  
    
    var numPatt = RegExp(ccNum.pattern);
    var numVal = ccNum.value;
    var numResult = numPatt.test(numVal);

    var expPatt = RegExp(ccExp.pattern);
    var expVal = ccExp.value;
    var expResult = expPatt.test(expVal);

    var zipPatt = RegExp(ccZip.pattern);
    var zipVal = ccZip.value;
    var zipResult = zipPatt.test(zipVal);

    var codePatt = RegExp(ccCode.pattern);
    var codeVal = ccCode.value;
    var codeResult = codePatt.test(codeVal);

    console.log(nameResult);
    console.log(numResult);
    console.log(expResult);
    console.log(zipResult);
    console.log(codeResult);

    if(((!nameResult || !numResult) || (!expResult || !zipResult)) || !codeResult) {
        filledOut = false
    }

    return filledOut;

}

placeOrder.addEventListener("click", function() {

    if(checkCard()) {

        var parentRest = "";
        var foodOrdered = [];
        var time = Date.now();
        firestore.collection("Users/" + email + "/cart").get().then(function(querySnapshot) {
            var data = querySnapshot.docs[0].data();
            parentRest = data.ParentRest;
    
            querySnapshot.forEach(function(doc) {
                var data = doc.data();
                foodOrdered.push(data.FoodName + ":" + data.Quantity);
            });
    
            firestore.collection("Users/" + email + "/cart").get().then(function(cartSnapshot) {
    
                cartSnapshot.forEach(function(doc) {
                    firestore.doc("Users/" + email + "/cart/" + doc.id).delete().then(function() {
                        console.log("Document successfully deleted.");
                    }).catch(function(error) {
                        console.log("Error deleting document: " + error);
                    });
                });
    
                firestore.doc("Restaurants/" + parentRest).get().then(function(doc) {
    
                    var data = doc.data();
    
                    firestore.collection("Users/" + email + "/Orders").add({
                        "RestaurantId": parentRest,
                        "RestaurantName": data.RestaurantName,
                        "OrderingCustomer": email,
                        "FoodOrdered": foodOrdered,
                        "OrderStatus": "In Progress - New",
                        "ServerTimestamp": time,
                        "FeedbackSubmitted": "False"
                    }).then(function(docRef){
                        console.log("Order successfully written to customer!");
    
                        firestore.doc("Restaurants/" + parentRest + "/Orders/" + docRef.id).set({
                            "RestaurantId": parentRest,
                            "RestaurantName": data.RestaurantName,
                            "OrderingCustomer": email,
                            "FoodOrdered": foodOrdered,
                            "OrderStatus": "In Progress - New",
                            "ServerTimestamp": time
                        }).then(function(){
                            console.log("Order successfully placed to restaurant!");
                            window.location.replace("OrdersCustomer.html");
                        }).catch(function(error) {
                            console.log("Error writing to database: " + error);
                        });
    
                    }).catch(function(error) {
                        console.log("Error writing to database: " + error);
                    });
    
                }).catch(function(error) {
                    console.log("Error getting document: " + error);
                });
    
            }).catch(function(error) {
                console.log("Error getting documents: " + error);
            });
    
        }).catch(function(error) {
            console.log("Error getting documents: " + error);
        });

    } else console.log("Card fields incomplete.");


});

submitOtherPerc.addEventListener("click", function() {

    tip = otherTip.value;
    tip = tip.replace(/[^0-9.]/g, "");
    updateTotal();

});

submitOtherDoll.addEventListener("click", function() {

    tip = otherTip.value;
    tip = tip.replace(/[^0-9.]/g, "");
    updateTotalDollarAmnt();

});

function getRadioVal() {
    otherTip.style.display = "none";
    submitOtherPerc.style.display = "none";
    submitOtherDoll.style.display = "none";
    tipExplain.style.display = "none";
    for (var i = 0, len = tipRadio.length; i < len; i++) {
      if (tipRadio[i].checked) {
        tip = tipRadio[i].value;
        break;
      }
    }
    if(tip != "Other%" && tip != "Other$") updateTotal();
    else if(tip == "Other%") {
        otherTip.value = "";
        otherTip.style.display = "block";
        submitOtherPerc.style.display = "block";
        tipExplain.innerHTML = "Enter tip amount in decimal format. <br> (ex: 5% is 0.05)";
        tipExplain.style.display = "block";
    } else if(tip == "Other$") {
        otherTip.value = "";
        otherTip.style.display = "block";
        submitOtherDoll.style.display = "block";
        tipExplain.innerText = "Enter tip amount in dollars:";
        tipExplain.style.display = "block";
    }
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log("The currently logged in user is: " + user.email + ".");
        email = user.email;
        renderTotals();
        
    } else {
        // No user is signed in.
        console.log("No user is signed in");
        window.location.replace("homepage.html");
    }
});