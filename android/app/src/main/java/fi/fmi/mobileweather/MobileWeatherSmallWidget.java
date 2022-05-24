package fi.fmi.mobileweather;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.RemoteViews;
import android.os.Bundle;
import android.util.Log;

// MobileWeather widget, default size 1x1

public class MobileWeatherSmallWidget extends MobileWeatherBaseWidget {


    @Override
    public void onAppWidgetOptionsChanged(Context ctxt,
                                          AppWidgetManager mgr,
                                          int appWidgetId,
                                          Bundle newOptions) {

        RemoteViews updateViews = new RemoteViews(ctxt.getPackageName(), R.layout.smallwidget);

        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        Log.d("widgetSize", minWidth+"x"+minHeight);

        // If size is small then hide feels like icon

        if (minWidth<140 || minHeight<140)
            updateViews.setViewVisibility(R.id.feelsLikeRelativeLayout, View.GONE);
        else
            updateViews.setViewVisibility(R.id.feelsLikeRelativeLayout, View.VISIBLE);

        // If very small then also hide location name and show short time

        if (minWidth<70 || minHeight<70) {
            updateViews.setViewVisibility(R.id.locationTextView, View.GONE);
        } else {
            updateViews.setViewVisibility(R.id.locationTextView, View.VISIBLE);
        }

        if (minWidth<70) {
            updateViews.setViewVisibility(R.id.timeTextView, View.GONE);
            updateViews.setViewVisibility(R.id.shortTimeTextView, View.VISIBLE);
        } else {
            updateViews.setViewVisibility(R.id.shortTimeTextView, View.GONE);
            updateViews.setViewVisibility(R.id.timeTextView, View.VISIBLE);
        }

        mgr.updateAppWidget(appWidgetId, updateViews);
    }

}
