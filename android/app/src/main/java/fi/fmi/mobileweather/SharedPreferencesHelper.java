package fi.fmi.mobileweather;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedPreferencesHelper {
    private static final String PREFS_NAME_PREFIX = "fi.fmi.mobileweather.widget_";
    private SharedPreferences sharedPreferences;

    private SharedPreferencesHelper(Context context, int appWidgetId) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME_PREFIX + appWidgetId, Context.MODE_PRIVATE);
    }

    public static SharedPreferencesHelper getInstance(Context context, int appWidgetId) {
        return new SharedPreferencesHelper(context, appWidgetId);
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

    public void saveLong(String key, long value) {
        sharedPreferences.edit().putLong(key, value).apply();
    }

    public long getLong(String key, long defaultValue) {
        return sharedPreferences.getLong(key, defaultValue);
    }

    public void saveInt(String key, int value) {
        sharedPreferences.edit().putInt(key, value).apply();
    }

    public int getInt(String key, int defaultValue) {
        return sharedPreferences.getInt(key, defaultValue);
    }
}