import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ThePricingApi from 'the_pricing_api';

const app = express();

app.get('/free', (req, res) => {
    let apiInstance = new ThePricingApi.FreeApi();
    apiInstance.freeGet((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Get free called successfully.');
        console.log(response.text);
        res.send(response.text);
      }
    });
});

app.get('/pro', (req, res) => {
    let apiInstance = new ThePricingApi.FreeApi();
    apiInstance.proGet((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Get pro called successfully.');
        console.log(response.text);
        res.send(response.text);
      }
    });
});

app.get('/enterprise', (req, res) => {
    let apiInstance = new ThePricingApi.FreeApi();
    apiInstance.enterpriseGet((error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Get enterprise called successfully.');
        console.log(response.text);
        res.send(response.text);
      }
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, 'html/pricing')));

app.listen(3000);
