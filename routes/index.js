const { default: axios } = require('axios');
var express = require('express');
const { response } = require('../app');
var router = express.Router();

const apiKey = process.env.API_KEY;

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index',{weather: null,error:null});
});

router.post('/weather', async (req, res) => {
  try {
      let city = req.body.city;
      if (city === 'other') {
          city = req.body.otherCity;
      }

      console.log(req.body);

      // Ambil koordinat kota
      const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);

      // Jika data kosong (kota tidak ditemukan)
      if (geoResponse.data.length === 0) {
          return res.render('index', { weather: null, error: `City "${city}" not found.` });
      }

      const result = geoResponse.data[0];
      const lat = result.lat;
      const lon = result.lon;

      // Ambil data cuaca berdasarkan koordinat
      const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const currentWeather = weatherResponse.data;

      const weather = {
          city: city,
          temp: currentWeather.list[0].main.temp,
          description: currentWeather.list[0].weather[0].description,
          icon: currentWeather.list[0].weather[0].icon,
          humidity: currentWeather.list[0].main.humidity,
          wind: currentWeather.list[0].wind.speed,
          date: currentWeather.list[0].dt_txt
      };

      // Render halaman dengan data cuaca
      res.render('index', { weather, error: null });

  } catch (error) {
      console.error(error);

      // Jika ada kesalahan API atau lainnya
      res.render('index', { weather: null, error: "Failed to fetch weather data. Please try again later." });
  }
});


module.exports = router;
