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

    public static void scheduleWidgetUpdate(Context context, Class<? extends AppWidgetProvider> providerClass) {
        int[] widgetIds = getActiveWidgetIds(context, providerClass);
        if (widgetIds != null && widgetIds.length > 0) {
            Log.d("Widget Update", "Trying to schedule widget update");
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();

            PeriodicWorkRequest updateRequest =
                    new PeriodicWorkRequest.Builder(WidgetUpdateWorker.class,
                            15, TimeUnit.MINUTES)
                    .setConstraints(constraints)
                    .addTag("WidgetUpdate")
                    .build();

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    "WidgetUpdate",
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