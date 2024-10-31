package fi.fmi.mobileweather;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.util.TypedValue;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.RemoteViews;
import android.os.Bundle;
import android.util.Log;

/**
 * MobileWeather experimental widgetProvider, default size 1x1.
 */
public class MobileWeatherExperimentalWidgetProvider extends MobileWeatherBaseWidgetProvider {

    /**
     * Called when the widget's options have changed (e.g., size).
     *
     * @param ctxt The context in which this receiver is running.
     * @param mgr The AppWidgetManager instance to use for updating the widget.
     * @param appWidgetId The ID of the widget being updated.
     * @param newOptions The new options for the widget.
     */
    /*@Override
    public void onAppWidgetOptionsChanged(Context ctxt,
                                          AppWidgetManager mgr,
                                          int appWidgetId,
                                          Bundle newOptions) {

        // Create RemoteViews object for updating the widget's layout
        RemoteViews updateViews = new RemoteViews(ctxt.getPackageName(), R.layout.experimentalwidget);

        // Get the minimum width and height from the new options
        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        // Log the widget's new size
        Log.d("widgetSize", minWidth + "x" + minHeight);

        // If the widget size is small, hide the "feels like" icon
        if (minWidth < 140 || minHeight < 140)
            updateViews.setViewVisibility(R.id.feelsLikeRelativeLayout, View.GONE);
        else
            updateViews.setViewVisibility(R.id.feelsLikeRelativeLayout, View.VISIBLE);

        // If the widget size is very small, hide the location name and show short time
        if (minWidth < 70 || minHeight < 70) {
            updateViews.setViewVisibility(R.id.locationTextView, View.GONE);
        } else {
            // Additional logic for larger sizes (omitted for brevity)
        }

        if (minWidth < 70) {
            // Additional logic for very small widths (omitted for brevity)
        } else {
            // Additional logic for larger widths (omitted for brevity)
        }

        // Update the widget with the new layout
        mgr.updateAppWidget(appWidgetId, updateViews);
    }*/
}