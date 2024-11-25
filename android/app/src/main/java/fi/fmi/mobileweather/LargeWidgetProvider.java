package fi.fmi.mobileweather;

import android.content.BroadcastReceiver;

public class LargeWidgetProvider extends BaseWidgetProvider {
    @Override
    protected int getLayoutResourceId() {
        return R.layout.large_widget_layout;
    }
}
