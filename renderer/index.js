const { ipcRenderer } = require('electron');
const searchBtn = document.getElementById('searchBtn');
const aboutCountry = document.getElementById('aboutCountry');
let currentCountry = '';
let bookingButton = document.getElementById("bookingButton");

const packageContainer = document.getElementById("packageContainer");

function activitySuggestor(temperature){
    const summary = {
        temp : temperature,
        vibe : "",
        suggestion : ""
    };

    if(temperature < 0){
        summary.vibe = "Freezing & Cold Sub-Zero";
        summary.suggestion = "Bundle up! Perfect weather for winter sports or unwinding in a heated thermal bath."
    }

    else if(temperature >= 1 && temperature <= 15){
        summary.vibe = "Cool & Crisp";
        summary.suggestion = "Bundle up! Perfect weather for winter sports or unwinding in a heated thermal bath."
    }

    else if(temperature > 15 && temperature < 26){
        summary.vibe = "Mild & Comfortable";
        summary.suggestion = "Perfect weather conditions! Ideal for full-day outdoor exploration and open-air activities.";
    }

    else if(temperature > 26 && temperature < 33){
        summary.vibe = "Warm & Sunny";
        summary.suggestion = "Warm and sunny! Don't forget sunscreen—perfect for coastal tours, boat rides, and swimming."
    }

    else {
        summary.vibe = "Hot & Tropical";
        summary.suggestion = "High temperatures today! We recommend indoor attractions during peak hours or cooling water activities."
    }

    return summary;
}

//fetch the required info by reading user's country input 
searchBtn.addEventListener('click', async () => {
  const country = document.getElementById('tourPlace').value.trim();
  if(!country){
    alert("Please enter a place name to proceed!");
    return;
  }
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=9fd7a449d055dba26a982a3220f32aa2`)
  .then(response => response.json())
  .then(async data => {
      console.log(data);

      if(data.cod === '404'){
        aboutCountry.innerHTML = `<h1>Search country cannot be found :( </h1>`;
        packageContainer.style.display = "none";
        bookingButton.style.display = "none"
        return;
      }

      currentCountry = data.name;
      bookingButton.style.display = "block";
      let temperature = data.main.temp - 273.15;
      let tempAnalysis = activitySuggestor(temperature);
      let weather = data.weather[0].description;
      let lat = data.coord.lat.toFixed(2);
      let lon = data.coord.lon.toFixed(2);
      let flagUrl = `https://flagsapi.com/${data.sys.country}/flat/64.png`
      let weatherIcon = `https://openweathermap.org/payload/api/media/file/${data.weather[0].icon}.png `;

      aboutCountry.innerHTML = 
        `<h1>${data.name} <img src="${flagUrl}" style="height: 24px;"> </h1>
        <p><strong>Temperature:</strong> ${(temperature).toFixed(1)} C</p>
        <p><strong>Weather:</strong> ${weather} <img src="${weatherIcon}" style="height: 24px;"></p>
        <p><strong>latitude:</strong> ${lat}</p>
        <p><strong>longitude:</strong> ${lon}</p>
        <p><strong>Vibe:</strong> ${tempAnalysis.vibe}</p>
        <p><strong>Activity Suggestion:</strong> ${tempAnalysis.suggestion}</p>`;
  })
  .catch(error => console.error(`Error fetching API: ${error}`));

    const packages = await ipcRenderer.invoke('display-packages');
    packageContainer.style.display = "block";
    packageContainer.innerHTML = ""

    const checkout = document.createElement("h2");
    checkout.innerHTML = "Check out What we have in offer below!"
    packageContainer.appendChild(checkout);

    for(let i  = 0; i < packages.length; i++){
        const div = document.createElement("div");
        div.innerHTML = `
            <h2>${packages[i].name}</h3>
            <h4 ">${packages[i].headline}</h4>
            <p style="text-align: justify">${packages[i].description}</p>
            <p><strong>${packages[i].duration}</strong></p>
            <p><strong> RM ${packages[i].price.toFixed(2)}</strong> </p>
            <p><strong>Package includes: </strong></p>
            <hr>
        `;
        const lister = document.createElement("ul");

        for(let j  = 0; j < packages[i].features.length; j++){
            const unorderedLists = document.createElement("li");
            let featureContent = packages[i].features[j];
            unorderedLists.innerHTML += featureContent;
            lister.appendChild(unorderedLists);
        }

        div.appendChild(lister);

        packageContainer.appendChild(div);
    };

});
bookingButton.addEventListener('click', () => {
    ipcRenderer.send('open-booking-window', currentCountry);
});
