package fi.fmi.mobileweather.util;

import android.content.Context;
import android.provider.Settings;

public class AirplaneModeUtil {

    public static boolean isAirplaneModeOn(Context context) {
        return Settings.Global.getInt(
                context.getContentResolver(),
                Settings.Global.AIRPLANE_MODE_ON, 0
        ) != 0;
    }
}