package fi.fmi.mobileweather;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.util.Log;
import android.content.ComponentName;

public class MyWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_AUTO_UPDATE =
            "fi.fmi.mobileweather.AUTO_UPDATE";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if(intent!=null && intent.getAction()!=null &&
                intent.getAction().equals(ACTION_AUTO_UPDATE)){
            onUpdate(context);
        }
    }

    private void onUpdate(Context context) {
        Log.d("MyWidget Update","Udpate triggered");
        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(),getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);
        onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all
        final int N = appWidgetIds.length;
        for (int i = 0; i < N; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
        }
    }

    /*@Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d("MyWidget Update","Udpate triggered");
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }*/

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        WidgetNotification.scheduleWidgetUpdate(context);
    }

    private void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        // Update the text
        views.setTextViewText(R.id.widget_text, "Updated Text at " + java.text.DateFormat.getTimeInstance().format(new java.util.Date()));

        // Update the image
//        views.setImageViewResource(R.id.widget_image, R.drawable.updated_image);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        WidgetNotification.clearWidgetUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        WidgetNotification.clearWidgetUpdate(context);
    }
}