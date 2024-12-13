package fi.fmi.mobileweather;

import java.util.HashMap;
import java.util.Map;

public class WarningsIconMapper {
    private static final Map<String, Integer> iconMap = new HashMap<>();

    static {
        iconMap.put("trafficWeather", R.drawable.warnings_traffic_weather);
        iconMap.put("seaWind", R.drawable.warnings_sea_wind);
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
}
