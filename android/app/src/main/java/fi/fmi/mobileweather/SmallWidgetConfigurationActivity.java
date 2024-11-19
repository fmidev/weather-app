package fi.fmi.mobileweather;

public class SmallWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return SmallWidgetProvider.class;
    }
}
