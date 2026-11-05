const {ipcRenderer} = require('electron');
let selectedCountry = "";
const packageContainer = document.getElementById("packageContainer");
const formContainer = document.getElementById("formContainer");
const selection = document.getElementById("selection");
const bookingContainer = document.getElementById("bookingContainer");


//Display user's entered country from previous page
ipcRenderer.on("country-selected", (event, country) =>{
    selectedCountry = country;
    document.getElementById("title").innerHTML = `Make a booking for trip to ${selectedCountry}`
});


//initialize local storage
async function initLocalStorage(){
    if(!localStorage.getItem("packages")){
        const packages = await ipcRenderer.invoke('display-packages');
        if(packages.length > 0){
            localStorage.setItem("packages", JSON.stringify(packages));
        }
    }

    if(!localStorage.getItem("bookings")){
        const bookings = await ipcRenderer.invoke("display-bookings");
        if(bookings.length > 0){
            localStorage.setItem("bookings", JSON.stringify(bookings));
        } else{
            localStorage.setItem("bookings", JSON.stringify([]));
        }
    }
}

//getter function for package
function getLocalPackage(){
    return JSON.parse(localStorage.getItem("packages"));
}

//getter function for bookings
function getLocalBookings(){
    return JSON.parse(localStorage.getItem("bookings"));
}


function saveLocalBookings(bookings){
    localStorage.setItem("bookings", JSON.stringify(bookings));
}

initLocalStorage();

//helper function to clear the form after every submission
function clearForm(){
    document.getElementById("bookName").value = "";
    document.getElementById("bookEmail").value = "";
    document.getElementById("bookDate").value = "";
    document.getElementById("bookGuest").value = "";
}

//Display the selected package on booking page
async function displayPackageAgain(dropDownValue){

    const bookNowButton = document.getElementById("bookNowButton");
    if(dropDownValue === ""){
        if(packageContainer.innerHTML !== ""){
            packageContainer.innerHTML = "";
            bookNowButton.style.display = "none";
        }
        return;
    };

    const packages = getLocalPackage();
    packageContainer.innerHTML = "";
    const div = document.createElement("div");
    div.innerHTML = `
        <h2>${packages[dropDownValue].name}</h2>
        <h4>${packages[dropDownValue].headline}</h4>
        <p style="text-align: justify">${packages[dropDownValue].description}</p>
        <p><strong>${packages[dropDownValue].duration}</strong></p>
        <p><strong> RM ${packages[dropDownValue].price.toFixed(2)}</strong></p>
        <p><strong>Package includes: </strong></p>
        <hr>
     `;
    const lister = document.createElement("ul");

    for(let j  = 0; j < packages[dropDownValue].features.length; j++){
        const unorderedLists = document.createElement("li");
        let featureContent = packages[dropDownValue].features[j];
        unorderedLists.innerHTML += featureContent;
        lister.appendChild(unorderedLists);
    }

    div.appendChild(lister);

     packageContainer.appendChild(div);
     bookNowButton.style.display = "block";
};


//Handler to displayBookinghandler
async function displayBookinghandler(){
    const bookings = getLocalBookings();
    bookingContainer.innerHTML = '';
    bookingContainer.style.display = "block";
    for(let i = 0; i < bookings.length; i++){
        const div = document.createElement("div");
        const bookingIndex = bookings[i];
        const bookingID = bookingIndex.bookingID;
        div.innerHTML = `
            <h4>Booking ${i+1}</h4>
            <p>ID: ${bookingID}</p>
            <p>Full Name: ${bookingIndex.bookName}</p>
            <p>Email: ${bookingIndex.bookEmail}</p>
            <p>Date: ${bookingIndex.bookDate}</p>
            <p>bookGuest: ${bookingIndex.bookGuest} pax</p>
            <p>Price per Pack: RM ${bookingIndex.packagePrice}</p>
            <p>Total Price: RM ${bookingIndex.totalPrice}</p>
            <button id="deleteButton" onclick="deleteBookingHandler('${bookingID}')">Delete</button>
            <button id="editButton" onclick="editBookingHandler('${bookingID}')">Update Booking</button>
        `
        bookingContainer.appendChild(div);
    };
};


//Handler to delete booking
async function deleteBookingHandler(bookingID){
    const confirmDelete = confirm("Are you sure you want to delete this booking?");
    if(!confirmDelete){
      return;
    }
    
    let bookings = getLocalBookings();
    const updatedBookings = bookings.filter(b => b.bookingID !== bookingID);
    saveLocalBookings(updatedBookings);
    displayBookinghandler();
};

//Edit booking handler
let editingBookingID = null;
let currentBookingCountry = '';
async function editBookingHandler(bookingID){
    const bookings = getLocalBookings();
    const targetBooking = bookings.find( b => b.bookingID === bookingID);
    
    editingBookingID = bookingID;
    currentBookingCountry = targetBooking.country;

    document.getElementById('bookName').value = targetBooking.bookName;
    document.getElementById('bookEmail').value = targetBooking.bookEmail;
    document.getElementById('bookDate').value = targetBooking.bookDate;
    document.getElementById('bookGuest').value = targetBooking.bookGuest;

    formContainer.style.display = "block";
    document.getElementById('confirmBooking').style.display = "none";
    document.getElementById('updateBooking').style.display = "inline-block";
}


//display booking button
document.getElementById('bookNowButton').addEventListener('click', () => {
    formContainer.style.display = "block";
});

//remove booking button
document.getElementById('cancelBooking').addEventListener('click', () => {
    formContainer.style.display = "none";
    clearForm();
    editingBookingID = null;
});


//Create booking
document.getElementById('confirmBooking').addEventListener('click', async () =>{
   const bookName = document.getElementById("bookName").value.trim();
   const bookEmail = document.getElementById("bookEmail").value.trim();
   const bookDate = document.getElementById("bookDate").value;
   const bookGuest = document.getElementById("bookGuest").value;
 
   const packageIndex = selection.value;
   const packages = getLocalPackage();
   const selectedPackage = packages[packageIndex];
   const packageName = selectedPackage.name;
   const packagePrice = selectedPackage.price.toFixed(2);
   const totalPrice = (packagePrice * bookGuest).toFixed(2);
   const bookingID = `BK-${Date.now()}`

   if(!bookName || !bookEmail || !bookDate || !bookGuest){
      alert("Please complete the form!");
      return;
   }

   const newBooking = {
       bookingID ,
       country: selectedCountry,  
       packageName, 
       bookName, 
       bookEmail, 
       bookDate, 
       bookGuest, 
       packagePrice, 
       totalPrice
   }

   const bookings = getLocalBookings();
   bookings.push(newBooking);
   saveLocalBookings(bookings);

   alert('Your trip has been successfully booked! <3');
   formContainer.style.display = "none";
   clearForm();
   displayBookinghandler();
});


document.getElementById("viewBookButton").addEventListener("click", () => {
    displayBookinghandler()
});


//Update Booking
document.getElementById("updateBooking").addEventListener('click', async () => {
    const bookName = document.getElementById("bookName").value.trim();
    const bookEmail = document.getElementById("bookEmail").value.trim();
    const bookDate = document.getElementById("bookDate").value;
    const bookGuest = document.getElementById("bookGuest").value;
  
    if(!bookName || !bookEmail || !bookDate || !bookGuest){
        alert("Please complete the form!");
        return;
    }

    const packageIndex = parseInt(selection.value) || 0;
    const packages = getLocalPackage();
    const selectedPackage = packages[packageIndex];

    const packageName = selectedPackage.name;
    const packagePrice = selectedPackage.price.toFixed(2);
    const totalPrice = (packagePrice * bookGuest).toFixed(2);

    const bookings = getLocalBookings();
    const index = bookings.findIndex(b => b.bookingID === editingBookingID);

    if(index >= 0){
    bookings[index] = {
        ...bookings[index],
        bookingID: editingBookingID,
        country: currentBookingCountry,
        packageName,
        bookName,
        bookEmail,
        bookDate,
        bookGuest,
        packagePrice,
        totalPrice
    };

    saveLocalBookings(bookings);


    alert("Booking updated successfully!");
    editingBookingID = null;
    currentBookingCountry = '';

    clearForm();

    document.getElementById("updateBooking").style.display = "none";
    document.getElementById("confirmBooking").style.display = "inline-block";
    formContainer.style.display = "none";

    displayBookinghandler();
    } else{
        alert("Failed to update booking.");
    }
});


