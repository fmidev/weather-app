package fi.fmi.mobileweather;

import android.util.Log;
import android.widget.RemoteViews;
import android.view.View;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Iterator;

import static fi.fmi.mobileweather.model.PrefKey.WIDGET_UI_UPDATED;

import fi.fmi.mobileweather.enumeration.WidgetType;
import fi.fmi.mobileweather.model.WidgetData;
import fi.fmi.mobileweather.util.SharedPreferencesHelper;

public class MediumForecastWidgetProvider extends BaseWidgetProvider {
    @Override
    protected WidgetType getWidgetType() {
        return WidgetType.WEATHER_FORECAST;
    }

    @Override
    protected int getLayoutResourceId() {
        return R.layout.medium_forecast_widget_layout;
    }

    // populate widget with data

    private double getTimestepCount(int widgetWidth) {
        final int columnWidth = 52;
        final int margins = 32;

        return Math.floor((widgetWidth - margins)/columnWidth);
    }

    @Override
    protected void setWidgetUi(WidgetData widgetData, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int appWidgetId) {

        JSONObject forecastJson = widgetData.forecast();

        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();

        final double timeStepCount = getTimestepCount(getWidgetWidthInPixels(appWidgetId));
        Log.d("setWidgetData", "widget width: "+ getWidgetWidthInPixels(appWidgetId));

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
                timeStep.setTextViewText(R.id.temperatureTextView, temperature + "°");

                int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol, "drawable", context.getPackageName());
                timeStep.setImageViewResource(R.id.weatherIconImageView, drawableResId);
                timeStep.setContentDescription(R.id.weatherIconImageView, getSymbolTranslation(weatherSymbol));

                if (i == firstFutureTimeIndex + timeStepCount - 1) {
                    timeStep.setViewVisibility(R.id.forecastBorder, View.GONE);
                }

                widgetRemoteViews.addView(R.id.hourForecastRowLayout, timeStep);
            }

            // Crisis view
            showCrisisViewIfNeeded(widgetData.announcements(), widgetRemoteViews, pref, true, false);
            pref.saveLong(WIDGET_UI_UPDATED, System.currentTimeMillis());
            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final Exception e) {
            Log.e("Download json", "In max widget setWidgetUi exception: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    appWidgetId
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
    }
}
