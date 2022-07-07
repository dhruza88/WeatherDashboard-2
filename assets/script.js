const apiKey = "0e9b2929dd0b6b32197f6dd0fdafbf19";
const questionEl = document.getElementById("cityForm");
const forecastContainer = document.getElementById('futureDayContainer');
const cityEl = document.getElementById('enterCityInput');
console.log(cityEl);

questionEl.addEventListener("submit", e => {
    e.preventDefault();
    let inputVal = cityEl.value;

    
    const latelongUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${inputVal}&appid=${apiKey}`;
   
   

    fetch(latelongUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const cityName = data[0].name;
            const forecastUrl= `https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&limit=5&exclude={part}&appid=${apiKey}`;            
            fetch(forecastUrl)
            .then(function (resp) {
                return resp.json();
            })
            .then(function (weatherData){
                console.log(weatherData);
                buildDays(weatherData, cityName);
            })
            
        });
});



function buildDays(wData, cityName) { 
    document.getElementById("cdHeader").innerHTML = buildHeader(wData, cityName);
    document.getElementById('ffHeader').innerHTML = `
        Future Forecast
        <div id="futureForecast"><div id="futureDayContainer"></div></div>
    `;
    document.getElementById('futureDayContainer').innerHTML = buildForecast(wData);

    saveWeatherData(wData, cityName);
}

function buildHeader(wData, cityName) {
    const dateFormat = new Date().toDateString();
    const fTemp = Number(((wData.current.temp-273.15)*1.8)+32).toFixed(2);
    let uvClass = 'uv1';

    if (wData.current.uvi > 0.4 && wData.current.uvi < 0.7) {
        uvClass = 'uv2';   
    }
    if (wData.current.uvi > 0.7) {
        uvClass = 'uv3';
    }

    return `
        Current Daily Forecast
        <div id="dailyForecast">
            <div id="dfsect1">
                <span>City: ${cityName}</span>
                <span>Date: ${dateFormat}</span>
                <span>Temp: ${fTemp}</span>
                <div>
                    <img id="MainWIcon" src="https://openweathermap.org/img/w/${wData.current.weather[0].icon}.png" alt="Weather icon">
                </div>
            </div>
                <div id="dfsect2">
                <span>Humidity: ${wData.current.humidity}</span>
                <span>Wind Speed: ${wData.current.wind_speed}</span>
                <div><span class='${uvClass}'>UV Index:  ${wData.current.uvi}</span></div>
            </div>
        </div>
    `;
}

function buildForecast(wData) {
    let builtForecastData = '';
 
    for (let index = 0; index < 5; index++) {
        const curData = wData.daily[index];
        const fTemp = Number(((curData.temp.day-273.15)*1.8)+32).toFixed(2);

        const myDate = new Date();
        myDate.setDate(myDate.getDate() + (index+1));

        builtForecastData += `
            <div id="d${index+1}">
                <span>Date: ${myDate.toDateString()}</span>
                <span>Temp: ${fTemp}</span>
                <div>
                    <img id="wIco${index}" src="https://openweathermap.org/img/w/${curData.weather[0].icon}.png" alt="Weather icon">
                </div>
                <span>Humidity: ${curData.humidity}</span>
                <span>Wind Speed: ${curData.wind_speed}</span>
            </div>`;
        
    }

    return builtForecastData;
}


function saveWeatherData(wData, cName) {
    let existingWeather = localStorage.getItem('recentSearch')?.length > 0 ?
    JSON.parse(localStorage.getItem(`recentSearch`)) : [];

    existingWeather = existingWeather.filter((exWeath) => exWeath.cityName != cName);

    if (existingWeather.length === 10) {
        existingWeather.shift();
    }
    wData.cityName = cName;
    existingWeather.push(wData);

    localStorage.setItem(`recentSearch`, JSON.stringify(existingWeather));

    rebuildSavedCities(existingWeather);
}

function rebuildSavedCities(savedWeatherSearches) {
    document.getElementById('ssHeader').innerHTML = `
        Saved Cities
        <div id="savedCities"></div>
    `;
    let savedCityHTML = '';
    savedWeatherSearches.forEach((weatherObject, indx) => {
        const hasCityName = weatherObject.cityName ? weatherObject.cityName : 'City Name Lost...';
        savedCityHTML += `
            <div id="sC${indx}" onClick="reLoadSaveCityData(${indx}, '${hasCityName}')"><span>${hasCityName}</span></div>
        `;
    });
    document.getElementById('savedCities').innerHTML = savedCityHTML;
}
function reLoadSaveCityData(wDataIndex, cityName) {
    const wData = JSON.parse(localStorage.getItem('recentSearch'));
    buildDays(wData[wDataIndex], cityName);
}
// localStorage array of objects searched
// When you click just reload the object into the UI
// So maybe a function
// loadWeatherData(weatherData)
// That takes the weather object and updates the UI
// So each time you pick it, it will use the same object and just reload
