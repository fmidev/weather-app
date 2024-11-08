package fi.fmi.mobileweather;


import static fi.fmi.mobileweather.NewWidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.util.Log;
import android.content.ComponentName;
import android.app.AlarmManager;
// import Calendar
import java.util.Calendar;

public class NewSmallWidgetNotification {

    public static final int WIDGET_REQUEST_CODE = 191001;

    private static int[] getActiveWidgetIds(Context context){
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(new ComponentName(context, NewSmallWidgetProvider.class));
        return ids;
    }

   public static void scheduleWidgetUpdate(Context context) {
        if(getActiveWidgetIds(context)!=null && getActiveWidgetIds(context).length>0) {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = getWidgetAlarmIntent(context);

            Calendar calendar = Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());

            am.setInexactRepeating(AlarmManager.RTC, calendar.getTimeInMillis(), (1*60*1000), pi);
        } else {
            Log.d("WidgetNotification","Widget update could not be scheduled, because no active widgets");
        }
    }

    private static PendingIntent getWidgetAlarmIntent(Context context) {
        Intent intent = new Intent(context, NewSmallWidgetProvider.class)
                .setAction(ACTION_APPWIDGET_AUTO_UPDATE)
                .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS,getActiveWidgetIds(context));
        PendingIntent pi = PendingIntent.getBroadcast(context, WIDGET_REQUEST_CODE, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return pi;
    }

    public static void clearWidgetUpdate(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        am.cancel(getWidgetAlarmIntent(context));
    }
}