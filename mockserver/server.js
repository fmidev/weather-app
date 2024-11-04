const express = require('express');
const fs = require('fs');
const path = require('path');
const ip = require('ip');

const app = express();
const PORT = 3000;

const updateWarningTimes = (json) => {
  const updated = new Date(json.data.updated);
  const interval = new Date().getTime() - updated.getTime();

  json.data.updated = new Date(updated.getTime() + interval).toISOString();

  let startTime = new Date(json.data.startTime);
  json.data.startTime = new Date(startTime.getTime() + interval).toISOString();
  let endTime = new Date(json.data.endTime);
  json.data.endTime = new Date(endTime.getTime() + interval).toISOString();

  json.data.warnings.forEach((item) => {
    let warningStartTime = Date.parse(item.duration.startTime);
    let warningEndTime = Date.parse(item.duration.endTime);

    warningStartTime = new Date(warningStartTime + interval);
    warningEndTime = new Date(warningEndTime + interval);

    item.duration.startTime = warningStartTime.toISOString();
    item.duration.endTime = warningEndTime.toISOString();
  });

  return json;
};

app.get('/warnings/:name', (req, res) => {
  const filePath = path.join(
    __dirname,
    'data',
    'warnings',
    req.params.name + '.json'
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

app.get('/mobileannouncements/:name', (req, res) => {
  const filePath = path.join(
    __dirname,
    'data',
    'mobileannouncements',
    req.params.name + '.json'
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Also available on http://${ip.address()}:${PORT}`);
  console.log('');
  console.log(
    'Check https://github.com/fmidev/weather-app/wiki/Development-guide#mockserver for more help!'
  );
});
