package fi.fmi.mobileweather;

import android.app.Activity;

public class SmallWarningsWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return SmallWarningsWidgetProvider.class;
    }
}
