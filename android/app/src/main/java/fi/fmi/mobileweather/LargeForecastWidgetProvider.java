package fi.fmi.mobileweather;

import static fi.fmi.mobileweather.Theme.LIGHT;

import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;
import android.view.View;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Iterator;

public class LargeForecastWidgetProvider extends BaseWidgetProvider {

    @Override
    protected WidgetType getWidgetType() {
        return WidgetType.WEATHER_FORECAST;
    }
    // set the widget layout here
    @Override
    protected int getLayoutResourceId() {
        return R.layout.large_forecast_widget_layout;
    }

    // populate widget with data
    @Override
    protected void setWidgetUi(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int appWidgetId, String locationJson) {

        JSONObject forecastJson = widgetInitResult.mainJson();
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        String theme = widgetInitResult.theme();

        final int timeStepCount = getWidgetWidthInPixels(appWidgetId) > 380 ? 7 : 6;
        Log.d("widgetWidth", String.valueOf(getWidgetWidthInPixels(appWidgetId)));

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
            // if no future time found or less than 5 future times available, do not continue
            if (firstFutureTimeIndex == -1 || data.length() < (firstFutureTimeIndex + 5)) {
                // throw new Exception("No future time found or less than 5 future times available");
                throw new Exception("No future time found or less than 5 future times available");
            }

            widgetRemoteViews.removeAllViews(R.id.hourForecastRowLayout);

            // handle the first 5 JsonObjects with future time
            for (int i = firstFutureTimeIndex; i < (firstFutureTimeIndex + timeStepCount); i++) {
                JSONObject forecast = data.getJSONObject(i);

                // if first future index
                if (i == firstFutureTimeIndex) {
                    // set the location name and region
                    String name = forecast.getString("name");
                    String region = forecast.getString("region");
                    widgetRemoteViews.setTextViewText(R.id.locationNameTextView, name + ", ");
                    widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, region);
                }

                RemoteViews timeStep = new RemoteViews(context.getPackageName(), R.layout.forecast_timestep);

                // time at the selected location
                String localTime = forecast.getString("localtime");
                String temperature = forecast.getString("temperature");
                int weatherSymbol = forecast.getInt("smartSymbol");

                // ** set the time, temperature and weather icon

                String formattedTime = getFormattedWeatherTime(localTime);
                timeStep.setTextViewText(R.id.timeStepTimeTextView, formattedTime);

                temperature = addPlusIfNeeded(temperature);
                timeStep.setTextViewText(R.id.temperatureTextView, temperature + "°");

                int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol + (theme.equals(LIGHT) ? "_light" : "_dark"), "drawable", context.getPackageName());
                timeStep.setImageViewResource(R.id.weatherIconImageView, drawableResId);
                timeStep.setContentDescription(R.id.weatherIconImageView, getSymbolTranslation(weatherSymbol));

                if (i == timeStepCount - 1) {
                    timeStep.setViewVisibility(R.id.forecastBorder, View.GONE);
                }

                widgetRemoteViews.addView(R.id.hourForecastRowLayout, timeStep);
            }

            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref, true);

            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final Exception e) {
            Log.e("Download json", "In large widget setWidgetUi exception: " + e.getMessage());
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

}
