package fi.fmi.mobileweather;

import android.app.Activity;

public class LargeWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return LargeWidgetProvider.class;
    }
}
