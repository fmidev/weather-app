package fi.fmi.mobileweather;

public class LargeWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return LargeWidgetProvider.class;
    }
}
