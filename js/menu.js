//Initialize Firestore
firestore = firebase.firestore();
"<link rel='stylesheet' href='css/style2.css'>";
var email = "";
var vars = [];
var refs = [];

const menuName = document.getElementById("menuName");
const editButton = document.getElementById("editButton");
const deleteButton = document.getElementById("delete");
const restPage = document.getElementById("restPage");
const foodDuplicator = document.getElementById('foodDuplicator');
const addFoodButton = document.getElementById("addFoodButton");
const FoodName = document.getElementById("FoodName");
const FoodPrice = document.getElementById("FoodPrice");
const FoodDescription = document.getElementById("FoodDescription");
const FoodSpiceLevel = document.getElementById("FoodSpiceLevel");
const accDashboard = document.getElementById("accDashboard");
const menuHeader = document.getElementById("menuHeader");
const bottom1 = document.getElementById("bottom1");
const bottom2 = document.getElementById("bottom2");
const bottom3 = document.getElementById("bottom3");
const cartCounter = document.getElementById("cartCounter");
const cartButton = document.getElementById("cartButton");
const modalBody = document.getElementById("modalBody");
cartButton.style.display = "none";
getUrlVars();



function managerPage() {

    cartButton.parentElement.removeChild(cartButton);

    menuHeader.innerHTML = "Food Items In Your Menu";
    firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).get().then(function (doc) {
        if (doc && doc.exists) {
            var data = doc.data();
            menuName.innerText = data.MenuName;
            //create divs for showing food items
            firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc(vars['menu_id']).collection("Food").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();
                    console.log(data);
                    var div = document.createElement('div');
                    div.innerHTML = '<p>' + data.FoodName + ' - $' + data.FoodPrice + '<br>'+ data.FoodDescription+ '<br>'+'Spice Level: '+data.FoodSpiceLevel+'</p>';
                      div.className = 'card card-body fixed float-left space font-weight-bold';
                    foodDuplicator.appendChild(div);
                });
            }).catch(function (error) {
                console.log("Error getting documents: " + error);
            });
            //end foodDuplicator div
        } else
            console.log("The menu document doesn't exist");
        console.log(vars);
    });

    editButton.addEventListener("click", e => {
        window.location.replace("editMenu.html?restaurant_id=" + vars['restaurant_id'] + "&menu_id=" + vars['menu_id']);
    });

    deleteButton.addEventListener("click", e => {

        firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).delete().then(function () {
            console.log("Document successfully deleted!");
            window.location.replace("restaurant.html?restaurant_id=" + vars['restaurant_id']);
        }).catch(function (error) {
            console.log("Error deleting document: " + error);
        });

    });
    accDashboard.href = "manager.html";

}

var cartCount = 0;
var quantityCount = 0;

function customerPage() {

    cartButton.style.display = "block";

    editButton.parentNode.removeChild(editButton);
    deleteButton.parentNode.removeChild(deleteButton);
    accDashboard.href = "customer.html";
    menuHeader.innerHTML = "Start Your Order";
    bottom1.innerHTML = "Order your favourite meal from your favourite restaurant!";
    bottom2.innerHTML = "Place an order and chill! Your food will be on the way!";
    bottom3.innerHTML = "Expect to have a very smooth food mood experience!";

    //get cart count and put correct number next to cart button
    firestore.collection("Users/" + email + "/cart").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            docData = doc.data();
            quantityCount += (docData.Quantity);
            cartCount = quantityCount;
        });//end foreach
        if (cartCount == 0) {
            //do nothing
        } else {
            cartCounter.innerText = cartCount;
        }
    });//end get.then

    //show all food items in the menu
    firestore.doc("Restaurants/" + vars['restaurant_id'] + "/Menus/" + vars['menu_id']).get().then(function (doc) {
        if (doc && doc.exists) {
            var data = doc.data();
            menuName.innerText = data.MenuName;
            //create divs for showing food items
            firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc(vars['menu_id']).collection("Food").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();
                    console.log(data);
                    var div = document.createElement('div');
                    div.innerHTML = '<div"><p>' + data.FoodName + ' - $' + data.FoodPrice + '<br>'+ data.FoodDescription+ '<br>'+ 'Spice Level: '+ data.FoodSpiceLevel+'</p>' +
                        '<button id="' + doc.id + '" type="submit" class="btn btn-success">Add To Cart</button><div class="popup"><span class="popuptext" id="popup' + doc.id + '">Item Added To Cart</span></div></div>';
                    div.className = 'card card-body fixed float-left space font-weight-bold';
                    foodDuplicator.appendChild(div);
                });//end forEach
                //issues with listener.. get all food again and set listeners
                firestore.collection("Restaurants").doc(vars['restaurant_id']).collection("Menus").doc(vars['menu_id']).collection("Food").get().then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        var data = doc.data();
                        handleAddToCart(doc.id, data.FoodName, data.FoodPrice);
                    });
                }).catch(function (error) {
                    console.log("Error getting documents: " + error);
                });//end second .get.then.forEach.catch

            }).catch(function (error) {
                console.log("Error getting documents: " + error);
            });
            //end foodDuplicator div
        } else {
            console.log("menu doesn't not found");
            console.log(vars);
        }//end if doc && doc.exists
    });

}//end CustomerPage

// var sameRestBool = false;

function handleAddToCart(docId, FoodName, FoodPrice) {

    var addToCartButton = document.getElementById(docId);
    var popup = document.getElementById("popup" + docId);
    var intPrice = parseFloat(FoodPrice);
    addToCartButton.addEventListener("click", e => {
        console.log("clicked addtocart btn for " + docId);

        sameRest();
        //check if item clicked is from the same restaurant
        function sameRest() {
            var cartRef = firestore.collection("Users/" + email + "/cart");

            //see if there are any items in the cart at all
            cartRef.get().then(querySnapshot => {
                if (querySnapshot.empty) {//cart must be empty
                    putInCart();
                    popup.innerText = "Item Added To Cart";
                            popup.classList.add("show");
                            setTimeout(function () {
                                popup.classList.remove("show");
                            }, 1950);
                } else {//cart is not empty
                    var query = cartRef.where("ParentRest", "==", vars['restaurant_id']).get().then(querySnapshot => {
                        if (querySnapshot.empty) {//that item is from a different rest, dont allow
                            console.log("That Item is from a different Restaurant than other cart items, that's not allowed");
                            popup.innerText = "Only Pick From One Restaurant";
                            popup.classList.add("showBad");
                            setTimeout(function () {
                                popup.classList.remove("showBad");
                            }, 3950);
                        } else {//item is from same rest, this is good
                            //popup.. plz help me edit the location of which this pops up via popup.css
                           putInCart();
                            popup.innerText = "Item Added To Cart";
                            popup.classList.add("show");
                            setTimeout(function () {
                                popup.classList.remove("show");
                            }, 1950);
                        }//end if query2Snapshot.empty
                    }).catch(err => {
                        console.log('Error getting document', err);
                    });//end query2

                }//end if query1Snapshot.empty
            }).catch(err => {
                console.log('Error getting document', err);
            });//end query

        }//end sameRest

        function putInCart() {
            cartCount += 1;
            cartCounter.innerText = cartCount;

            //get all items in cart, gets food that exists if you are adding multiple
            //FoodName/FoodPrice/Quantity are set to the cart item, not the menu item, sorry that I used the same name
            var cartRef = firestore.collection("Users/" + email + "/cart");
            var query = cartRef.where("FoodName", "==", FoodName).get().then(querySnapshot => {
                if (querySnapshot.empty) {//that item isnt in cart yet
                    console.log("that food item isnt in cart yet, lets add 1");
                    var itemCount = 1;
                    firestore.doc("Users/" + email + "/cart/" + FoodName).set({
                        FoodName: FoodName,
                        FoodPrice: intPrice,
                        Quantity: itemCount,
                        TotalCost: intPrice,
                        ParentRest: vars['restaurant_id']
                    }).then(function () {
                        console.log("cart item successfully written!");
                        fillCart();
                        var itemQuantity = document.getElementById("quantity" + docId);
                        itemQuantity.innerText = "Quantity: 1";
                    }).catch(function (error) {
                        console.log("Error writing document: " + error);
                    });

                } else {//cart has the item
                    querySnapshot.forEach(function (doc) {
                        var data = doc.data();
                        console.log("found the same food you added to cart already in cart, get quantity and set it")
                        var itemCount = data.Quantity;
                        firestore.doc("Users/" + email + "/cart/" + FoodName).update({
                            Quantity: itemCount += 1,
                            TotalCost: intPrice * (itemCount)
                        }).then(function () {
                            console.log("Document successfully updated!");
                        }).catch(function (error) {
                            console.log("Error updating document: " + error);
                        });
                        console.log("itemcount: " + itemCount);
                    });//end foreach
                }//end if

            }).catch(err => {
                console.log('Error getting document', err);
            });
        }//end putInCart



    });//end addtocartButton listener
}//end handleAddToCart

restPage.addEventListener("click", e => {
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




//cart modal functions, sorry for confusion.
///////////////////////////////////////////

// var cartCount = 0;
var itemTotal = 0;
var total = 0;

function fillCart() {
    var listNumber = 0;
    total = 0;

    firestore.collection("Users/" + email + "/cart").get().then(function (querySnapshot) {

        querySnapshot.forEach(function (itemDoc) {
            docData = itemDoc.data();

            total += docData.TotalCost;
            listNumber += 1;

            // console.log("cartCount: " + cartCount);
            // console.log("total: " + total.toFixed(2));
            // console.log("docdata.totalcost: " + docData.TotalCost);
            // console.log("docquantity: " + docData.Quantity);
            var div = document.createElement('div');
            div.innerHTML = '<br><div id="' + itemDoc.id + 'Div">' +
                '<p>' + listNumber + '. ' +
                docData.FoodName + ' - $' + docData.FoodPrice +
                '<p id="quantity' + itemDoc.id + '">' +
                'Quantity: ' + docData.Quantity + '  ' +
                '</p>' +
                '<span><button id="takeOne' + itemDoc.id + '" type="button" class="btn btn-info">-</button>' + ' ' +
                '<button id="addOne' + itemDoc.id + '" type="button" class="btn btn-info">+</button>' + ' ' +
                '<button id="delete' + itemDoc.id + '" type="button" class="btn btn-danger">Remove</button></span>' +
                '</p>' +
                '</div>';
            modalBody.appendChild(div);
            handleQuantity(itemDoc.id, docData.FoodPrice, docData.Quantity);
        });//end foreach
        if (cartCount == 0) {
            subtotal.innerText = "Your Cart Is Empty";
        } else {
            subtotal.innerText = " ";
            subtotal.innerText = "Cart Subtotal (" + cartCount + " items): $" + total.toFixed(2) + "";
        }
    });//end get.then
}//end fillCart

function handleQuantity(docId, price, quantity) {

    var addOne = document.getElementById("addOne" + docId);
    var takeOne = document.getElementById("takeOne" + docId);
    var deleteAll = document.getElementById("delete" + docId);
    var quantityNumber = document.getElementById("quantity" + docId);

    addOne.addEventListener("click", e => {
        console.log("addOne" + docId);
        cartCount++;
        total += price;
        quantity++;
        itemTotal = quantity * price;
        subtotal.innerText = "Cart Subtotal (" + cartCount + " items): $" + total.toFixed(2) + "";
        quantityNumber.innerText = "Quantity: " + quantity + "";
        cartCounter.innerText = cartCount;
        console.log("newindvPrice: " + itemTotal);
        updateCart(docId, itemTotal, quantity)
    });

    takeOne.addEventListener("click", e => {
        console.log("takeOne" + docId);
        cartCount--;
        total -= price;
        quantity--;
        itemTotal = quantity * price;
        if (quantity <= 0) {//not allowed to make quantity negative. DONT LET THEM
            total += price;
            cartCount++;
            quantity++;
            return;
        }//end if
        subtotal.innerText = "Cart Subtotal (" + cartCount + " items): $" + total.toFixed(2) + "";
        quantityNumber.innerText = "Quantity: " + quantity + "";
        console.log("newindvPrice: " + itemTotal);
        cartCounter.innerText = cartCount;
        updateCart(docId, itemTotal, quantity)
    });

    deleteAll.addEventListener("click", e => {
        console.log("deleting:" + docId);
        cartCount -= quantity;
        itemTotal = quantity * price;
        total -= itemTotal;
        if (total <= 0) {//dont allow negative total or weird negative 0 to show up
            total = 0;
        }//end if
        subtotal.innerText = "Cart Subtotal (" + cartCount + " items): $" + total.toFixed(2) + "";
        cartCounter.innerText = cartCount;
        deleteItem(docId);
    });

}//end handleQuantity

function updateCart(foodId, newTotal, newQuantity) {
    firestore.doc("Users/" + email + "/cart/" + foodId).update(
        {
            "Quantity": newQuantity,
            "TotalCost": newTotal
        }).then(function () {
            console.log("Food successfully Updated.");
        }).catch(function (error) {
            console.log("Error writing Food: " + error + ".");
        });
}//end updateFood

function deleteItem(foodId) {
    var itemDiv = document.getElementById(foodId + "Div")
    itemDiv.parentNode.removeChild(itemDiv);
    firestore.doc("Users/" + email + "/cart/" + foodId).delete().then(function () {
        console.log("Food successfully deleted!");

    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}//end deleteItem

cartButton.addEventListener("click", e => {
    //remove the items in the cart modal and reload them just incase it changed
    while (modalBody.firstChild) {
        modalBody.removeChild(modalBody.firstChild);
    }
    fillCart();
})

checkout.addEventListener("click", e => {
    window.location.replace("orderCart.html");
})
//////////////////////////////////////////

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        console.log("The currently logged in user is: " + user.email + ".");
        email = user.email;

        firestore.doc("/Users/" + email).get().then(function (doc) {

            if (doc.exists) {

                var docData = doc.data();
                var role = docData.UserRole;

                //Redirect user to the dashboard for their role.
                if (role === "Manager") managerPage();
                else if (role === "Customer") customerPage();
                else if (role === "Deliverer") return;
                else console.log("The value of role is not an accepted value: -" + role + ".");

            } else console.log("The users document does not exist.");

        });
    } else {
        // No user is signed in.
        console.log("No user is signed in");
    }
});
