package fi.fmi.mobileweather;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.util.Log;
import android.content.ComponentName;

import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.concurrent.TimeUnit;

public class WidgetNotification {

    public static final String ACTION_APPWIDGET_AUTO_UPDATE = "fi.fmi.mobileweather.AUTO_UPDATE";

    public static int[] getActiveWidgetIds(Context context, Class<? extends AppWidgetProvider> providerClass) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        return appWidgetManager.getAppWidgetIds(new ComponentName(context, providerClass));
    }

    public static void scheduleWidgetUpdate(Context context, Class<? extends AppWidgetProvider> providerClass, WidgetType widgetType) {
        int[] widgetIds = getActiveWidgetIds(context, providerClass);
        if (widgetIds != null && widgetIds.length > 0) {
            Log.d("Widget Update", "Trying to schedule widget update");
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();

            if (widgetType == WidgetType.WEATHER_FORECAST) {
                scheduleWeatherWidgetUpdate(context, constraints);
            } else if (widgetType == WidgetType.WARNINGS) {
                scheduleWarningsWidgetUpdate(context, constraints);
            } else {
                Log.d("Widget Update", "Widget update could not be scheduled, because widget type is not recognized");
            }
        } else {
            Log.d("Widget Update", "Widget update could not be scheduled, because no active widgets");
        }
    }

    private static void scheduleWeatherWidgetUpdate(Context context, Constraints constraints) {
        // get the update interval time from the widget setup
        int weatherRepeatInterval = WidgetSetupManager.getWidgetSetup().weather().interval();

        PeriodicWorkRequest weatherUpdateRequest =
                new PeriodicWorkRequest.Builder(WeatherWidgetsUpdateWorker.class,
                        weatherRepeatInterval, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .addTag("WidgetUpdate")
                .build();

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "WidgetUpdate",
                ExistingPeriodicWorkPolicy.REPLACE,
                weatherUpdateRequest
        );
    }

    private static void scheduleWarningsWidgetUpdate(Context context, Constraints constraints) {
        // get the update interval time from the widget setup
        int warningsRepeatInterval = WidgetSetupManager.getWidgetSetup().warnings().interval();

        PeriodicWorkRequest weatherUpdateRequest =
                new PeriodicWorkRequest.Builder(WarningsWidgetsUpdateWorker.class,
                        warningsRepeatInterval, TimeUnit.MINUTES)
                        .setConstraints(constraints)
                        .addTag("WidgetUpdate")
                        .build();

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "WidgetUpdate",
                ExistingPeriodicWorkPolicy.REPLACE,
                weatherUpdateRequest
        );
    }

    // TODO: Cancel all OK here?
    public static void clearWidgetUpdate(Context context) {
        WorkManager.getInstance(context).cancelAllWorkByTag("WidgetUpdate");
    }

}