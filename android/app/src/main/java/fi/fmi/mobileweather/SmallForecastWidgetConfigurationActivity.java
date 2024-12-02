package fi.fmi.mobileweather;

public class SmallForecastWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return SmallForecastWidgetProvider.class;
    }
}
