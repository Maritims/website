import { Router } from 'express';
import { createConnection, run, findLast } from '../lib/db.js';
import { uploadFile } from '../lib/spaces-client.js';

let dbConnection;

const initWeather = async () => {
    dbConnection = await createConnection('weather.db');

    await run(dbConnection,
        `CREATE TABLE IF NOT EXISTS location_forecast
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_response TEXT NOT NULL,
            created TEXT NOT NULL,
            expires TEXT NOT NULL
        )`
    );
}

const translations = {
    "clearsky": {
        "en": "Clear sky",
        "no": "Klarvær"
    },
    "fair": {
        "en": "Fair",
        "no": "Lettskyet"
    },
    "partlycloudy": {
        "en": "Partly cloudy",
        "no": "Delvis skyet"
    },
    "cloudy": {
        "en": "Cloudy",
        "no": "Skyet"
    },
    "lightrainshowers": {
        "en": "Light rain showers",
        "no": "Lette regnbyger"
    },
    "rainshowers": {
        "en": "Rain showers",
        "no": "Regnbyger"
    },
    "heavyrainshowers": {
        "en": "Heavy rain showers",
        "no": "Kraftige regnbyger"
    },
    "lightrainshowersandthunder": {
        "en": "Light rain showers and thunder",
        "no": "Lette regnbyger og torden"
    },
    "rainshowersandthunder": {
        "en": "Rain showers and thunder",
        "no": "Regnbyger og torden"
    },
    "heavyrainsowersandthunder": {
        "en": "Heavy rain showers and thunder",
        "no": "Kraftige regnbyger og torden"
    },
    "lightsleetshowers": {
        "en": "Light sleet showers",
        "no": "Lette sluddbyger"
    },
    "sleetshowers": {
        "en": "Sleet showers",
        "no": "Sluddbyger"
    },
    "heavysleetshowers": {
        "en": "Heavy sleet showers",
        "no": "Kraftige sluddbyger"
    },
    "lightssleetshowersandthunder": {
        "en": "Light sleet showers and thunder",
        "no": "Lette sluddbyger og torden"
    },
    "sleetshowersandthunder": {
        "en": "Sleet showers and thunder",
        "no": "Sluddbyger og torden"
    },
    "heavysleetshowersandthunder": {
        "en": "Heavy sleet showers and thunder",
        "no": "Kraftige sluddbyger og torden"
    },
    "lightsnowshoers": {
        "en": "Light snow showers",
        "no": "Lette snøbyger"
    },
    "snowshowers": {
        "en": "Snow showers",
        "no": "Snøbyger"
    },
    "heavysnowshoers": {
        "en": "Heavy snow shoers",
        "no": "Kraftige snøbyger"
    },
    "lightssnowshoersandthunder": {
        "en": "Light snow showers and thunder",
        "no": "Lette snøbyger og torden"
    },
    "snowshowersandthunder": {
        "en": "Snow showers and thunder",
        "no": "Snøbyger og torden"
    },
    "heavysnowshoersandthunder": {
        "en": "Heavy snow shoers and thunder",
        "no": "Kraftige snøbyger og torden"
    },
    "lightrain": {
        "en": "Light rain",
        "no": "Lett regn"
    },
    "rain": {
        "en": "Rain",
        "no": "Regn"
    },
    "heavyrain": {
        "en": "Heavy rain",
        "no": "Kraftig regn"
    },
    "lightrainandthunder": {
        "en": "Light rain and thunder",
        "no": "Lett regn og torden"
    },
    "rainandthunder": {
        "en": "Rain and thunder",
        "no": "Regn og torden"
    },
    "heavyrainandthunder": {
        "en": "Heavy rain and thunder",
        "no": "Kraftig regn og torden"
    },
    "lightsleet": {
        "en": "Light sleet",
        "no": "Lett sludd"
    },
    "sleet": {
        "en": "Sleet",
        "no": "Sludd"
    },
    "heavysleet": {
        "en": "Heavy sleet",
        "no": "Kraftig sludd"
    },
    "lightsleetandthunder": {
        "en": "Light sleet and thunder",
        "no": "Lett sludd og torden"
    },
    "sleetandthunder": {
        "en": "Sleet and thunder",
        "no": "Sludd og torden"
    },
    "heavysleetandthunder": {
        "en": "Heavy sleet and thunder",
        "no": "Kraftig sludd og torden"
    },
    "lightsnow": {
        "en": "Light snow",
        "no": "Lett snø"
    },
    "snow": {
        "en": "Snow",
        "no": "Snø"
    },
    "heavysnow": {
        "en": "Heavy snow",
        "no": "Kraftig snø"
    },
    "lightsnowandthunder": {
        "en": "Light snow and thunder",
        "no": "Lett snø og torden"
    },
    "snowandthunder": {
        "en": "Snow and thunder",
        "no": "Snø og torden"
    },
    "heavysnowandthunder": {
        "en": "Heavy snow and thunder",
        "no": "Kraftig snø og torden"
    },
    "fog": {
        "en": "Fog",
        "no": "Tåke"
    }
};

const weather = Router();

weather.use((req, res, next) => {
    if (dbConnection) {
        next();
    } else {
        res.status(500).json({ error: "No database connection has been established." });
    }
})

weather.use("/", async (req, res) => {
    let locationForecast = await findLast(dbConnection, "location_forecast");
    const expires = new Date(locationForecast.expires);
    console.log(`Location forecast expires at ${expires.toISOString()}. It's currently ${new Date().toISOString()}`);

    if (new Date() > expires) {
        console.log('Refreshing');

        const siteName = "https://clueless.no (https://github.com/Maritims/website)";
        const locationForecastUrl = "https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=59&lon=10";
        const response = await fetch(locationForecastUrl, {
            headers: {
                'User-Agent': siteName
            }
        });
        const expires = new Date(response.headers.get("expires")).toISOString();
        const json = await response.json();
        await run(dbConnection, `INSERT INTO location_forecast (api_response, created, expires) VALUES(?, ?, ?)`, [JSON.stringify(json), new Date().toISOString(), expires]);
    }

    locationForecast = await findLast(dbConnection, "location_forecast");
    const apiResponse = JSON.parse(locationForecast.api_response);
    const timeseries = apiResponse.properties.timeseries[0];
    const details = timeseries.data.instant.details;

    const symbolCode = timeseries.data.next_1_hours.summary.symbol_code;
    const airTemperature = details.air_temperature;
    const windSpeed = details.wind_speed;

    res.json({
        symbolCode: symbolCode,
        airTemperature: airTemperature,
        windSpeed: windSpeed,
        text: translations[symbolCode]["en"]
    });
});

export { initWeather, weather };