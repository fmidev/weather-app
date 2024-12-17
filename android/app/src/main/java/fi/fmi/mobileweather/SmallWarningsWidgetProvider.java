package fi.fmi.mobileweather;

import android.content.BroadcastReceiver;

public class SmallWarningsWidgetProvider extends BaseWarningsWidgetProvider {
    @Override
    protected WidgetType getWidgetType() {
        return WidgetType.WARNINGS;
    }

    @Override
    protected int getLayoutResourceId() {
        return R.layout.small_warnings_widget_layout;
    }
}
