package fi.fmi.mobileweather;

import static android.view.View.INVISIBLE;
import static android.view.View.VISIBLE;
import static fi.fmi.mobileweather.ColorUtils.getPrimaryBlue;
import static fi.fmi.mobileweather.Theme.DARK;
import static fi.fmi.mobileweather.Theme.GRADIENT;
import static fi.fmi.mobileweather.Theme.LIGHT;

import android.graphics.Color;
import android.text.Html;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;

public class MaxForecastWidgetProvider extends BaseWidgetProvider {

    @Override
    protected int getLayoutResourceId() {
        return R.layout.max_forecast_widget_layout;
    }

    // populate widget with data
    @Override
    protected void setWidgetUi(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int appWidgetId, String locationJson) {

        JSONObject forecastJson = widgetInitResult.mainJson();
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        String theme = widgetInitResult.theme();

        // set colors for views which are specific for large and max widgets
        // (not set in the initWidget)
        setLargeWidgetSpecificColors(widgetRemoteViews, theme);
        setMaxWidgetSpecificColors(widgetRemoteViews, theme);

        try {
            // Get the keys of the JSONObject
            Iterator<String> keys = forecastJson.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download mainJson", "First key (geoid): " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = forecastJson.getJSONArray(firstKey);

            // find first epoch time which is in future
            int firstFutureTimeIndex = getFirstFutureTimeIndex(data);
            // if no future time found or less than 6 future times available, do not continue
            if (firstFutureTimeIndex == -1 || data.length() < (firstFutureTimeIndex + 6)) {
                // throw new Exception("No future time found or less than 5 future times available");
                throw new Exception("No future time found or less than 6 future times available");
            }

            // handle the first 6 JsonObjects with future time
            for (int i = firstFutureTimeIndex; i < (firstFutureTimeIndex + 6); i++) {
                JSONObject forecast = data.getJSONObject(i);

                // if first future index set main part of the widget
                if (i == firstFutureTimeIndex) {
                    // set the location name and region
                    String name = forecast.getString("name");
                    String region = forecast.getString("region");
                    widgetRemoteViews.setTextViewText(R.id.locationNameTextView, name + ", ");
                    widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, region);

                    String localTime = forecast.getString("localtime");
                    String formattedTime = getFormattedWeatherTime(localTime);
                    widgetRemoteViews.setTextViewText(R.id.timeTextView, formattedTime);

                    String temperature = forecast.getString("temperature");
                    String weatherSymbol = forecast.getString("smartSymbol");

                    widgetRemoteViews.setTextViewText(R.id.temperatureTextView, addPlusIfNeeded(temperature) + "°");

                    int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol + (theme.equals(LIGHT) ? "_light" : "_dark"), "drawable", context.getPackageName());
                    widgetRemoteViews.setImageViewResource(R.id.weatherIconImageView, drawableResId);

                    // next iteration in loop
                    continue;
                }

                // time at the selected location
                String localTime = forecast.getString("localtime");
                String temperature = forecast.getString("temperature");
                String weatherSymbol = forecast.getString("smartSymbol");

                // j = weather row layout index
                int j = i - 1;

                // get timeTextView0 or timeTextView1 etc. based on i from widgetRemoteViews
                int timeTextViewId = context.getResources().getIdentifier("timeTextView" + j, "id", context.getPackageName());
                int temperatureTextViewId = context.getResources().getIdentifier("temperatureTextView" + j, "id", context.getPackageName());
                int weatherIconImageViewId = context.getResources().getIdentifier("weatherIconImageView" + j, "id", context.getPackageName());

                // ** set the time, temperature and weather icon

                String formattedTime = getFormattedWeatherTime(localTime);
                widgetRemoteViews.setTextViewText(timeTextViewId, formattedTime);

                temperature = addPlusIfNeeded(temperature);
                widgetRemoteViews.setTextViewText(temperatureTextViewId, temperature + "°");

                int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol + (theme.equals(LIGHT) ? "_light" : "_dark"), "drawable", context.getPackageName());
                widgetRemoteViews.setImageViewResource(weatherIconImageViewId, drawableResId);
            }

            // Get the current time
            Date currentTime = new Date();
            // Format the time as "HH:mm"
            SimpleDateFormat formatter = new SimpleDateFormat("HH:mm", Locale.getDefault());
            String formattedTime = formatter.format(currentTime);

            String htmlString = context.getString(R.string.updated)
                    + " "
                    + "<b>"
                    // add time of now in HH:mm format
                    + formattedTime
                    + "</b>";

            // Convert the HTML string to a CharSequence
            CharSequence formattedText;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                formattedText = Html.fromHtml(htmlString, Html.FROM_HTML_MODE_LEGACY);
            } else {
                formattedText = Html.fromHtml(htmlString);
            }

            widgetRemoteViews.setTextViewText(R.id.updateTimeTextView, formattedText);


            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref);

            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final Exception e) {
            Log.e("Download json", "In max widget setWidgetUi exception: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    "(parsing error) " + context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection),
                    appWidgetId
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
    }

    private void setMaxWidgetSpecificColors(RemoteViews remoteViews, String theme) {
        boolean isDarkOrGradient = theme.equals(DARK) || theme.equals(GRADIENT);
        int textColor = isDarkOrGradient ? Color.WHITE : getPrimaryBlue(context);
        int visibility = isDarkOrGradient ? INVISIBLE : VISIBLE;
        int clockIcon = isDarkOrGradient ? R.drawable.ic_clock_white : R.drawable.ic_clock_blue;
        int weatherIcon = isDarkOrGradient ? R.drawable.ic_weather_white : R.drawable.ic_weather_blue;
        int temperatureIcon = isDarkOrGradient ? R.drawable.ic_temperature_white : R.drawable.ic_temperature_blue;
        int logoIcon = isDarkOrGradient ? R.drawable.fmi_logo_white : R.drawable.fmi_logo_blue;

        remoteViews.setInt(R.id.timeTextView, "setTextColor", textColor);
        remoteViews.setViewVisibility(R.id.verticalBarImageView0, visibility);
        remoteViews.setViewVisibility(R.id.verticalBarImageView1, visibility);
        remoteViews.setImageViewResource(R.id.clockSymbolImageView, clockIcon);
        remoteViews.setImageViewResource(R.id.weatherSymbolImageView, weatherIcon);
        remoteViews.setImageViewResource(R.id.temperatureSymbolImageView, temperatureIcon);
        remoteViews.setImageViewResource(R.id.logoImageView, logoIcon);
    }

}
