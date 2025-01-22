package fi.fmi.mobileweather;


import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import fi.fmi.mobileweather.enumeration.WidgetType;

public class SmallForecastWidgetProvider extends BaseWidgetProvider {

    @Override
    protected WidgetType getWidgetType() {
        return WidgetType.WEATHER_FORECAST;
    }

    // default layout resource ID
    @Override
    protected int getLayoutResourceId() {
        // if Android 12 version or higher, the default layout is small
        // (because the widget size is determined by the ...provider_info.xml)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            return R.layout.small_forecast_widget_layout;
        } else {
            // for Android 11 and below, the default layout is xs
            return R.layout.xs_forecast_widget_layout;
        }
    }

    // define here what happens when the user changes the widget size
    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);

        Log.d("Widget Update", "Options changed");

        // Get the new widget size
        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        // Determine the layout resource ID based on the new size
        int layoutId = getLayoutResourceIdForResize(minWidth, minHeight);

        // Store the layout resource ID in shared preferences
        saveLayoutResourceId(context, appWidgetId, layoutId);

        // Update the widget layout without downloading new data
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);
        updateAppWidgetWithoutDataDownload(context, appWidgetManager, appWidgetId, views);
    }

    // TODO: needs to be tested well with all kind of devices:
    private int getLayoutResourceIdForResize(int minWidth, int minHeight) {
        if (minWidth < 100) {
            Log.d("Widget Update", "xs widget " + minWidth + "x" + minHeight);
            return R.layout.xs_forecast_widget_layout;
        } else if (minWidth < 250) {
            Log.d("Widget Update", "Small widget " + minWidth + "x" + minHeight);
            return R.layout.small_forecast_widget_layout;
        } else {
            Log.d("Widget Update", "Horizontal widget " + minWidth + "x" + minHeight);
            return R.layout.horizontal_forecast_widget_layout;
        }
    }

}