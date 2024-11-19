package fi.fmi.mobileweather;


import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.os.Bundle;
import android.widget.RemoteViews;

public class SmallWidgetProvider extends BaseWidgetProvider {

    @Override
    protected int getLayoutResourceId() {
        return R.layout.small_widget_layout;
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);

        // Get the new widget size
        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        // Update the widget layout based on the new size
        RemoteViews views = new RemoteViews(context.getPackageName(), getLayoutResourceId(minWidth, minHeight));
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private int getLayoutResourceId(int minWidth, int minHeight) {
        if (minWidth <= 72 && minHeight <= 72) {
            return R.layout.xs_widget_layout;
        } else if (minWidth <= 144 && minHeight <= 144) {
            return R.layout.small_widget_layout;
        } else if (minWidth <= 180 && minHeight <= 110) {
            return R.layout.medium_widget_layout;
        } else {
            return R.layout.horizontal_widget_layout;
        }
    }


}