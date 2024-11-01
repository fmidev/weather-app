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
// import Calendar
import java.util.Calendar;

public class WidgetNotification {

    public static final int WIDGET_REQUEST_CODE = 191001;

    private static int[] getActiveWidgetIds(Context context){
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] ids = appWidgetManager.getAppWidgetIds(new ComponentName(context, MyWidgetProvider.class));
        return ids;
    }

   public static void scheduleWidgetUpdate(Context context) {
        if(getActiveWidgetIds(context)!=null && getActiveWidgetIds(context).length>0) {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = getWidgetAlarmIntent(context);

            Calendar calendar = Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());

            am.setInexactRepeating(AlarmManager.RTC, calendar.getTimeInMillis(), (/*60**/60*1000), pi);
        }
    }

    private static PendingIntent getWidgetAlarmIntent(Context context) {
        Intent intent = new Intent(context, MyWidgetProvider.class)
                .setAction(MyWidgetProvider.ACTION_AUTO_UPDATE)
                .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS,getActiveWidgetIds(context));
        PendingIntent pi = PendingIntent.getBroadcast(context, WIDGET_REQUEST_CODE, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return pi;
    }

    public static void clearWidgetUpdate(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        am.cancel(getWidgetAlarmIntent(context));
    }
}