export const DataMode = {
  default: 'default',
  constant: 'constant',
  dynamic: 'dynamic',
};

export const updateWarningTimes = (json) => {
  const now = new Date();
  const updated = new Date(json.data.updated);
  const interval = now.getTime() - updated.getTime();

  json.data.updated = new Date(updated.getTime() + interval).toISOString();

  let startTime = new Date(json.data.startTime);
  json.data.startTime = new Date(startTime.getTime() + interval).toISOString();
  let endTime = new Date(json.data.endTime);
  json.data.endTime = new Date(endTime.getTime() + interval).toISOString();

  json.data.warnings.forEach((item) => {
    let warningStartTime = new Date(Date.parse(item.duration.startTime));
    let warningEndTime = new Date(Date.parse(item.duration.endTime));

    warningStartTime.setYear(now.getFullYear());
    warningStartTime.setMonth(now.getMonth());
    warningStartTime.setDate(now.getDate());
    warningEndTime.setYear(now.getFullYear());
    warningEndTime.setMonth(now.getMonth());
    warningEndTime.setDate(now.getDate() + 1);

    item.duration.startTime = warningStartTime.toISOString();
    item.duration.endTime = warningEndTime.toISOString();
  });

  return json;
};

const nextFullHour = () => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now;
};

const getSuntime = (epochtime, suntime) => {
  return (
    new Date(epochtime * 1000)
      .toISOString()
      .replaceAll('-', '')
      .substring(0, 8) + suntime.substring(8)
  );
};

export const updateForecast = (json, geoid, mode) => {
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
  const forecastStart = nextFullHour().getTime() / 1000;
  const modtime = now
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .substring(0, 15);

  modified[geoid].forEach((item, index) => {
    if (mode === DataMode.constant) {
      const epochtime = forecastStart + index * 3600;
      item.epochtime = epochtime;

      if (item.sunrise && item.sunset && item.modtime) {
        if (item.sunrise && item.sunset && item.modtime) {
          item.sunrise = getSuntime(epochtime, item.sunrise);
          item.sunset = getSuntime(epochtime, item.sunset);
          item.modtime = modtime;
        }
        item.modtime = modtime;
      }
      itemsInFuture.push(item);
    } else {
      const epochtime = item.epochtime + interval;

      if (epochtime > now.getTime() / 1000) {
        item.epochtime = epochtime;

        if (item.sunrise && item.sunset && item.modtime) {
          item.sunrise = getSuntime(epochtime, item.sunrise);
          item.sunset = getSuntime(epochtime, item.sunset);
          item.modtime = modtime;
        }

        itemsInFuture.push(item);
      }
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
