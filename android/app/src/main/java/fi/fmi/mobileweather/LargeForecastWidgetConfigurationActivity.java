package fi.fmi.mobileweather;

public class LargeForecastWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return LargeForecastWidgetProvider.class;
    }
}
