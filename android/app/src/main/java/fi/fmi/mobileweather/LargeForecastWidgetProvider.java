package fi.fmi.mobileweather;

import android.text.Html;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;

import static fi.fmi.mobileweather.model.PrefKey.WIDGET_UI_UPDATED;

import fi.fmi.mobileweather.enumeration.WidgetType;
import fi.fmi.mobileweather.model.WidgetData;

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

    private double getTimestepCount(int widgetWidth) {
        final int columnWidth = 46;
        final int margins = 32;

        return Math.floor((widgetWidth - margins)/columnWidth);
    }

    @Override
    protected void setWidgetUi(WidgetData widgetData, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int appWidgetId) {

        JSONObject forecastJson = widgetData.forecast();
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        final double timeStepCount = getTimestepCount(getWidgetWidthInPixels(appWidgetId));

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
            // if no future time found or less than 6 future times available, do not continue
            if (firstFutureTimeIndex == -1 || data.length() < (firstFutureTimeIndex + 6)) {
                // throw new Exception("No future time found or less than 5 future times available");
                throw new Exception("No future time found or less than 6 future times available");
            }

            widgetRemoteViews.removeAllViews(R.id.forecastContainer);

            // handle the first 6 JsonObjects with future time
            for (int i = firstFutureTimeIndex; i < (firstFutureTimeIndex + timeStepCount); i++) {
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
                    int weatherSymbol = forecast.getInt("smartSymbol");

                    widgetRemoteViews.setTextViewText(R.id.temperatureTextView, addPlusIfNeeded(temperature) + "°");

                    int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol, "drawable", context.getPackageName());
                    widgetRemoteViews.setImageViewResource(R.id.weatherIconImageView, drawableResId);
                    widgetRemoteViews.setContentDescription(R.id.weatherIconImageView, getSymbolTranslation(weatherSymbol));

                    // next iteration in loop
                    continue;
                }
                RemoteViews timeStep = new RemoteViews(context.getPackageName(), R.layout.medium_forecast_timestep);

                // time at the selected location
                String localTime = forecast.getString("localtime");
                String temperature = forecast.getString("temperature");
                int weatherSymbol = forecast.getInt("smartSymbol");

                // j = weather row layout index
                int j = i - 1;

                // ** set the time, temperature and weather icon

                String formattedTime = getFormattedWeatherTime(localTime);
                timeStep.setTextViewText(R.id.timeTextView, formattedTime);

                temperature = addPlusIfNeeded(temperature);
                timeStep.setTextViewText(R.id.temperatureTextView, temperature + "°");

                int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol, "drawable", context.getPackageName());
                timeStep.setImageViewResource(R.id.weatherIconImageView, drawableResId);
                timeStep.setContentDescription(R.id.weatherIconImageView, getSymbolTranslation(weatherSymbol));

                widgetRemoteViews.addView(R.id.forecastContainer, timeStep);
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
            showCrisisViewIfNeeded(widgetData.announcements(), widgetRemoteViews, pref, true, false);
            pref.saveLong(WIDGET_UI_UPDATED, System.currentTimeMillis());
            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final Exception e) {
            Log.e("Download json", "In large widget setWidgetUi exception: " + e.getMessage());
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
