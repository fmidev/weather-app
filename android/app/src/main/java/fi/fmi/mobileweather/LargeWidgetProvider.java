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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;

public class LargeWidgetProvider extends BaseWidgetProvider {
    @Override
    protected int getLayoutResourceId() {
        return R.layout.large_widget_layout;
    }

    @Override
    protected void onPostExecute(JSONObject json, JSONArray json2, RemoteViews main, SharedPreferencesHelper pref) {

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Get settings
        String background = pref.getString("background", "light");
        Log.d("Download json", "Background: " + background);

        main = new RemoteViews(context.getPackageName(), getLayoutResourceId());

        // Show normal view
        main.setInt(R.id.normalLayout, "setVisibility", VISIBLE);
        // Hide error view
        main.setInt(R.id.errorLayout, "setVisibility", GONE);

        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        json = useNewOrStoredJsonObject(json, pref);
        if (json == null) return;

        if (background.equals("dark")) {
            setColors(main,
                    Color.parseColor("#191B22"),
                    Color.rgb(255, 255, 255));
        }
        else if (background.equals("light")) {
            setColors(main,
                    Color.rgb(255, 255, 255),
                    Color.rgb(48, 49, 147));
        } else {
            setColors(main,
                    Color.TRANSPARENT,
                    Color.rgb(48, 49, 147));
        }
        Log.d("Download json", "Forecast json: " + json);
        Log.d("Download json", "Crisis json: " + json2);


        try {
            // Get the keys of the JSONObject
            Iterator<String> keys = json.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download json", "First key (geoid): " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = json.getJSONArray(firstKey);

            // get the first 5 JsonObject from the JSONArray
            for (int i = 0; i < 5; i++) {
                JSONObject forecast = data.getJSONObject(i);

                if (i == 0) {
                    // set the location name and region
                    String name = forecast.getString("name");
                    String region = forecast.getString("region");
                    main.setTextViewText(R.id.locationNameTextView, name + ", ");
                    main.setTextViewText(R.id.locationRegionTextView, region);
                }


                long epochTime = forecast.getLong("epochtime");
                String temperature = forecast.getString("temperature");
                String weathersymbol = forecast.getString("smartSymbol");

                // get timeTextView0 or timeTextView1 etc. based on i from main
                int timeTextViewId = context.getResources().getIdentifier("timeTextView" + i, "id", context.getPackageName());
                int temperatureTextViewId = context.getResources().getIdentifier("temperatureTextView" + i, "id", context.getPackageName());
                int weatherIconImageViewId = context.getResources().getIdentifier("weatherIconImageView" + i, "id", context.getPackageName());

                // ** set the time, temperature and weather icon

                String formattedTime = getFormattedWeatherTime(epochTime);
                main.setTextViewText(timeTextViewId, formattedTime);

                temperature = addPlusIfNeeded(temperature);
                main.setTextViewText(temperatureTextViewId, temperature + "°");

                Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                        context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));
                main.setImageViewBitmap(weatherIconImageViewId, icon);
            }

            // Update time TODO: should be hidden for release
            main.setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));


            // *** Crisis view
            // example json: [{"type":"Crisis","content":"Varoitusnauha -testi EN","link":"https://www.fmi.fi"}]

            json2 = useNewOrStoredCrisisJsonObject(json2, pref);

            if (json2 != null) {
                boolean crisisFound = false;
                try {
                    for (int i = 0; i < json2.length(); i++) {
                        JSONObject jsonObject = json2.getJSONObject(i);
                        String type = jsonObject.getString("type");
                        if (type.equals("Crisis")) {
                            String content = jsonObject.getString("content");
                            main.setViewVisibility(R.id.crisisTextView, VISIBLE);
                            main.setTextViewText(R.id.crisisTextView, content);
                            crisisFound = true;
                            // if a crisis found, exit the loop
                            break;
                        }
                    }
                } catch (JSONException e) {
                    Log.e("Download json", "Crisis Json parsing error: " + e.getMessage());
                }
                if (!crisisFound) {
                    main.setViewVisibility(R.id.crisisTextView, GONE);
                }
            } else {
                main.setViewVisibility(R.id.crisisTextView, GONE);
            }

            appWidgetManager.updateAppWidget(appWidgetId, main);
            return;

        } catch (final JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    "(parsing error) " + context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection)
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, main);
    }

}
