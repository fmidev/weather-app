package fi.fmi.mobileweather;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.util.Log;
import android.content.ComponentName;
import android.app.AlarmManager;
import java.util.Calendar;

public class NewWidgetNotification {

    public static final String ACTION_APPWIDGET_AUTO_UPDATE = "fi.fmi.mobileweather.AUTO_UPDATE";
    public static final int WIDGET_REQUEST_CODE = 191001;

    private static int[] getActiveWidgetIds(Context context, Class<? extends AppWidgetProvider> providerClass) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        return appWidgetManager.getAppWidgetIds(new ComponentName(context, providerClass));
    }

    public static void scheduleWidgetUpdate(Context context, Class<? extends AppWidgetProvider> providerClass) {
        int[] widgetIds = getActiveWidgetIds(context, providerClass);
        if (widgetIds != null && widgetIds.length > 0) {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = getWidgetAlarmIntent(context, providerClass);

            Calendar calendar = Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());

            // Update the widget every 30 minutes (TODO: change this if needed)
            am.setInexactRepeating(AlarmManager.RTC, calendar.getTimeInMillis(), (/*30 **/ 60 * 1000), pi);
        } else {
            Log.d("NewWidget Update", "Widget update could not be scheduled, because no active widgets");
        }
    }

    private static PendingIntent getWidgetAlarmIntent(Context context, Class<? extends AppWidgetProvider> providerClass) {
        Intent intent = new Intent(context, providerClass)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE)
                .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, getActiveWidgetIds(context, providerClass));
        return PendingIntent.getBroadcast(context, WIDGET_REQUEST_CODE, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static void clearWidgetUpdate(Context context, Class<? extends AppWidgetProvider> providerClass) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        am.cancel(getWidgetAlarmIntent(context, providerClass));
    }
}