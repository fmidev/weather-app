package fi.fmi.mobileweather;

import android.content.BroadcastReceiver;

public class SmallWarningsWidgetProvider extends BaseWarningsWidgetProvider {
    @Override
    protected int getLayoutResourceId() {
        return R.layout.small_warnings_widget_layout;
    }
}
