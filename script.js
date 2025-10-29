document.addEventListener('DOMContentLoaded', function() {
    console.log('Weather Dashboard Started');
    
    // Get all elements
    const cityEl = document.getElementById("enter-city");
    const searchEl = document.getElementById("search-button");
    const clearEl = document.getElementById("clear-history");
    const nameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    const historyEl = document.getElementById("history");
    const fivedayEl = document.getElementById("fiveday-header");
    const todayweatherEl = document.getElementById("today-weather");
    const forecastEls = document.querySelectorAll(".forecast");

    console.log('Elements loaded:', {
        cityEl: !!cityEl,
        searchEl: !!searchEl,
        clearEl: !!clearEl,
        nameEl: !!nameEl,
        forecastEls: forecastEls.length
    });

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    const APIKey = "a8e831d721c34d0533cafec15309d40f";

    // Search button event
    searchEl.addEventListener("click", function() {
        console.log('Search button clicked!');
        const searchTerm = cityEl.value.trim();
        console.log('Searching for:', searchTerm);
        
        if (searchTerm) {
            getWeather(searchTerm);
        } else {
            alert('Please enter a city name');
        }
    });

    // Enter key support
    cityEl.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            searchEl.click();
        }
    });

    // Clear history
    clearEl.addEventListener("click", function() {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
        alert('Search history cleared!');
    });

    // Get weather function
    async function getWeather(cityName) {
        console.log('Getting weather for:', cityName);
        try {
            // Show loading state
            todayweatherEl.classList.remove("d-none");
            nameEl.innerHTML = `Loading weather for ${cityName}...`;

            // Get coordinates first
            const geoResponse = await axios.get(
                `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`
            );

            if (geoResponse.data.length === 0) {
                alert("City not found. Please check the spelling!");
                todayweatherEl.classList.add("d-none");
                return;
            }

            const { lat, lon, name } = geoResponse.data[0];

            // Get weather data
            const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`
            );

            console.log('Weather data received:', weatherResponse.data);

            // Update current weather
            const current = weatherResponse.data.list[0];
            const currentDate = new Date();
            
            nameEl.innerHTML = `${name} (${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()})`;
            currentPicEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="${current.weather[0].description}" width="70">`;
            currentTempEl.innerHTML = `🌡️ Temperature: ${current.main.temp.toFixed(1)}°C`;
            currentHumidityEl.innerHTML = `💧 Humidity: ${current.main.humidity}%`;
            currentWindEl.innerHTML = `🌬️ Wind: ${current.wind.speed} m/s`;
            currentUVEl.innerHTML = `☀️ UV Index: <span class="badge bg-info">Data not available</span>`;

            // Update 5-day forecast
            fivedayEl.classList.remove("d-none");
            for (let i = 0; i < 5; i++) {
                const forecast = weatherResponse.data.list[i * 8]; // Get data for every 24 hours
                const forecastDate = new Date(forecast.dt * 1000);
                
                forecastEls[i].innerHTML = `
                    <p class="mt-3 mb-0 forecast-date">${forecastDate.getMonth() + 1}/${forecastDate.getDate()}</p>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" width="60" alt="${forecast.weather[0].description}">
                    <p>Temp: ${forecast.main.temp.toFixed(1)}°C</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                `;
            }

            // Add to search history
            if (!searchHistory.includes(cityName)) {
                searchHistory.push(cityName);
                localStorage.setItem("search", JSON.stringify(searchHistory));
                renderSearchHistory();
            }

            cityEl.value = "";

        } catch (error) {
            console.error('Error fetching weather:', error);
            alert('Error fetching weather data. Please try again.');
        }
    }

    // Render search history
    function renderSearchHistory() {
        historyEl.innerHTML = "";
        searchHistory.forEach(city => {
            const button = document.createElement("button");
            button.textContent = city;
            button.className = "history-btn";
            button.addEventListener("click", () => getWeather(city));
            historyEl.appendChild(button);
        });
    }

    // Load last searched city on startup
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});