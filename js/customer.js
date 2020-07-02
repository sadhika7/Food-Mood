//Initialize Firestore
"<link rel='stylesheet' href='css/style2.css'>";
firestore = firebase.firestore();

const nameField = document.getElementById("userName");
const addressField = document.getElementById("userAddress");
const cityField = document.getElementById("userCity");
const stateField = document.getElementById("userState");
const zipField = document.getElementById("userZip");
const emailField = document.getElementById("userEmail");
const phoneNumberField = document.getElementById("userPhone");
const searchSection = document.getElementById("searchSection");
const itemSummary = document.getElementById("itemSummary");
const subtotal = document.getElementById("subtotal");
const checkout = document.getElementById("checkout");
const cartButton = document.getElementById("cartButton");
const editButton = document.getElementById("editButton");
const searchBar = document.getElementById("searchbar");
const filterRestTab = document.getElementById("filterRest");
const filterFoodTab = document.getElementById("filterFood");
const ordersButton = document.getElementById("ordersButton");
const notifyHeader = document.getElementById("notifyHeader");
const cbSection = document.getElementById("checkboxSection");

notifyHeader.style.visibility = "hidden";

var name = "";
var address = "";
var city = "";
var state = "";
var zip = "";
var email = "";
var phoneNumber = "";
var restaurants = [];
var restIDs = [];
var filtersUsed = [];
var filteredRestaurants = [];
var filteredRestIDs = [];
var menus = [];
var filteredMenus = [];
var fullRests = [];
// var filteredRestaurants = [];

filterRestTab.click();

filterRestTab.addEventListener("click", e => {

  if (filterRestTab.className == "active") {
    console.log("On Filter Restaurant Tab");
    return;
  }

  reRenderRestaurants(fullRests);
  uncheckTags();

});//end filterRestTab listener

filterFoodTab.addEventListener("click", e => {

  if (filterFoodTab.className == "active") {
    console.log("On Filter Food Tab");
    return;
  }


  reRenderRestaurants(fullRests);
  uncheckTags();

});//end mapTab listener

function changeTab(newTab) {

  if (newTab == "findRest") {
    filterRestTab.click(); //gotta click this again to make it active
  } else if (newTab == "findFood") {
    filterFoodTab.click(); //gotta click this again to make it active
  }//end if

}//end changeTab

function renderRestaurants() {

  while (searchSection.firstChild) {//remove any existing restaurant cards
    searchSection.removeChild(searchSection.firstChild);
  }

  filtersUsed = [];
  restaurants = [];
  restIds = [];
  menus = [];
  fullRests = [];
  menus = [];

  firestore.collection("Restaurants").get().then(function (documents) {

    documents.forEach(function (doc) {
      var data = doc.data();
      var div = document.createElement("div");
      div.innerHTML = "<h3 style='color:#006400;'>" + data.RestaurantName + "</h3>"
        + "<button id='" + doc.id + "' type=submit class='btn btn-success'>View Restaurant</button>";
      div.className = 'card card-body fixed space float-left font-weight-bold';
      searchSection.appendChild(div);
      restaurants.push(data); //wow I should have been doing this instead of .get multiple times #imDumb
      restIDs.push(doc.id);

      // console.log(data);
      var tempRest = {
        Name: data.RestaurantName,
        Id: doc.id,
        Menus: [],
        RestTags: data.RestaurantTags
      };//end tempRest

      // console.log(tempRest)
      // console.log(fullRests);

      firestore.collection("Restaurants/" + doc.id + "/Menus").get().then(function (documents) {

        documents.forEach(function (docc) {
          var dataa = docc.data();
          var tempMenu = {
            Name: dataa.MenuName,
            Id: docc.id,
            Food: []
          };

          firestore.collection("Restaurants/" + doc.id + "/Menus/" + docc.id + "/Food").get().then(function (documents) {

            documents.forEach(function (doccc) {
              var dataaa = doccc.data();
              var tempFood = {
                Name: dataaa.FoodName,
                Id: doccc.id,
                Description: dataaa.FoodDescription
              };

              tempMenu.Food.push(tempFood);

            });//end food. forEach
          });//end food.get.then

          tempRest.Menus.push(tempMenu);


        });//end menu forEach
      });//end menus.get.then

      fullRests.push(tempRest);


    });//end rest forEach
    eventListeners(restIDs);
  });//end restaurants.get.then

  console.log(fullRests);
};//end renderRestaurants

function renderFilters() {
  firestore.doc("Tags/Tags").get().then(function (doc) {

    if (doc && doc.exists) {

      var data = doc.data();
      var filters = data.Tags.split(", ");

      filters.forEach(element => {
        // console.log("rendered filters");
        // restTags.innerHTML += "<option value='" + element + "'>" + element + "</option>";
        // restTags.className = "'mdb-select md-form colorful-select dropdown-primary' multiple searchable='Search here..'";
        cbSection.innerHTML += "<li><input type='checkbox' id='checkbox" + element + "' value='" + element + "'><label for='checkbox" + element + "'>" + element + "</label></li>";
      });
    }
  })
};//end renderFilters

function uncheckTags() {

  var selectedTags = getSelections(cbSection);

  selectedTags.forEach(function (tagg) {

    console.log(tagg.replace(/\s+/g, ''));
    var filterTag = document.getElementById("checkbox" + tagg);
    filterTag.checked = false;

  })

};//end uncheckTags

function filterRestaurants(filterHow) {

  reRenderRestaurants(fullRests);

  var tagsArray = getSelections(cbSection);


  if (filtersUsed.includes(filterHow)) {//already using that filter
    //do nothing
  } else {//add new filter
    filtersUsed.push(filterHow);
  };//end if

  if (filtersUsed.includes("name") && filtersUsed.includes("tags")) {//try filter by name and tags

    if (tagsArray && tagsArray.length) {
      console.log("not empty");
    } else {
      console.log("empty");
      filtersUsed.splice(filtersUsed.indexOf('tags'), 1);
      filterByName();
      return;
    };

    filterByNameAndTags();

  } else if (filtersUsed.includes("tags") && !filtersUsed.includes("name")) {//filter by tags
    filterByTags();
  } else if (filtersUsed.includes("name") && !filtersUsed.includes("tags")) {//filter by name
    filterByName();
  } else {
    //this is the worst place to be
    console.log("NOOOOOOOOOOOOO");
  }//end if filterHow

};//end filterRestaurants

function filterByTags() {
  console.log("filtered by tags");
  //clear out filtersUsed on renderrest
  var filteredRestaurants = [];
  var filteredRestIDs = [];
  for (var i = 0; i < restaurants.length; i++) {
    filteredRestaurants[i] = fullRests[i];
    filteredRestIDs[i] = fullRests[i].Id;
  }//end for i


  var tagsArray = getSelections(cbSection);
  console.log(tagsArray[0]);

  for (var i = 0; i < tagsArray.length; i++) {
    for (var j = 0; j < filteredRestaurants.length; j++) {
      if (filteredRestaurants[j] != null) {
        var thisRestTags = filteredRestaurants[j].RestTags;
        if (!thisRestTags.includes(tagsArray[i])) {
          delete filteredRestaurants[j];
          delete filteredRestIDs[j];
        }//end if !includes
      }//end if != null
    }//end for j
  }//end for i


  searchSection.innerHTML = '';

  reRenderRestaurants(filteredRestaurants);
  // eventListeners(filteredRestIDs);
};//end filterByTags

function filterByName() {
  console.log("filtered by name")
  var filteredRestaurants = [];
  var filteredRestIDs = [];
  console.log(filtersUsed);

  var searchedName = searchBar.value;
  searchedName = searchedName.toUpperCase();



  if (filterRestTab.className == "active") {//filtering for FIND RESTAURANTS
    console.log("Filter Restaurants Tab");

    for (var i = 0; i < restaurants.length; i++) {
      filteredRestaurants[i] = fullRests[i];
      filteredRestIDs[i] = fullRests[i].Id;
    }//end for i

    for (var j = 0; j < filteredRestaurants.length; j++) {
      if (filteredRestaurants[j] != null) {
        var thisRestName = filteredRestaurants[j].Name.toUpperCase();
        if (!thisRestName.includes(searchedName)) {
          delete filteredRestaurants[j];
          delete filteredRestIDs[j];
        }//end if !includes
      }//end if != null
    }//end for j

    console.log(filteredRestaurants);
    console.log(filteredRestIDs);

    reRenderRestaurants(filteredRestaurants);

  } else if (filterFoodTab.className == "active") {//filtering for FIND FOOD
    console.log("Filter Food Tab");

    // for (var n = 0; n < fullRests.length; n++) {
    //   filteredRestaurants[n] = fullRests[n];
    //   // filteredRestIDs[i] = restIDs[i];
    // }//end for i

    for (var k = 0; k < fullRests.length; k++) {
      var thisRestRef = fullRests[k];

      thisRestRef.Menus.forEach(function (menuu) {
        // console.log(menuu);
        menuu.Food.forEach(function (foood) {
          var tempname = foood.Name.toUpperCase();
          var tempdescrip = foood.Description.toUpperCase();

          if (tempname.includes(searchedName.toUpperCase()) || tempdescrip.includes(searchedName.toUpperCase())) {
            // console.log("got one, tempname: " + tempname + ", descrip:" + tempdescrip + ", searchedName: " + searchedName);
            filteredRestaurants.push(thisRestRef);
            filteredRestIDs.push(thisRestRef.Id);
          }//end if
        })//end food for each
      })//end menu for each
    }//end for k

    console.log(filteredRestaurants);
    console.log(filteredRestIDs);
    reRenderRestaurants(filteredRestaurants);

  } else {
    console.log("oh god please no");
  }//end if for each tab



  // searchSection.innerHTML = '';
  // eventListeners(filteredRestIDs);


}//end filterByName

function filterByNameAndTags() {
  console.log("filtered by name & tags");
  var searchedName = searchBar.value;
  searchedName = searchedName.toUpperCase();
  console.log(searchedName);

  var filteredRestaurants = [];
  var filteredRestIDs = [];
  for (var i = 0; i < restaurants.length; i++) {
    filteredRestaurants[i] = fullRests[i];
    filteredRestIDs[i] = fullRests[i].Id;
  }//end for i

  var tagsArray = getSelections(cbSection);

  if (filterRestTab.className == "active") {
    console.log("got to filterresttab active");
    for (var i = 0; i < tagsArray.length; i++) {
      for (var j = 0; j < filteredRestaurants.length; j++) {
        if (!fullRests.includes(filteredRestaurants[j])) {

          return;

        } else {
          var thisRestTags = filteredRestaurants[j].RestTags;
          var thisRestName = filteredRestaurants[j].Name.toUpperCase();
          if (!tagsArray[i].includes(thisRestTags) && !thisRestName.includes(searchedName)) {
            delete filteredRestaurants[j];
            delete filteredRestIDs[j];
          }//end if !includes tag
          // if (!thisRestName.includes(searchedName)) {
          //   delete filteredRestaurants[j];
          //   delete filteredRestIDs[j];
          // }//end if !includes name

        }
      }//end for j
    }//end for i
    reRenderRestaurants(filteredRestaurants);

  } else if (filterFoodTab.className == "active") {
    console.log("got to filterfoodtab active");
    var newFilteredRests = [];

    for (var k = 0; k < fullRests.length; k++) {
      var thisRestRef = fullRests[k];

      thisRestRef.Menus.forEach(function (menuu) {
        // console.log(menuu);
        menuu.Food.forEach(function (foood) {
          var tempname = foood.Name.toUpperCase();
          var tempdescrip = foood.Description.toUpperCase();

          if (tempname.includes(searchedName.toUpperCase()) || tempdescrip.includes(searchedName.toUpperCase())) {
            // console.log("got one, tempname: " + tempname + ", descrip:" + tempdescrip + ", searchedName: " + searchedName);
            newFilteredRests.push(thisRestRef);
          }//end if
          for (var x = 0; x < tagsArray.length; x++) {
            for (var kk = 0; kk < newFilteredRests.length; kk++) {
              if (newFilteredRests[kk] != null) {
                var thisRestTags = newFilteredRests[kk].RestTags;
                if (!thisRestTags.includes(tagsArray[kk])) {
                  delete newFilteredRests[kk];
                }//end if
              }//end if !=null
            }//end for kk
          }//end for x

        })//end food for each
      })//end menu for each
    }//end for k
    reRenderRestaurants(newFilteredRests);
  }//end if
  // searchSection.innerHTML = '';

  // console.log("it was me: " + newFilteredRests);


  // eventListeners(newFilteredIDs);

}//end filterByNameAndTags

function reRenderRestaurants(filteredRestaurants) {
  while (searchSection.firstChild) {//remove any existing restaurant cards
    searchSection.removeChild(searchSection.firstChild);
  }
  var filteredIDs = [];


  for (var j = 0; j < filteredRestaurants.length; j++) {
    if (filteredRestaurants[j] != undefined) {
      filteredIDs[j] = filteredRestaurants[j].Id;
    }//end if != null
  }//end for j


  if (filterRestTab.className === "active") {

    filteredRestaurants.forEach(function (element) {
      var div = document.createElement("div");
      div.innerHTML = "<h3 style='color:#006400;'>" + element.Name + "</h3>"
        + "<button id='" + element.Id + "' type=submit class= 'btn btn-success'>View Restaurant</button>";
      // div.className = 'row hidden-md-up col-md-4 mb-3 card card-block float-right font-weight-bold';
      div.className = 'card card-body fixed float-left font-weight-bold';
      searchSection.appendChild(div);
    });

    eventListeners(filteredIDs);

  } else if (filterFoodTab.className === "active") {

    filteredRestaurants.forEach(function (element) {
      var div = document.createElement("div");
      div.innerHTML = "<h3 style='color:#006400;'>" + element.Name + "</h3>"
        + "<button id='" + element.Id + "' type=submit class= 'btn btn-success'>View Restaurant</button>";
      // div.className = 'row hidden-md-up col-md-4 mb-3 card card-block float-right font-weight-bold';
      div.className = 'card card-body fixed float-left font-weight-bold';
      searchSection.appendChild(div);
    });

    eventListeners(filteredIDs);

  } else {
    console.log("R.I.P");
  };

}//end reRender

function eventListeners(IDs) {
  // console.log("IDs: " + IDs);
  // alert(typeof IDs);
  // var idd = IDs.split(",");
  // for (var j = 0; j < idd.length; j++) {
  //   var filtered = idd[j].filter(function (el) {
  //     return el != null;
  //   });
  //   console.log("filtered" + filtered);

  // }


  IDs.forEach(function (elem) {
    if (elem === null) {
      return;
    } else {
      var buttonReference = document.getElementById(elem);
      buttonReference.addEventListener("click", e => {
        window.location.replace("restaurant.html?restaurant_id=" + elem);
      });
    }

  });

}//end eventListeners IDs

function getSelections(cbSection) {


  // NodeList.prototype.forEach = Array.prototype.forEach
  var c = cbSection.childNodes;
  var cArray = [];
  // console.log("t1: " + c);
  c.forEach(function (item) {
    var kid = item.firstChild;
    cArray.push(kid);
    // console.log("t2: " + kid);
    // console.log(item);
  });

  var result = [];
  for (var i = 1, cLen = cArray.length; i < cLen; i++) {
    if (cArray[i].checked) {
      result.push(cArray[i].value);
    }//end if checked
  }//endFor
  return result;

  // 
  // var options = select && select.options;
  // var opt;

  // for (var i = 0, iLen = options.length; i < iLen; i++) {
  //   opt = options[i];

  //   if (opt.selected) {
  //     result.push(opt.value || opt.text);
  //   }
  // }
  // return result;



}//end getSelections
////////////////////////////////////////END FILTER RESTAURANTS

////////////////////////////////////////CART MODAL
var total = 0;
var cartCount = 0;
var itemTotal = 0;

editButton.addEventListener("click", e => {
  window.location.replace("editAccount.html");
});//end editButton listener

function fillCart() {
  var listNumber = 0;
  total = 0;

  firestore.collection("Users/" + email + "/cart").get().then(function (querySnapshot) {

    querySnapshot.forEach(function (itemDoc) {
      docData = itemDoc.data();
      // cartCount += docData.Quantity;
      total += docData.TotalCost;
      listNumber += 1;
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
      itemSummary.appendChild(div);
      handleQuantity(itemDoc.id, docData.FoodPrice, docData.Quantity);
    });//end foreach
    if (cartCount == 0) {
      subtotal.innerText = "Your Cart Is Empty";
    } else {
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
    cartCounter.innerText = cartCount;
    console.log("newindvPrice: " + itemTotal);
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

function setCartCount() {
  // var cartCount = 0;
  var quantityCount = 0;

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
}//end setCartCount

cartButton.addEventListener("click", e => {
  //remove the items in the cart modal and reload them just incase it changed
  while (itemSummary.firstChild) {
    itemSummary.removeChild(itemSummary.firstChild);
  }
  fillCart();
})//end cartButton EventListener

checkout.addEventListener("click", e => {
  window.location.replace("orderCart.html");
})//end checkoutButton listener

////////////////////////////////////////END CART MODAL

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in. Get their email.
    console.log("The currently logged in user is: " + user.email + ".");
    email = user.email;

    //Check to see if this user is a customer. If not, redirect them to their dashboard.
    firestore.doc("/Users/" + email).get().then(function (doc) {

      if (doc.exists) {

        var docData = doc.data();
        var role = docData.UserRole;

        nameField.innerText = docData.UserName;
        addressField.innerText = docData.UserAddress;
        cityField.innerText = docData.UserCity;
        stateField.innerText = docData.UserState;
        zipField.innerText = docData.UserZipCode;
        emailField.innerText = docData.UserEmail;
        phoneNumberField.innerText = docData.UserPhoneNumber;

        //Redirect user to the dashboard for their role.
        if (role === "Customer") return;
        else if (role === "Manager") window.location.replace("manager.html");
        else if (role === "Deliverer") window.location.replace("deliverer.html");
        else console.log("The value of role is not an accepted value: -" + role + ".");

      } else console.log("The users document does not exist.");

    });

    renderRestaurants();

    renderFilters();

    setCartCount();

    fillCart();

  } else {
    // No user is signed in. Redirect them to the homepage.
    console.log("No user is signed in, redirecting...");
    window.location.replace("homepage.html");
  }
});//end auth