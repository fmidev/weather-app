package fi.fmi.mobileweather;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;

public class MaxForecastWidgetProvider extends BaseWidgetProvider {

    @Override
    protected int getLayoutResourceId() {
        return R.layout.max_forecast_widget_layout;
    }

    // populate widget with data
    @Override
    protected void setWidgetData(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult) {
        JSONObject forecastJson = widgetInitResult.forecastJson();
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        String background = widgetInitResult.background();

        // set colors for views which are specific for large widget
        // (not set in the initWidget)
        setLargeWidgetSpecificColors(widgetRemoteViews, background);

        try {
            // Get the keys of the JSONObject
            Iterator<String> keys = forecastJson.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download forecastJson", "First key (geoid): " + firstKey);

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
                    String weathersymbol = forecast.getString("smartSymbol");
                    widgetRemoteViews.setTextViewText(R.id.temperatureTextView, addPlusIfNeeded(temperature) + "°");
                    Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                            context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));
                    widgetRemoteViews.setImageViewBitmap(R.id.weatherIconImageView, icon);

                    // next iteration in loop
                    continue;
                }

                // time at the selected location
                String localTime = forecast.getString("localtime");
                String temperature = forecast.getString("temperature");
                String weathersymbol = forecast.getString("smartSymbol");

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

                Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                        context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));
                widgetRemoteViews.setImageViewBitmap(weatherIconImageViewId, icon);
            }

            widgetRemoteViews.setTextViewText(R.id.updateTimeTextView, context.getString(R.string.updated)
                    + " "
                    + DateFormat.getTimeInstance().format(new Date()));

            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref);

            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final Exception e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    "(parsing error) " + context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection)
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
    }
}
