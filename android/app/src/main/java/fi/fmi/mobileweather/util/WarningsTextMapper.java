package fi.fmi.mobileweather.util;

import java.util.HashMap;
import java.util.Map;

import fi.fmi.mobileweather.R;

// TODO: these to be checked:
public class WarningsTextMapper {
    private static final Map<String, Integer> stringMap = new HashMap<>();

    static {
        stringMap.put("flooding", R.string.warnings_flood);

        stringMap.put("grassFireWeather", R.string.warnings_grass_fire_weather);
        stringMap.put("forestFireWeather", R.string.warnings_forest_fire_weather);

        stringMap.put("hotWeather", R.string.warnings_hot_weather);
        stringMap.put("coldWeather", R.string.warnings_cold_weather);

        stringMap.put("seaIcing", R.string.warnings_icing);
        stringMap.put("pedestrianSafety", R.string.warnings_pedestrian_safety);
        stringMap.put("rain", R.string.warnings_rain);
        stringMap.put("seaThunderStorm", R.string.warnings_sea_thunder_storm);
        stringMap.put("seaWaterHeightHigh", R.string.warnings_sea_water_height_high);
        stringMap.put("seaWaterHeightShallow", R.string.warnings_sea_water_height_shallow);
        stringMap.put("seaWaveHeight", R.string.warnings_sea_wave_height);
        stringMap.put("seaWind", R.string.warnings_sea_wind);
        stringMap.put("thunderstorm", R.string.warnings_thunder_storm);
        stringMap.put("trafficWeather", R.string.warnings_traffic_weather);
        stringMap.put("uvNote", R.string.warnings_uv_note);
        stringMap.put("wind", R.string.warnings_wind);
    }

    public static int getStringResourceId(String type) {
        if (type == null) {
            return 0;
        }

        try {
            return stringMap.containsKey(type) ? stringMap.get(type) : 0;
        } catch (Exception e) {
            return 0;
        }

    }
}
