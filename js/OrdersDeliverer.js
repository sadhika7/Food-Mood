//Initialize Firestore
firestore = firebase.firestore();

const inProgressDiv = document.getElementById("inProgressDiv");
const pastDiv = document.getElementById("pastDiv");

var email = "";
var orderNumber = 1;
var orders = []

function renderOrders() {
    for(var i=0; i<orders.length; i++) {
        var data = orders[i].data();
        currOrder = orders[i].id;
        if(data.OrderStatus == "Accepted by Restaurant") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" + 
                "<input type='submit' class='btn btn-danger' value='Reject Delivery' id='Order" + orderNumber + "RejectDelivery'>" +
                "<input type='submit' class='btn btn-success' value='Accept Delivery' id='Order" + orderNumber + "AcceptDelivery'>";
            inProgressDiv.appendChild(div);
            addEventListeners(data, orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "Accepted by Deliverer"){
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" + 
                "<p>Pick up the food from the restaurant.</p>";
            inProgressDiv.appendChild(div);
            orderNumber++;
        } else if(data.OrderStatus == "Restaurant Acknowledged Pickup"){
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" + 
                "<input type='submit' class='btn btn-success' value='Mark Pickup' id='Order" + orderNumber + "MarkPickup'>";
            inProgressDiv.appendChild(div);
            addPickupEventListener(data, orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "Delivery en route") {
            var div = document.createElement("div");
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<p>" + data.RestaurantName + "</p>" +
                "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                "<p id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</p>" + 
                "<input type='submit' class='btn btn-success' value='Mark Delivery' id='Order" + orderNumber + "MarkDelivery'>";
            inProgressDiv.appendChild(div);
            addDeliveryEventListener(data, orderNumber, currOrder);
            orderNumber++;
        } else if (data.OrderStatus == "Completed") {
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
        }
    }

}

function addDeliveryEventListener(data, ordNum, currentOrder) {

    const deliveryButton = document.getElementById("Order" + ordNum + "MarkDelivery");

    deliveryButton.addEventListener("click", function() {

        firestore.doc("Users/" + data.OrderingCustomer + "/Orders/" + currentOrder).update({
            "OrderStatus": "Completed"
        }).then(function() {

            firestore.doc("Users/" + email + "/Orders/" + currentOrder).update({
                "OrderStatus": "Completed"
            }).then(function() {

                var orderDiv = deliveryButton.parentElement;
                orderDiv.innerHTML = "<h1>" + orderDiv.id + "</h1>" +
                    "<p>" + data.RestaurantName + "</p>" +
                    "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                    "<p id='Order" + orderNumber + "OrderStatus'>Order Status: Completed</p>" +
                    "<input type='submit' value='Delete' class='btn btn-danger' id='" + orderDiv.id.replace(' ', '') + "DeleteButton'>";
                inProgressDiv.removeChild(orderDiv);
                pastDiv.appendChild(orderDiv);
                addDeleteEventListener(ordNum, currentOrder);

            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });

        }).catch(function(error) {
            console.log("Error updating document: " + error);
        });

    });

}

function addPickupEventListener(data, ordNum, currentOrder) {

    const pickUpButton = document.getElementById("Order" + ordNum + "MarkPickup");

    pickUpButton.addEventListener("click", function() {

        firestore.doc("Users/" + data.OrderingCustomer + "/Orders/" + currentOrder).update({
            "OrderStatus": "Delivery en route"
        }).then(function() {

            firestore.doc("Users/" + email + "/Orders/" + currentOrder).update({
                "OrderStatus": "Delivery en route"
            }).then(function() {

                var orderDiv = pickUpButton.parentElement;
                orderDiv.innerHTML = "<h1>" + orderDiv.id + "</h1>" +
                    "<p>" + data.RestaurantName + "</p>" +
                    "<p>Food Ordered: " + data.FoodOrdered + "</p>" +
                    "<p id='Order" + ordNum + "OrderStatus'>Order Status: Delivery en route</p>" + 
                    "<input type='submit' class='btn btn-success' value='Mark Delivery' id='Order" + ordNum + "MarkDelivery'>";
                addDeliveryEventListener(data, ordNum, currentOrder);

            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });

        }).catch(function(error) {
            console.log("Error updating document: " + error);
        });

    });

}

function addEventListeners(orderData, orderNum, currentOrder) {

    const accDeliv = document.getElementById("Order" + orderNum + "AcceptDelivery");
    const rejDeliv = document.getElementById("Order" + orderNum + "RejectDelivery");

    accDeliv.addEventListener("click", function() {
        firestore.collection("Users").where("UserRole", "==", "Deliverer").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if(doc.id == email) {
                    firestore.doc("Users/" + doc.id + "/Orders/" + currentOrder).update({
                        "OrderStatus": "Accepted by Deliverer",
                        "Deliverer": email
                    }).then(function() {
                        console.log("Successfully updated document!");
                    }).catch(function(error) {
                        console.log("Error updating document: " + error);
                    });
                } else {
                    firestore.doc("Users/" + doc.id + "/Orders/" + currentOrder).delete().then(function() {
                        console.log("Successfully deleted document!");
                    }).catch(function(error) {
                        console.log("Error deleting document: " + error);
                    });
                }

            });

            firestore.doc("Users/" + orderData.OrderingCustomer + "/Orders/" + currentOrder).update({
                "OrderStatus": "Accepted by Deliverer",
                "Deliverer": email
            }).then(function() {

                firestore.doc("Restaurants/" + orderData.RestaurantId + "/Orders/" + currentOrder).update({
                    "OrderStatus": "Accepted by Deliverer",
                    "Deliverer": email
                }).then(function() {
                    document.getElementById("Order" + orderNum + "OrderStatus").innerText = "Order Status: Accepted by Deliverer";
                    var div = accDeliv.parentElement;
                    div.removeChild(accDeliv);
                    div.removeChild(rejDeliv);
                    div.innerHTML = div.innerHTML + "<p>Pick up the food from the restaurant.</p>";
                    console.log("Document successfully updated.");
                }).catch(function(error) {
                    console.log("Error updating document: " + error);
                });

            }).catch(function(error) {
                console.log("Error updating document: " + error);
            });
        }).catch(function(error) {
            console.log("Error getting documents: " + error);
        });
    });

    rejDeliv.addEventListener("click", function() {

        firestore.doc("Users/" + email + "/Orders/" + currentOrder).delete().then(function() {
            var div = rejDeliv.parentElement;
            div.parentElement.removeChild(div);
            console.log("Successfully deleted document!");
        }).catch(function(error) {
            console.log("Error deleting document: " + error);
        });

    });

}

function addDeleteEventListener(ordNum, currentOrder) {

    const delButton = document.getElementById("Order" + ordNum + "DeleteButton");
    delButton.addEventListener("click", function() {
        
        firestore.doc("Users/" + email + "/Orders/" + currentOrder).delete().then(function() {
            console.log("Successfully deleted document!");
            var ref = delButton.parentElement;
            ref.parentElement.removeChild(ref);
        }).catch(function(error) {
            console.log("Error deleting document: " + error);
        });

    });

}

function getOrders() {
    firestore.collection("Users/" + email + "/Orders").orderBy("ServerTimestamp").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            orders.push(doc);
        });
        renderOrders();
    }).catch(function(error) {
        console.log("Error getting documents: " + error);
    });
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
