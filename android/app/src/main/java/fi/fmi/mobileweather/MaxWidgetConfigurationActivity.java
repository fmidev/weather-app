package fi.fmi.mobileweather;

public class MaxWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return MaxWidgetProvider.class;
    }
}
