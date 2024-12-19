package fi.fmi.mobileweather;

public class MaxForecastWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return MaxForecastWidgetProvider.class;
    }
}
