package fi.fmi.mobileweather;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.JobIntentService;
import android.content.SharedPreferences;
import android.util.Log;
import android.net.Uri;

// MobileWeather widget

public class MobileWeatherBaseWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        super.onUpdate(context, appWidgetManager, appWidgetIds);

        if (appWidgetIds != null) {

            for (int mAppWidgetId : appWidgetIds) {

                Log.d("Widget jobintentservice","id: "+mAppWidgetId);

                Intent intent = new Intent(context, UpdateWidgetJobIntentService.class);
                intent.setAction("FROM WIDGET PROVIDER");
                intent.putExtra(EXTRA_APPWIDGET_ID, mAppWidgetId);
                Uri data = Uri.withAppendedPath(
                        Uri.parse("fi.fmi.mobileweather.MobileWeatherWidget://widget/id/")
                        ,String.valueOf(mAppWidgetId));
                intent.setData(data);

                JobIntentService.enqueueWork(context, UpdateWidgetJobIntentService.class, 1, intent);

            }

        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds)
    {
        // When the user deletes the widget, delete the preference associated with it.
        final int N = appWidgetIds.length;
        for (int i = 0; i < N; i++)
        {
            int id = appWidgetIds[i];
            Log.d("delete", "Deleting shared preferences for widget id: "+id);

            SharedPreferences settings = context.getSharedPreferences("fi.fmi.mobileweather.widget_"+id, Context.MODE_PRIVATE);
            settings.edit().clear().commit();

        }
    }


}
