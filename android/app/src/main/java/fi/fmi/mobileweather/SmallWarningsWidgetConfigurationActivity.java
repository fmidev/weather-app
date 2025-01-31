package fi.fmi.mobileweather;

public class SmallWarningsWidgetConfigurationActivity extends BaseWidgetConfigurationActivity {
    @Override
    protected Class<?> getWidgetProviderClass() {
        return SmallWarningsWidgetProvider.class;
    }
}
