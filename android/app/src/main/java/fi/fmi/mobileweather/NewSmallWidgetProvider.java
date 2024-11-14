package fi.fmi.mobileweather;


import static android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;
import static fi.fmi.mobileweather.NewWidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.Manifest;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.widget.RemoteViews;
import android.util.Log;
import android.content.ComponentName;
import android.util.DisplayMetrics;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.fewlaps.quitnowcache.QNCache;
import com.fewlaps.quitnowcache.QNCacheBuilder;

import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.location.Location;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;


public class NewSmallWidgetProvider extends AppWidgetProvider {

    private QNCache cache = new QNCacheBuilder().setAutoReleaseInSeconds(60 * 60).createQNCache();
    private Context context;
    private int appWidgetId;
    private AppWidgetManager appWidgetManager;
//    private static Location location;
    private Handler timeoutHandler;
    private Runnable timeoutRunnable;
    private SharedPreferences pref;
    private static String weatherUrl;
    private static String announcementsUrl;


    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("NewSmallWidget Update","onReceive");
        super.onReceive(context, intent);
        String action = intent.getAction();
        if( action != null &&
                (action.equals(ACTION_APPWIDGET_AUTO_UPDATE) || action.equals(ACTION_APPWIDGET_UPDATE))) {
            updateAfterReceive(context);
        }
    }

    private void updateAfterReceive(Context context) {
        Log.d("NewSmallWidget Update","updateAfterReceive triggered");
        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(),getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);
        onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d("NewSmallWidget Update","onUpdate");


        // There may be multiple widgets active, so update all
        final int N = appWidgetIds.length;
        for (int i = 0; i < N; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
        }
    }

    /*@Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d("MyWidget Update","Udpate triggered");
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }*/

    @Override
    public void onEnabled(Context context) {
        Log.d("NewSmallWidget Update","onEnabled");
        super.onEnabled(context);

        // Initialize the widget setup
        WidgetSetupManager.initializeSetup(context);
        // Use the setup data
        WidgetSetup setup = WidgetSetupManager.getWidgetSetup();
        if (setup != null) {
            // Update the widget with the setup data
            weatherUrl = setup.getWeather().getApiUrl();
            Log.d("NewSmallWidget Update", "Weather URL: " + weatherUrl);
            // TODO: needs to be language specific
            announcementsUrl = setup.getAnnouncements().getApi().getFi();
            Log.d("NewSmallWidget Update", "Announcements URL: " + announcementsUrl);
        }

        NewWidgetNotification.scheduleWidgetUpdate(context, NewSmallWidgetProvider.class);
    }

    private void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d("NewSmallWidget Update","updateAppWidget");

        this.context = context;
        this.appWidgetManager = appWidgetManager;
        this.appWidgetId = appWidgetId;
        this.pref= context.getSharedPreferences("fi.fmi.mobileweather.widget_" + appWidgetId,
                Context.MODE_PRIVATE);

        Log.d("Widget Location", "Trying to request location");
        if ((ContextCompat.checkSelfPermission(context,
                android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                || (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)) {

            /*Intent serviceIntent = new Intent(context, LocationService.class);
            ContextCompat.startForegroundService(context, serviceIntent);

            LocationService.setLocationUpdateCallback(new LocationUpdateCallback() {
                @Override
                public void onLocationUpdated(Location location) {
                    // Handle the location update
                    Log.d("Widget Location", "New location: " + location.toString());
                    String latlon = getLatLonString(location);
                    pref.edit().putString("latlon", latlon).apply();
                    execute(latlon);
                }
            });*/

            /*PeriodicWorkRequest locationWorkRequest = new PeriodicWorkRequest.Builder(LocationWorker.class, 1, TimeUnit.MINUTES).build();
            WorkManager.getInstance(context).enqueue(locationWorkRequest);

            LocationWorker.setLocationUpdateCallback(new LocationUpdateCallback() {
                @Override
                public void onLocationUpdated(Location location) {
                    // Handle the location update

                    Log.d("Widget Location", "New location: " + location.toString());
                    // Get the location coordinates string from location
                    String latlon = getLatLonString(location);
                    // Store latlon to shared preferences (cannot be null here)
                    pref.edit().putString("latlon", latlon).apply();
//                        NewSmallWidgetProvider.location = location;
                    Log.d("Widget Location", "Update with new location");
                    // Cancel timeout
                    if (timeoutHandler != null && timeoutRunnable != null) {
                        Log.d("Widget Location", "Timer canceled");
                        timeoutHandler.removeCallbacks(timeoutRunnable);
                    }
                    execute(latlon);
                }
            });*/
            Log.d("Widget Location", "Location requested");
            Boolean ok = SingleShotLocationProvider.requestSingleUpdate(context,
                    location -> {
                        Log.d("Widget Location", "New location: " + location.toString());
                        // Get the location coordinates string from location
                        String latlon = getLatLonString(location);
                        // Store latlon to shared preferences (cannot be null here)
                        pref.edit().putString("latlon", latlon).apply();
//                        NewSmallWidgetProvider.location = location;
                        Log.d("Widget Location", "Update with new location");
                        // Cancel timeout
                        if (timeoutHandler != null && timeoutRunnable != null) {
                            Log.d("Widget Location", "Timer canceled");
                            timeoutHandler.removeCallbacks(timeoutRunnable);
                        }
                        execute(latlon);
                    });
            if (ok) {
                // Set timeout for location request
                timeoutHandler = new Handler(Looper.getMainLooper());
                // Timeout runnable
                timeoutRunnable = () -> {
                    // if we have old location, update widget with it
                    // TODD: temporarily Utsjoki latlon as default
                    String latlon = pref.getString("latlon", "69.90,27.02");
                    if (latlon != null) {
                        Log.d("Widget Location", "Timeout reached, update with stored location");
                        execute(latlon);
                    } else {
                        Log.d("Widget Location", "Timeout reached, no location available");
                    }
                };
                Log.d("Widget Location", "Timer started");
                // 1 minute timeout
                timeoutHandler.postDelayed(timeoutRunnable, 60 * 1000); // 1 minute timeout
            } else {
                Log.d("Widget Location", "Location not available from Location Manager");
                showErrorView(context, context.getSharedPreferences(
                        "fi.fmi.mobileweather.widget_" + appWidgetId,
                        Context.MODE_PRIVATE),
                        context.getResources().getString(R.string.positioning_failed),
                        ""
                );
            }
        } else {
            Log.d("Widget Location", "Location permission not granted");
            showErrorView(context, context.getSharedPreferences(
                    "fi.fmi.mobileweather.widget_" + appWidgetId,
                    Context.MODE_PRIVATE),
                    context.getResources().getString(R.string.positioning_failed),
                    ""
            );

//            this.updateWidgetWithPositioningError(incomingAppWidgetId);
        }



//        execute();

        /*// Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        // Update the text
        views.setTextViewText(R.id.widget_text, "Updated Text at " + java.text.DateFormat.getTimeInstance().format(new java.util.Date()));

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);*/
}

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        NewWidgetNotification.clearWidgetUpdate(context, NewSmallWidgetProvider.class);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        NewWidgetNotification.clearWidgetUpdate(context, NewSmallWidgetProvider.class);
    }

    public void execute(String latlon) {
        ExecutorService executorService = Executors.newFixedThreadPool(2);

        // Get language string
        String language = getLanguageString();

        // Temporary test values
//        String latlon = "60.16952,24.93545";
//        String language = "fi";

        String weatherUrlStr = weatherUrl + "?latlon=" +
                latlon +
                "&endtime=data&format=json&attributes=geoid&lang=" +
                language +
                "&tz=utc&who=MobileWeather&producer=default&param=geoid,epochtime,localtime,utctime,name,region,iso2,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,dewPoint,smartSymbol,windDirection,windSpeedMS,pop,hourlymaximumgust,relativeHumidity,pressure,precipitation1h,windCompass8";

        /*String url = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries?latlon=" +
                latlon +
                "&endtime=data&format=json&attributes=geoid&lang=" +
                language +
                "&tz=utc&who=MobileWeather&producer=default&param=geoid,epochtime,localtime,utctime,name,region,iso2,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,dewPoint,smartSymbol,windDirection,windSpeedMS,pop,hourlymaximumgust,relativeHumidity,pressure,precipitation1h,windCompass8";
*/

//        String url2 = "http://localhost:3000/mobileannouncements/crisis";
        // TODO: temporary for testing.
        String announcementsUrlStr = "https://en-beta.ilmatieteenlaitos.fi/api/general/mobileannouncements";
//        String announcementsUrlStr = announcementsUrl;

        String[] urls = {weatherUrlStr, announcementsUrlStr};

        Future<JSONObject> future1 = executorService.submit(() -> fetchJsonObject(urls[0]));
        Future<JSONArray> future2 = executorService.submit(() -> fetchJsonArray(urls[1]));

        executorService.submit(() -> {
            try {
                JSONObject result1 = future1.get();
                JSONArray result2 = future2.get();
                onPostExecute(result1, result2);
            } catch (Exception e) {
                Log.e("DownloadData json", "Exception: " + e.getMessage());
//                e.printStackTrace();
            }
        });
    }

    private static @NonNull String getLanguageString() {
        String language = Locale.getDefault().getLanguage();
        Log.d("language", language);
        if (!language.equals("fi") && !language.equals("sv") && !language.equals("en"))
            language = "en";
        return language;
    }

    private static @NonNull String getLatLonString(Location location) {
        double latitude = location.getLatitude();
        double longitude = location.getLongitude();
        // Round to 4 decimals
        latitude = (double)Math.round(latitude * 10000d) / 10000d;
        longitude = (double)Math.round(longitude * 10000d) / 10000d;
        String latlon = latitude + "," + longitude;
        return latlon;
    }

    private JSONObject fetchJsonObject(String src) {
        try {
            String jsonString = fetchJsonString(src);
            return new JSONObject(jsonString);
        } catch (JSONException e) {
            Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    private JSONArray fetchJsonArray(String src) {
        try {
            String jsonString = fetchJsonString(src);
            return new JSONArray(jsonString);
        } catch (JSONException e) {
            Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    private String fetchJsonString(String src) {
        if (src == null || src.equals(""))
            return null;

        // Check can we find result from cache

        /*String cachejson = (String) cache.get(src);

        if (cachejson != null) {
            Log.d("cache", src + " found from cache");

            try {
                JSONObject jsonObject = new JSONObject(cachejson);
                return jsonObject;
            } catch (JSONException e) {
                e.printStackTrace();
            }

            return null;
        }*/

        // Log.d("url", src);

        try {
            // Log.d("src",src);
            URL url = new URL(src);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(10000);
            connection.connect();
            InputStream input = connection.getInputStream();

            try {
                BufferedReader streamReader = new BufferedReader(new InputStreamReader(input, "UTF-8"));
                StringBuilder responseStrBuilder = new StringBuilder();

                String inputStr;
                while ((inputStr = streamReader.readLine()) != null)
                    responseStrBuilder.append(inputStr);

                String jsonstr = responseStrBuilder.toString();

                Log.d("DownloadData json", "fetchData Forecast json: " + jsonstr);

                // Store to cache

//                cache.set(src, jsonstr, 2 * 60 * 1000);
//                JSONObject jsonObject = new JSONObject(jsonstr);
                return jsonstr;

                // returns the json object
//                return jsonObject;

            } catch (IOException e) {
                e.printStackTrace();
            }

            // if something went wrong, return null
            return null;

        } catch (IOException e) {
//            e.printStackTrace();
            Log.e("Exception", Objects.requireNonNull(e.getMessage()));
            return null;
        }
    }

    protected void onPostExecute(JSONObject json, JSONArray json2) {

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Get settings


        String background = pref.getString("background", "transparent");
        Log.d("DownloadData json", "Background: " + background);

        /*String forecast_mode = pref.getString("forecast", "hours");
        String version = pref.getString("version", "advanced");*/

        // Widget manager gives widget width and height

        /*Bundle options = WidgetManager.getAppWidgetOptions(WidgetID);
        int minWidth = options.getInt(appWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = options.getInt(appWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);*/

        // Get the layout for the App Widget
        RemoteViews main = new RemoteViews(context.getPackageName(), R.layout.new_small_widget_layout);

        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        Date now = new Date();

        if (json == null) {
            // Restore latest json

            long updated = pref.getLong("latest_json_updated", 0);

            if (updated > (now.getTime() - 24 * 60 * 60 * 1000)) {
                String jsonstr = pref.getString("latest_json", null);

                try {
                    json = new JSONObject(jsonstr);
                } catch (JSONException e) {
                    showErrorView(
                            context,
                            pref,
                            context.getResources().getString(R.string.update_failed),
                            context.getResources().getString(R.string.check_internet_connection)
                    );
                    /*RemoteViews errorview = showErrorView(context, pref,
                            context.getResources().getString(R.string.update_failed));
                    appWidgetManager.updateAppWidget(appWidgetId, errorview);*/
                    return;
                }
            } else {
                showErrorView(
                        context,
                        pref,
                        context.getResources().getString(R.string.update_failed),
                        context.getResources().getString(R.string.check_internet_connection)
                );
                /*RemoteViews errorview = showErrorView(context, pref, context.getResources().getString(R.string.update_failed));
                appWidgetManager.updateAppWidget(appWidgetId, errorview);*/
                return;
            }

        } else {
            // Store latest json

            SharedPreferences.Editor editor = pref.edit();
            editor.putString("latest_json", json.toString());
            editor.putLong("latest_json_updated", now.getTime());
            editor.apply();

        }

        main.setInt(R.id.weatherLayout, "setVisibility", VISIBLE);

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

        DisplayMetrics metrics = context.getResources().getDisplayMetrics();
        float dpiwidth = metrics.widthPixels / metrics.density;

        int cellwidth = 40;

        /*if (dpiwidth > 400 && !version.equals("classic") && !version.equals("experimental")) {
            cellwidth = 66;
        }*/

        /*String geoid = "";
        DateFormat format = new SimpleDateFormat("yyyyMMdd'T'HHmm");
        DateFormat obstimeformat = new SimpleDateFormat("yyyyMMddHHmm");
        DateFormat hourformat = new SimpleDateFormat("HH:mm");
        DateFormat shorthourformat = new SimpleDateFormat("HH");
        DateFormat shortdayformat = new SimpleDateFormat("EE");
        String iso2 = "";*/

        Log.d("DownloadData json", "Forecast json: " + json);
        Log.d("DownloadData json", "Crisis json: " + json2);


        try {
            // TODO: temporary for testing. Remove this later.
//            throw new JSONException("No json data");


            // Get the keys of the JSONObject
            Iterator<String> keys = json.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("DownloadData json", "First key: " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = json.getJSONArray(firstKey);

            // Get the first JSONObject from the JSONArray
            JSONObject first = data.getJSONObject(0);

            String name = first.getString("name");
            String region = first.getString("region");
            /*iso2 = first.getString("iso2");
            geoid = firstKey;*/

            // set location name and region

            main.setTextViewText(R.id.locationNameTextView, name+ ",");
            main.setTextViewText(R.id.locationRegionTextView, region);

           /* if (!version.equals("classic") && !version.equals("experimental"))
                main.removeAllViews(R.id.weatherRowLinearLayout);*/

//            int count = 0;

//            for (int i = 0; i < data.length(); i++) {

                /*if (count >= Math.floor((dpiwidth - 14) / cellwidth))
                    break;*/

//                JSONObject current = data.getJSONObject(i);
                /*String localtime = first.getString("localtime");
                String utcttime = first.getString("utctime");*/

                /*if (!isTimeDisplayable(utcttime, localtime, forecast_mode))
                    continue;*/

                // Update classic widget here!

                   /* try {
                        Date date = format.parse(localtime);
                        main.setTextViewText(R.id.shortTimeTextView, shorthourformat.format(date));
                        main.setTextViewText(R.id.timeTextView, hourformat.format(date));
                    } catch (Exception e) {
                        continue;
                    }*/

                String temperature = first.getString("temperature");
                // temperature string to float
                float tempFloat = Float.parseFloat(temperature);
                // if temperature is positive, add plus sign to temperature string
                if (tempFloat > 0) {
                    temperature = "+" + temperature;
                }
                main.setTextViewText(R.id.temperatureTextView, temperature);
                main.setTextViewText(R.id.temperatureUnitTextView, "°C");

                // ** set the weather icon

                String weathersymbol = first.getString("smartSymbol");

                /*main.setImageViewResource(R.id.weatherIconImageView,
                        context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));
*/
                Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                        context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));

                main.setImageViewBitmap(R.id.weatherIconImageView, icon);

                // Update time
                main.setTextViewText(R.id.updateTimeTextView, /*"Päivitetty " +*/ DateFormat.getTimeInstance().format(new java.util.Date()));

                // crisis view
                // example json: [{"type":"Crisis","content":"Varoitusnauha -testi EN","link":"https://www.fmi.fi"}]
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
                        Log.e("DownloadData json", "Crisis Json parsing error: " + e.getMessage());
                    }
                    if (!crisisFound) {
                        main.setViewVisibility(R.id.crisisTextView, GONE);
                    }
                } else {
                    main.setViewVisibility(R.id.crisisTextView, GONE);
                }

                // If very small then also hide location name and show time

                /*if (minWidth < 70 || minHeight < 70) {
                    main.setViewVisibility(R.id.locationTextView, View.GONE);
                } else {
                    main.setViewVisibility(R.id.locationTextView, View.VISIBLE);
                }*/

                /*if (minWidth < 70) {
                    main.setViewVisibility(R.id.timeTextView, View.GONE);
                    main.setViewVisibility(R.id.shortTimeTextView, View.VISIBLE);
                } else {
                    main.setViewVisibility(R.id.shortTimeTextView, View.GONE);
                    main.setViewVisibility(R.id.timeTextView, View.VISIBLE);
                }*/

                appWidgetManager.updateAppWidget(appWidgetId, main);
                return;
//            }

        } catch (final JSONException e) {
            Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection)
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, main);
    }

    private static void setColors(RemoteViews main, int backgroundColor, int textColor) {
        main.setInt(R.id.mainLinearLayout, "setBackgroundColor", backgroundColor);
        main.setInt(R.id.locationNameTextView, "setTextColor", textColor);
        main.setInt(R.id.locationRegionTextView, "setTextColor", textColor);
        main.setInt(R.id.temperatureTextView, "setTextColor", textColor);
        main.setInt(R.id.temperatureUnitTextView, "setTextColor", textColor);
        main.setInt(R.id.updateTimeTextView, "setTextColor", textColor);
//            main.setInt(R.id.observationTitleTextView, "setTextColor", textColor);
    }

    public void showErrorView(Context context, SharedPreferences pref, String errorText1, String errorText2) {
        String background = pref.getString("background", "dark");
//        String version = pref.getString("version", "normal");
        RemoteViews main = new RemoteViews(context.getPackageName(), R.layout.new_small_widget_layout);;

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        main.setInt(R.id.weatherLayout, "setVisibility", GONE);

        if (background.equals("dark"))
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.parseColor("#191B22"));
        else if (background.equals("light")) {
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.argb(100, 238, 238, 238));
        } else
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.TRANSPARENT);

//        if (version.equals("classic") || version.equals("experimental")) {
//            main.setTextViewText(R.id.timeTextView, "");
//        main.setTextViewText(R.id.temperatureTextView, "");
//            main.setViewVisibility(R.id.feelsLikeImageView, View.GONE);

        /*Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                context.getResources().getIdentifier("error", "drawable", context.getPackageName()));
        main.setImageViewBitmap(R.id.weatherIconImageView, icon);*/

        main.setTextViewText(R.id.locationNameTextView, errorText1);
        main.setTextViewText(R.id.locationRegionTextView, errorText2);

        /*} else {
            main.setTextViewText(R.id.locationTextView, "");
            main.setTextViewText(R.id.observationTitleTextView, "");
            main.removeAllViews(R.id.weatherRowLinearLayout);
            main.removeAllViews(R.id.observationsLinearLayout);
            RemoteViews error = new RemoteViews(context.getPackageName(), R.layout.error);
            error.setTextViewText(R.id.errorTextView, errorstr);
            main.addView(R.id.weatherRowLinearLayout, error);
        }*/

        appWidgetManager.updateAppWidget(appWidgetId, main);
//        return main;
    }
}