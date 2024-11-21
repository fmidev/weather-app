package fi.fmi.mobileweather;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedPreferencesHelper {
    private static final String PREFS_NAME = "fi.fmi.mobileweather.widget_";
    private static SharedPreferences sharedPreferences;
    private static SharedPreferencesHelper instance;

    private SharedPreferencesHelper(Context context, int appWidgetId) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME + appWidgetId, Context.MODE_PRIVATE);
    }

    public static synchronized SharedPreferencesHelper getInstance(Context context, int appWidgetId) {
        if (instance == null) {
            instance = new SharedPreferencesHelper(context, appWidgetId);
        }
        return instance;
    }

    public SharedPreferences getSharedPreferences() {
        return sharedPreferences;
    }

    public void saveString(String key, String value) {
        sharedPreferences.edit().putString(key, value).apply();
    }

    public String getString(String key, String defaultValue) {
        return sharedPreferences.getString(key, defaultValue);
    }

    // Add other methods to save and retrieve different data types as needed
}

