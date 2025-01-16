package fi.fmi.mobileweather;

public class MediumForecastWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return MediumForecastWidgetProvider.class;
    }
}
