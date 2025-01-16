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
    public static final int DEFAULT_INTERVAL = 15;
    public static final String WORK_NAME = "ForecastWidgetUpdateWork";

    public static int[] getActiveWidgetIds(Context context, Class<? extends AppWidgetProvider> providerClass) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        return appWidgetManager.getAppWidgetIds(new ComponentName(context, providerClass));
    }

    public static void scheduleWidgetUpdate(Context context, Class<? extends AppWidgetProvider> providerClass) {
        int[] widgetIds = getActiveWidgetIds(context, providerClass);
        if (widgetIds != null && widgetIds.length > 0) {
            Log.d("scheduleWidgetUpdate", "Trying to schedule widget update");
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();

            // get the update interval time from the widget setup

            int repeatInterval = DEFAULT_INTERVAL;

            try {
                WidgetSetupManager.initializeSetup(context);
                repeatInterval = WidgetSetupManager.getWidgetSetup().getWeather().getInterval();
            } catch(Exception e) {
                Log.e("scheduleWidgetUpdate", "Failed to read interval: "+e.getMessage());
            }

            Log.d("scheduleWidgetUpdate", "Interval: "+repeatInterval);

            PeriodicWorkRequest updateRequest =
                    new PeriodicWorkRequest.Builder(WidgetUpdateWorker.class,
                            repeatInterval, TimeUnit.MINUTES)
                    .setConstraints(constraints)
                    .addTag("ForecastWidgetUpdate")
                    .build();

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    WORK_NAME,
                    ExistingPeriodicWorkPolicy.REPLACE,
                    updateRequest
            );
        } else {
            Log.d("Widget Update", "Widget update could not be scheduled, because no active widgets");
        }
    }

    // TODO: Cancel all OK here?
    public static void clearWidgetUpdate(Context context) {
        WorkManager.getInstance(context).cancelAllWorkByTag("WidgetUpdate");
    }

}