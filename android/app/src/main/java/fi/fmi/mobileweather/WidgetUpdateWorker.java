package fi.fmi.mobileweather;

import static fi.fmi.mobileweather.WidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class WidgetUpdateWorker extends Worker {

    public WidgetUpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        // Perform the widget update here
        Log.d("Widget Update worker", "Widget update trigger by WorkManager");

        // broadcast the update to the widget
        broadcastUpdate();

        // Return success or failure
        return Result.success();
    }

    private void broadcastUpdate() {
        Log.d("Widget Update", "Broadcasting widget update");

        // ** broadcast to all widget providers which can receive ACTION_APPWIDGET_AUTO_UPDATE
        //    (SmallWidgetProvider and LargeWidgetProvider)

        // Create intents for each widget provider class
        Intent smallWidgetIntent = new Intent(getApplicationContext(), SmallWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE);
        Intent largeWidgetIntent = new Intent(getApplicationContext(), LargeWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE);

        // Send broadcasts
        getApplicationContext().sendBroadcast(smallWidgetIntent);
        getApplicationContext().sendBroadcast(largeWidgetIntent);
    }

}















