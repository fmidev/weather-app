package fi.fmi.mobileweather;

public class NewSmallWidgetConfigurationActivity extends NewBaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return NewSmallWidgetProvider.class;
    }
}
