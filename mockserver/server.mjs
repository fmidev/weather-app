import {
  updateWarningTimes,
  updateForecast,
  updateUVForecast,
  updateObservations,
  DataMode,
  // eslint-disable-next-line import/extensions
} from './modifiers.mjs';
import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import ip from 'ip';
import { fileURLToPath } from 'url';

const PORT = 3000;

const app = express();
const dirName = dirname(fileURLToPath(import.meta.url));

let geolocationSetting = 'tikkurila';
let forecastSetting = 'summer';
let warningSetting = 'land';
let announcementSetting = 'none';
let dataModeSetting = DataMode.default;
let debugMode = true;
let requestCount = 0;

// Middleware for every request
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });

  if (debugMode) {
    console.log(`${req.method} ${req.originalUrl}`);
  }

  if (!req.path.includes('count')) {
    requestCount += 1;
  }

  if (req.path.includes('error')) {
    res.status(500).send('Internal server error');
  } else {
    next();
  }
});

app.get('/quit', (_, res) => {
  res.send('Shutting down server...');
  console.log('Server is shutting down...');
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

app.get('/count', (_, res) => {
  res.json({ count: requestCount });
});

app.get('/config', (req, res) => {
  const filePath = path.join(dirName, 'data', 'config', 'config.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      let jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.get('/warnings', (req, res) => {
  const filePath = path.join(
    dirName,
    'data',
    'warnings',
    warningSetting + '.json'
  );

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      let jsonData = JSON.parse(data);
      jsonData = updateWarningTimes(jsonData);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.get('/mobileannouncements', (req, res) => {
  const filePath = path.join(
    dirName,
    'data',
    'mobileannouncements',
    announcementSetting + '.json'
  );

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      let jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.get('/setup', (_, res) => {
  return res.json({
    geolocation: geolocationSetting,
    forecast: forecastSetting,
    announcement: announcementSetting,
    datamode: dataModeSetting,
  });
});

app.get('/timeseries', (req, res) => {
  let file;

  const producer = req.query.producer;
  let geoidIsRequired = false;

  switch (producer) {
    case undefined:
      file = `geolocation-${geolocationSetting}.json`;
      break;
    case 'observations_fmi':
      if (req.query.param?.includes('snowDepth06')) {
        file = `observations-daily.json`;
      } else {
        file = `observations-finland.json`;
      }
      break;
    case 'foreign':
      file = 'observations-foreign.json';
      break;
    case 'uv':
      file = 'uv.json';
      break;
    default:
      geoidIsRequired = true;
      file = `forecast-${forecastSetting}.json`;
      break;
  }

  const geoid = req.query.geoid;
  if (geoidIsRequired && geoid === undefined) {
    return res.status(500).json({ error: 'geoid is required for the query' });
  }

  const filePath = path.join(dirName, 'data', 'timeseries', file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      let jsonData = JSON.parse(data);
      if (producer === 'observations_fmi' || producer === 'foreign') {
        jsonData = updateObservations(jsonData);
      } else if (producer === 'uv') {
        jsonData = updateUVForecast(jsonData);
      } else if (producer === 'default') {
        jsonData = updateForecast(jsonData, geoid, dataModeSetting);
      }
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.put('/setup/:type/:setting', (req, res) => {
  const type = req.params.type;
  const setting = req.params.setting;

  if (
    type === 'geolocation' &&
    ['tikkurila', 'newyork', 'singapore'].includes(setting)
  ) {
    geolocationSetting = setting;
  } else if (type === 'forecast' && ['summer', 'winter'].includes(setting)) {
    forecastSetting = setting;
  } else if (
    type === 'warning' &&
    ['none', 'land', 'sea', 'wind'].includes(setting)
  ) {
    warningSetting = setting;
  } else if (type === 'datamode' && Object.values(DataMode).includes(setting)) {
    dataModeSetting = DataMode[setting];
  } else if (
    type === 'announcement' &&
    ['none', 'maintenance', 'crisis', 'both'].includes(setting)
  ) {
    announcementSetting = setting;
  } else if (type === 'debug' && ['true', 'false'].includes(setting)) {
    debugMode = setting === 'true';
  } else {
    return res.status(500).json({ error: 'Invalid type or setting' });
  }

  res.json({ message: 'Setting updated' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Also available on http://${ip.address()}:${PORT}`);
  console.log('');
  console.log(
    'Check https://github.com/fmidev/weather-app/wiki/Development-guide#mockserver for more help!'
  );
  console.log('');
});
