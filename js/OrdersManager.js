//Initialize Firestore
firestore = firebase.firestore();

const inProgressDiv = document.getElementById("inProgressDiv");
const pastDiv = document.getElementById("pastDiv");
const restPage = document.getElementById("restPage");

var email = "";
var vars = [];
var custEmail = "";
var currOrder = "";
var data = "";
var orders = [];
getUrlVars();
var orderNumber = 1;

function renderOrders() {
    for(var i=0; i<orders.length; i++) {
        var data = orders[i].data();
        currOrder = orders[i].id;
        if(data.OrderStatus == "Rejected") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" +
                "<input type='submit' value='Delete' class='btn btn-danger' id='" + div.id.replace(' ', '') + "DeleteButton'>";
            pastDiv.appendChild(div);
            addDeleteEventListener(orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "Accepted by Restaurant") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" +
                "<p>Waiting for deliverer to accept order</p>";
            inProgressDiv.appendChild(div);
            orderNumber++;
        } else if(data.OrderStatus == "Accepted by Deliverer") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" +
                "<p id='note" + orderNumber + "'>Waiting for deliverer to accept order</p>" + 
                "<input type='submit' value='Mark Deliverer Pickup' class='btn btn-success' id='" + orderNumber + "MarkPickup'>";
            inProgressDiv.appendChild(div);
            addPickupEventListener(data, orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "Restaurant Acknowledged Pickup") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" +
                "<input type='submit' value='Delete' class='btn btn-danger' id='" + div.id.replace(' ', '') + "DeleteButton'>";
            pastDiv.appendChild(div);
            addDeleteEventListener(orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "In Progress - New") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" +
                "<input type='submit' value='Reject' class='btn btn-danger' id='" + div.id.replace(' ', '') + "RejectButton'>" +
                "<input type='submit' value='Accept' class='btn btn-success' id='" + div.id.replace(' ', '') + "AcceptButton'>";
            inProgressDiv.appendChild(div);
            addEventListeners(data, orderNumber, currOrder, data.OrderingCustomer);
            orderNumber++;
        }
    }

}

function addPickupEventListener(data, ordNum, currentOrder) {
    const pickUpButton = document.getElementById(ordNum + "MarkPickup");

    pickUpButton.addEventListener("click", function() {

        firestore.doc("Users/" + data.OrderingCustomer + "/Orders/" + currentOrder).update({
            "OrderStatus": "Restaurant Acknowledged Pickup"
        }).then(function() {

            firestore.doc("Restaurants/" + data.RestaurantId + "/Orders/" + currentOrder).update({
                "OrderStatus": "Restaurant Acknowledged Pickup"
            }).then(function() {

                firestore.doc("Users/" + data.Deliverer + "/Orders/" + currentOrder).update({
                    "OrderStatus": "Restaurant Acknowledged Pickup"
                }).then(function() {
                    var orderDiv = pickUpButton.parentElement;
                    orderDiv.innerHTML = "<h1>" + orderDiv.id + "</h1>" +
                    "<p>" + data.RestaurantName + "</p>" +
                    "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                    "<p id='Order" + orderNumber + "OrderStatus'>Order Status: Restaurant Acknowleged Pickup</p>" +
                    "<input type='submit' value='Delete' class='btn btn-danger' id='" + orderDiv.id.replace(' ', '') + "DeleteButton'>";
                    pastDiv.appendChild(orderDiv);
                    addDeleteEventListener(ordNum, currentOrder);
                    console.log("Successfully updated document!");      
                }).catch(function(error) {
                    console.log("Error updating document: " + error);
                });

                console.log("Successfully updated document!");
            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });

            console.log("Successfully updated document!");
        }).catch(function(error) {
            console.log("Error updating document: " + error);
        });

    });

}

function getOrders() {
    firestore.collection("Restaurants/" + vars['restaurant_id'] + "/Orders").orderBy("ServerTimestamp").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            orders.push(doc);
        });
        renderOrders();
    }).catch(function(error) {
        console.log("Error getting documents: " + error);
    });
}

function addDeleteEventListener(ordNum, currentOrder) {

    const delButton = document.getElementById("Order" + ordNum + "DeleteButton");
    delButton.addEventListener("click", function() {
        
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Orders/" + currentOrder).delete().then(function() {
            console.log("Successfully deleted document!");
            var ref = delButton.parentElement;
            ref.parentElement.removeChild(ref);
        }).catch(function(error) {
            console.log("Error deleting document: " + error);
        });

    });

}

function addEventListeners(data, ordNum, currentOrder, custEmail) {

    const rejButton = document.getElementById("Order" + ordNum + "RejectButton");
    const accButton = document.getElementById("Order" + ordNum + "AcceptButton");
    rejButton.addEventListener("click", function() {
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Orders/" + currentOrder).update({
            "OrderStatus": "Rejected"
        }).then(function() {
            firestore.doc("Users/" + custEmail + "/Orders/" + currentOrder).update({
                "OrderStatus": "Rejected"
            }).then(function() {
                document.getElementById("Order" + ordNum + "OrderStatus").innerText = "Order Status: Rejected";
                var swap = rejButton.parentElement;
                swap.parentElement.removeChild(swap);
                swap.removeChild(rejButton);
                swap.removeChild(accButton);
                swap.innerHTML = swap.innerHTML + 
                    "<input type='submit' value='Delete' class='btn btn-danger' id='" + swap.id.replace(' ', '') + "DeleteButton'>";
                pastDiv.appendChild(swap);
                addDeleteEventListener(ordNum, currentOrder);
                console.log("Document successfully updated.");
            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });
            console.log("Document successfully updated.");
        }).catch(function(error) {
            var orderDiv = rejButton.parentElement;
            orderDiv.innerHTML = "<h1>" + orderDiv.id + "</h1>" + 
                "<p>This order has been cancelled by the customer, please refresh the page.</p>";
            console.log("Error updating document: " + error);
        });
    });

    accButton.addEventListener("click", function() {
        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Orders/" + currentOrder).update({
            "OrderStatus": "Accepted by Restaurant"
        }).then(function() {
            firestore.doc("Users/" + custEmail + "/Orders/" + currentOrder).update({
                "OrderStatus": "Accepted by Restaurant"
            }).then(function() {
                firestore.collection("Users").where("UserRole", "==", "Deliverer").get().then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        firestore.doc("Users/" + doc.id + "/Orders/" + currentOrder).set({
                            "FoodOrdered": data.FoodOrdered,
                            "OrderStatus": "Accepted by Restaurant",
                            "OrderingCustomer": data.OrderingCustomer,
                            "RestaurantId": data.RestaurantId,
                            "RestaurantName": data.RestaurantName,
                            "ServerTimestamp": data.ServerTimestamp
                        }).then(function() {
                            document.getElementById("Order" + ordNum + "OrderStatus").innerText = "Order Status: Accepted by Restaurant";
                            var div = accButton.parentElement;
                            div.removeChild(rejButton);
                            div.removeChild(accButton);
                            div.innerHTML = div.innerHTML + "<p>Waiting for deliverer to accept order</p>";
                            console.log("Document successfully added.");
                        }).catch(function(error) {
                            console.log("Error adding document: " + error);
                        });
                    });
                }).catch(function(error) {
                    console.log("Error getting document: " + error);
                });

            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });
            console.log("Document successfully updated.");
        }).catch(function(error) {
            var orderDiv = accButton.parentElement;
            orderDiv.innerHTML = "<h1>" + orderDiv.id + "</h1>" + 
                "<p>This order has been cancelled by the customer, please refresh the page.</p>";
            console.log("Error updating document: " + error);
        });
    });

}

restPage.addEventListener("click", function() {

    window.location.replace("restaurant.html?restaurant_id=" + vars['restaurant_id']);

});

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
        console.log("The currently logged in user is: " + user.email + ".");
        email = user.email;
        getOrders();
    } else {
        // No user is signed in.
        console.log("No user is signed in");
        window.location.replace("homepage.html");
    }
});
