package fi.fmi.mobileweather.worker;

import static fi.fmi.mobileweather.WidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import fi.fmi.mobileweather.LargeForecastWidgetProvider;
import fi.fmi.mobileweather.MediumForecastWidgetProvider;
import fi.fmi.mobileweather.SmallForecastWidgetProvider;

public class WeatherWidgetsUpdateWorker extends Worker {

    public WeatherWidgetsUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        // Perform the widget update here
        Log.d("Widget Update worker", "Weather widgets update trigger by WorkManager");

        // broadcast the update to the widget
        broadcastUpdate();

        // Return success or failure
        return Result.success();
    }

    private void broadcastUpdate() {
        Log.d("Widget Update", "Broadcasting waether forecast widget update");

        // ** Broadcast to all weather forcast widget providers which can receive ACTION_APPWIDGET_AUTO_UPDATE

        // Create intents for each widget provider class
        Intent smallWidgetIntent = new Intent(getApplicationContext(), SmallForecastWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE);
        Intent largeWidgetIntent = new Intent(getApplicationContext(), MediumForecastWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE);
        Intent maxWidgetIntent = new Intent(getApplicationContext(), LargeForecastWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE);


        // Send broadcasts
        getApplicationContext().sendBroadcast(smallWidgetIntent);
        getApplicationContext().sendBroadcast(largeWidgetIntent);
        getApplicationContext().sendBroadcast(maxWidgetIntent);
    }

}















