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
        if((data.OrderStatus == "Rejected" || data.OrderStatus == "Cancelled") || (data.OrderStatus == "Completed" && data.FeedbackSubmitted == "True")) {
            var div = document.createElement("div");
              "<br>";
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<h3>" + data.RestaurantName + "</h3>" +
                "<h5>Food Ordered: " + data.FoodOrdered + "</h5>" +
                "<h5 id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</h5>" +
                "<input type='submit' value='Delete' class='btn btn-danger' id='" + div.id.replace(' ', '') + "DeleteButton'>" + "<hr>";
            pastDiv.appendChild(div);
            addDeleteEventListener(orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "Completed" && data.FeedbackSubmitted == "False") {
            var div = document.createElement("div");
              "<br>";
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<h3>" + data.RestaurantName + "</h3>" +
                "<h5>Food Ordered: " + data.FoodOrdered + "</h5>" +
                "<h5 id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</h5>" +
                "<input type='submit' value='Delete' class='btn btn-danger' id='" + div.id.replace(' ', '') + "DeleteButton'>" + 
                "<input type='submit' value='Feedback' class='btn btn-success' id='" + div.id.replace(' ', '') + "FeedbackButton'>" + "<hr>";
            pastDiv.appendChild(div);
            addDeleteEventListener(orderNumber, currOrder);
            addFeedbackEventListener(orderNumber, currOrder);
            orderNumber++;
        } else if(data.OrderStatus == "In Progress - New" || data.OrderStatus == "In progress") {
            var div = document.createElement("div");
            "<br>";
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<h3>" + data.RestaurantName + "</h3>" +
                "<h5>Food Ordered: " + data.FoodOrdered + "</h5>" +
                "<h5 id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</h5>" +
                "<input type='submit' value='Cancel Order' class='btn btn-danger' id='" + div.id.replace(' ', '') + "CancelButton'>"+'<hr>';
                "<hr>";
            inProgressDiv.appendChild(div);
            addCancelEventListener(data, orderNumber, currOrder);
            orderNumber++;
        } else {
            var div = document.createElement("div");
              "<br>";
            div.id = "Order " + orderNumber;
            div.innerHTML = "<h1>" + div.id + "</h1>" +
                "<h3>" + data.RestaurantName + "</h3>" +
                "<h5>Food Ordered: " + data.FoodOrdered + "</h5>" +
                "<h5 id='Order" + orderNumber + "OrderStatus'>Order Status: " + data.OrderStatus + "</h5>"+'<hr>';
                "<hr>";
            inProgressDiv.appendChild(div);
            orderNumber++;
        }
    }

}

function addCancelEventListener(data, ordNum, currentOrder) {

    const canButton = document.getElementById("Order" + ordNum + "CancelButton");
    canButton.addEventListener("click", function() {

        firestore.doc("Users/" + email + "/Orders/" + currentOrder).update({
            "OrderStatus": "Cancelled"
        }).then(function() {

            firestore.doc("Restaurants/" + data.RestaurantId + "/Orders/" + currentOrder).delete().then(function() {
                var ref = canButton.parentElement;
                ref.innerHTML = "<h1>" + ref.id + "</h1>" +
                    "<h3>" + data.RestaurantName + "</h3>" +
                    "<h5>Food Ordered: " + data.FoodOrdered + "</h5>" +
                    "<h5 id='Order" + ordNum + "OrderStatus'>Order Status: Cancelled</h5>" +
                    "<input type='submit' value='Delete' class='btn btn-danger' id='" + ref.id.replace(' ', '') + "DeleteButton'>"+'<hr>';
                    "<hr>";
                ref.parentElement.removeChild(ref);
                pastDiv.appendChild(ref);
                addDeleteEventListener(ordNum, currentOrder);
                console.log("Successfully deleted document!");
            }).catch(function(error) {
                console.log("Error deleting document: " + error);
            });

        }).catch(function(error) {
            console.log("Error deleting document: " + error);
        });

    });

}

function addFeedbackEventListener(ordNum, currentOrder) {

    const feedbackButton = document.getElementById("Order" + ordNum + "FeedbackButton");
    feedbackButton.addEventListener("click", function() {

        window.location.replace("appFeedback.html?order_id=" + currentOrder);

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
