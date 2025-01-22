package fi.fmi.mobileweather.util;

import java.util.HashMap;
import java.util.Map;

import fi.fmi.mobileweather.R;

public class WarningsIconMapper {
    private static final Map<String, Integer> iconMap = new HashMap<>();

    // TODO: these to be checked:
    static {
        iconMap.put("flooding", R.drawable.warnings_flood);

        // NOTE: grassFireWeather and forestFireWeather are using the same icon
        iconMap.put("grassFireWeather", R.drawable.warnings_grass_fire_weather);
        iconMap.put("forestFireWeather", R.drawable.warnings_grass_fire_weather);

        // NOTE: hotWeather and coldWeather are using the same icon
        iconMap.put("hotWeather", R.drawable.warnings_hot_weather);
        iconMap.put("coldWeather", R.drawable.warnings_hot_weather);

        iconMap.put("seaIcing", R.drawable.warnings_icing);
        iconMap.put("pedestrianSafety", R.drawable.warnings_pedestrian_safety);
        iconMap.put("rain", R.drawable.warnings_rain);
        iconMap.put("seaThunderStorm", R.drawable.warnings_thunder_storm);
        iconMap.put("seaWaterHeightHigh", R.drawable.warnings_sea_water_height_high);
        iconMap.put("seaWaterHeightShallow", R.drawable.warnings_sea_water_height_shallow);
        iconMap.put("seaWaveHeight", R.drawable.warnings_sea_wave_height);
        iconMap.put("seaWind", R.drawable.warnings_sea_wind);
        iconMap.put("thunderstorm", R.drawable.warnings_thunder_storm);
        iconMap.put("trafficWeather", R.drawable.warnings_traffic_weather);
        iconMap.put("uvNote", R.drawable.warnings_uv_note);
        iconMap.put("wind", R.drawable.warnings_wind);
    }

    public static int getIconResourceId(String type) {
        if (type == null) {
            return 0;
        }

        try {
            return iconMap.containsKey(type) ? iconMap.get(type) : 0;
        } catch (Exception e) {
            return 0;
        }

    }

    public static int getCircleBackgroundResourceId(String severity) {
        if (severity == null) {
            return 0;
        }

        return switch (severity) {
            case "Moderate" -> R.drawable.warning_circle_yellow;
            case "Severe" -> R.drawable.warning_circle_orange;
            case "Extreme" -> R.drawable.warning_circle_red;
            default -> R.drawable.warning_circle_white;
        };
    }
}
