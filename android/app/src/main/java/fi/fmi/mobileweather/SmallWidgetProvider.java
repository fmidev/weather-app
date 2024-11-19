package fi.fmi.mobileweather;


import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

public class SmallWidgetProvider extends BaseWidgetProvider {

    @Override
    protected int getLayoutResourceId() {
        return R.layout.small_widget_layout;
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);

        Log.d("Widget Update", "Options changed");

        // Get the new widget size
        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        // Update the widget layout based on the new size
        RemoteViews views = new RemoteViews(context.getPackageName(), getLayoutResourceId(minWidth, minHeight));
        updateAppWidget(context, appWidgetManager, appWidgetId, views);
//        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private int getLayoutResourceId(int minWidth, int minHeight) {
        if (minWidth <= 78 /*&& minHeight <= 72*/) {
            Log.d("Widget Update", "XS widget " + minWidth + "x" + minHeight);
            return R.layout.xs_widget_layout;
        } else if (minWidth <= 144 && minHeight <= 144) {
            Log.d("Widget Update", "Small widget " + minWidth + "x" + minHeight);
            return R.layout.small_widget_layout;
        } else if (minWidth <= 180 && minHeight <= 110) {
            Log.d("Widget Update", "Medium widget " + minWidth + "x" + minHeight);
            return R.layout.medium_widget_layout;
        } else {
            Log.d("Widget Update", "Horizontal widget " + minWidth + "x" + minHeight);
            return R.layout.horizontal_widget_layout;
        }
    }


}