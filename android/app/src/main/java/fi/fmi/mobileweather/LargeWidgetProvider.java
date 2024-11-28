package fi.fmi.mobileweather;

import static android.view.View.GONE;
import static android.view.View.VISIBLE;

import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;

public class LargeWidgetProvider extends BaseWidgetProvider {
    @Override
    protected int getLayoutResourceId() {
        return R.layout.large_widget_layout;
    }

    @Override
    protected void onPostExecute(JSONObject json, JSONArray json2, RemoteViews main, SharedPreferencesHelper pref) {

        Result result = initWidget(json, json2, main, pref);

        try {
            // Get the keys of the JSONObject
            Iterator<String> keys = result.json().keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download json", "First key (geoid): " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = result.json().getJSONArray(firstKey);

            // find first epoch time which is in future
            int firstFutureTimeIndex = getFirstFutureTimeIndex(data);
            // if no future time found or less than 5 future times available, do not continue
            if (firstFutureTimeIndex == -1 || data.length() < (firstFutureTimeIndex + 5)) {
                // throw new Exception("No future time found or less than 5 future times available");
                throw new Exception("No future time found or less than 5 future times available");
            }

            // handle the first 5 JsonObjects with future time
            for (int i = firstFutureTimeIndex; i < (firstFutureTimeIndex + 5); i++) {
                JSONObject forecast = data.getJSONObject(i);

                // if first future index
                if (i == firstFutureTimeIndex) {
                    // set the location name and region
                    String name = forecast.getString("name");
                    String region = forecast.getString("region");
                    result.main().setTextViewText(R.id.locationNameTextView, name + ", ");
                    result.main().setTextViewText(R.id.locationRegionTextView, region);
                }


                // time at the selected location
                String localTime = forecast.getString("localtime");
                String temperature = forecast.getString("temperature");
                String weathersymbol = forecast.getString("smartSymbol");

                // get timeTextView0 or timeTextView1 etc. based on i from main
                int timeTextViewId = context.getResources().getIdentifier("timeTextView" + i, "id", context.getPackageName());
                int temperatureTextViewId = context.getResources().getIdentifier("temperatureTextView" + i, "id", context.getPackageName());
                int weatherIconImageViewId = context.getResources().getIdentifier("weatherIconImageView" + i, "id", context.getPackageName());

                // ** set the time, temperature and weather icon

                String formattedTime = getFormattedWeatherTime(localTime);

                result.main().setTextViewText(timeTextViewId, formattedTime);

                temperature = addPlusIfNeeded(temperature);
                result.main().setTextViewText(temperatureTextViewId, temperature + "°");

                Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                        context.getResources().getIdentifier("s" + weathersymbol + (result.background().equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));
                result.main().setImageViewBitmap(weatherIconImageViewId, icon);
            }

            // Update time TODO: should be hidden for release
            result.main().setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));

            // Crisis view
            showCrisisViewIfNeeded(json2, result.main(), pref);

            appWidgetManager.updateAppWidget(appWidgetId, result.main());
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

        appWidgetManager.updateAppWidget(appWidgetId, result.main());
    }

    // TODO
    private void setLargeWidgetColors(RemoteViews main, String background) {
        if (background.equals("dark")) {
            setColors(main,
                    Color.parseColor("#191B22"),
                    Color.rgb(255, 255, 255));
            // TODO: set the colors for the weather row
        }
        else if (background.equals("light")) {
            setColors(main,
                    Color.rgb(255, 255, 255),
                    Color.rgb(48, 49, 147));
            // TODO: set the colors for the weather row
        } else {
            setColors(main,
                    Color.TRANSPARENT,
                    Color.rgb(48, 49, 147));
            // TODO: set the colors for the weather row
        }
    }

}
