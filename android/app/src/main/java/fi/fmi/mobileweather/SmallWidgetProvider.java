package fi.fmi.mobileweather;


import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

public class SmallWidgetProvider extends BaseWidgetProvider {

    // default layout resource ID
    @Override
    protected int getLayoutResourceId() {
        // if Android 12 version or higher, the default layout is small
        // (because the widget size is determined by the ...provider_info.xml)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            return R.layout.small_widget_layout;
        } else {
            // for Android 11 and below, the default layout is xs
            return R.layout.xs_widget_layout;
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);

        Log.d("Widget Update", "Options changed");

        // Get the new widget size
        int minWidth = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        // Determine the layout resource ID based on the new size
        int layoutId = getLayoutResourceId(minWidth, minHeight);

        // Store the layout resource ID in shared preferences
        saveLayoutResourceId(context, appWidgetId, layoutId);

        // Update the widget layout without downloading new data
        RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);
        updateAppWidgetWithoutDataDownload(context, appWidgetManager, appWidgetId, views);
    }

    // TODO: needs to be tested well with all kind of devices:
    private int getLayoutResourceId(int minWidth, int minHeight) {
        if (minWidth > 100 && minWidth < 200 && minHeight > 120) {
            Log.d("Widget Update", "Small widget " + minWidth + "x" + minHeight);
            return R.layout.small_widget_layout;
        } else if (minWidth >= 200 && minWidth < 300 && minHeight > 120) {
            Log.d("Widget Update", "Medium widget " + minWidth + "x" + minHeight);
            return R.layout.medium_widget_layout;
        } else if (minWidth >= 300) {
            Log.d("Widget Update", "Horizontal widget " + minWidth + "x" + minHeight);
            return R.layout.horizontal_widget_layout;
        } else {
            Log.d("Widget Update", "XS widget " + minWidth + "x" + minHeight);
            return R.layout.xs_widget_layout;
        }
    }

}