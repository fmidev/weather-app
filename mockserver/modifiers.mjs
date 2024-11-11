export const updateWarningTimes = (json) => {
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

export const updateForecast = (json, geoid) => {
  const modified = { ...json };
  const geoids = Object.keys(json);

  geoids.forEach((id) => {
    delete modified[id];
  });

  modified[geoid] = json[geoids[0]];

  const now = new Date();
  const startOfTheDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const itemsInFuture = [];
  const interval =
    startOfTheDay.getTime() / 1000 - modified[geoid][0].epochtime;

  modified[geoid].forEach((item) => {
    const epochtime = item.epochtime + interval;

    if (epochtime > now.getTime() / 1000) {
      item.epochtime = epochtime;

      if (item.sunrise && item.sunset && item.modtime) {
        const sunrise =
          new Date(epochtime * 1000)
            .toISOString()
            .replaceAll('-', '')
            .substring(0, 8) + item.sunrise.substring(8);
        const sunset =
          new Date(epochtime * 1000)
            .toISOString()
            .replaceAll('-', '')
            .substring(0, 8) + item.sunset.substring(8);
        const modtime = now
          .toISOString()
          .replaceAll('-', '')
          .replaceAll(':', '')
          .substring(0, 15);
        item.sunrise = sunrise;
        item.sunset = sunset;
        item.modtime = modtime;
      }

      itemsInFuture.push(item);
    }
  });
  modified[geoid] = itemsInFuture;

  return modified;
};

export const updateUVForecast = (json) => {
  const now = new Date();
  const startOfTheDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const itemsInFuture = [];
  const interval = startOfTheDay.getTime() / 1000 - json[0].epochtime;

  json.forEach((item) => {
    const epochtime = item.epochtime + interval;
    if (epochtime > now.getTime() / 1000) {
      item.epochtime = epochtime;
      itemsInFuture.push(item);
    }
  });

  return itemsInFuture;
};

export const updateObservations = (json) => {
  const now = new Date();

  Object.keys(json).forEach((geoid) => {
    Object.keys(json[geoid]).forEach((station) => {
      Object.keys(json[geoid][station]).forEach((stationType) => {
        Object.keys(json[geoid][station][stationType]).forEach((distance) => {
          const observations = json[geoid][station][stationType][distance];
          const interval = Math.round(
            now.getTime() / 1000 -
              observations[observations.length - 1].epochtime
          );
          observations.forEach((observation) => {
            observation.epochtime = observation.epochtime + interval;
          });
        });
      });
    });
  });

  return json;
};
