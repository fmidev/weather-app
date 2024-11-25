package fi.fmi.mobileweather;


import static android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;
import static fi.fmi.mobileweather.WidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.Manifest;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.location.Location;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


public abstract class BaseWidgetProvider extends AppWidgetProvider {

    private Context context;
    private int appWidgetId;
    private AppWidgetManager appWidgetManager;
    private Handler timeoutHandler;
    private Runnable timeoutRunnable;
    private static String weatherUrl;
    private static String announcementsUrl;

    protected abstract int getLayoutResourceId();

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("Widget Update","onReceive");
        super.onReceive(context, intent);
        String action = intent.getAction();
        if( action != null &&
                (action.equals(ACTION_APPWIDGET_AUTO_UPDATE) || action.equals(ACTION_APPWIDGET_UPDATE))) {
            updateAfterReceive(context);
        }
    }

    private void updateAfterReceive(Context context) {
        Log.d("Widget Update","updateAfterReceive triggered");

        // Initialize the widget setup
        WidgetSetupManager.initializeSetup(context);
        // Use the setup data
        WidgetSetup setup = WidgetSetupManager.getWidgetSetup();
        if (setup != null) {
            // Update the widget with the setup data
            weatherUrl = setup.getWeather().getApiUrl();
            // TODO: needs to be language specific
            announcementsUrl = setup.getAnnouncements().getApi().getFi();
        }

        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(),getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);

        onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d("Widget Update","onUpdate");


        // There may be multiple widgets active, so update all
        final int N = appWidgetIds.length;
        for (int i = 0; i < N; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i], null);
        }
    }

    @Override
    public void onEnabled(Context context) {
        Log.d("Widget Update","onEnabled");
        super.onEnabled(context);

        // Schedule an update for the widget (e.g. every 30 minutes)
        WidgetNotification.scheduleWidgetUpdate(context, this.getClass());
    }

    protected void updateAppWidgetWithoutDataDownload(Context context, AppWidgetManager appWidgetManager, int appWidgetId, RemoteViews main) {
        Log.d("Widget Update", "updateAppWidgetWithoutDataDownload");

        this.context = context;
        this.appWidgetManager = appWidgetManager;
        this.appWidgetId = appWidgetId;
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);

        onPostExecute(null, null, main, pref);
    }

    protected void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, RemoteViews main) {
        Log.d("Widget Update","updateAppWidget");

        this.context = context;
        this.appWidgetManager = appWidgetManager;
        this.appWidgetId = appWidgetId;
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);

        Log.d("Widget Location", "Trying to request location");
        if ((ContextCompat.checkSelfPermission(context,
                Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                || (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)) {

            Log.d("Widget Location", "Location requested");
            Boolean ok = SingleShotLocationProvider.requestSingleUpdate(context,
                    location -> {
                        Log.d("Widget Location", "New location: " + location.toString());
                        // Get the location coordinates string from location
                        String latlon = getLatLonString(location);
                        // Store latlon to shared preferences (cannot be null here)
                        pref.saveString("latlon", latlon);
                        Log.d("Widget Location", "Update with new location");
                        // Cancel timeout
                        if (timeoutHandler != null && timeoutRunnable != null) {
                            Log.d("Widget Location", "Timer canceled");
                            timeoutHandler.removeCallbacks(timeoutRunnable);
                        }
                        execute(latlon, main, pref);
                    });
            if (ok) {
                // Set timeout for location request
                timeoutHandler = new Handler(Looper.getMainLooper());
                // Timeout runnable
                timeoutRunnable = () -> {
                    // if we have old location, update widget with it
                    // Possible alternative: temporarily Utsjoki latlon as default "69.90,27.02"
                    String latlon = pref.getString("latlon", null);
                    if (latlon != null) {
                        Log.d("Widget Location", "Timeout reached, update with stored location");
                        execute(latlon, main, pref);
                    } else {
                        Log.d("Widget Location", "Timeout reached, no location available");
                    }
                };
                Log.d("Widget Location", "Timer started");
                // 1 minute timeout
                timeoutHandler.postDelayed(timeoutRunnable, 60 * 1000); // 1 minute timeout
            } else {
                Log.d("Widget Location", "Location not available from Location Manager");
                showErrorView(context, pref,
                        context.getResources().getString(R.string.positioning_failed),
                        ""
                );
            }
        } else {
            Log.d("Widget Location", "Location permission not granted");
            showErrorView(context, pref,
                    context.getResources().getString(R.string.positioning_failed),
                    ""
            );
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        WidgetNotification.clearWidgetUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        WidgetNotification.clearWidgetUpdate(context);
    }

    public void execute(String latlon, RemoteViews main, SharedPreferencesHelper pref) {

        // if we have no location, do not update the widget
        if (latlon == null || latlon.isEmpty()) {
            Log.d("Widget Update", "No location data available, widget not updated");
            return;
        }

        ExecutorService executorService = Executors.newFixedThreadPool(3);

        // Get language string
        String language = getLanguageString();

        // temporary for testing.
//        String announceUrl = "https://en-beta.ilmatieteenlaitos.fi/api/general/mobileannouncements";
        String announceUrl = announcementsUrl;

        // get geoid
        Future<String> future0 = executorService.submit(() -> fetchGeoid(latlon));
        // get forecast based on geoid
        Future<JSONObject> future1 = executorService.submit(() -> fetchForecast(future0.get(), latlon, language));
        // get announcements
        Future<JSONArray> future2 = executorService.submit(() -> fetchJsonArray(announceUrl));

        executorService.submit(() -> {
            try {
                JSONObject result1 = future1.get();
                JSONArray result2 = future2.get();
                onPostExecute(result1, result2, main, pref);
            } catch (Exception e) {
                Log.e("Download json", "Exception: " + e.getMessage());
                // NOTE: let's not show error view here, because connection problems with server
                //       seem to be quite frequent and we don't want to show error view every time
            }
        });
    }

    private String getLanguageString() {
        String language = Locale.getDefault().getLanguage();
        Log.d("language", language);
        if (!language.equals("fi") && !language.equals("sv") && !language.equals("en"))
            language = "en";
        return language;
    }

    private String getLatLonString(Location location) {
        double latitude = location.getLatitude();
        double longitude = location.getLongitude();
        // Round to 4 decimals
        latitude = (double)Math.round(latitude * 10000d) / 10000d;
        longitude = (double)Math.round(longitude * 10000d) / 10000d;
        String latlon = latitude + "," + longitude;
        return latlon;
    }

    private String fetchGeoid(String latlon) {
        try {
            String url = weatherUrl +
                    "?param=geoid,name,region,latitude,longitude,region,country,iso2,localtz&latlon=" +
                    latlon +
                    "&format=json";

            String jsonString = fetchJsonString(url);
            // Response example: [{"geoid":658994,"name":"Hänniskylä","region":"Konnevesi","latitude":62.50000,"longitude":26.20000,"region":"Konnevesi","country":"Suomi","iso2":"FI","localtz":"Europe/Helsinki"}]

            JSONArray jsonArray = new JSONArray(jsonString);

            // get geoid from the first element in array
            if (jsonArray.length() > 0) {
                JSONObject jsonObject = jsonArray.getJSONObject(0);
                if (jsonObject.has("geoid")) {
                    String geoid = jsonObject.getString("geoid");
                    Log.d("Download json", "Geoid: " + geoid);
                    return geoid;
                }
            }
            return null; // Return null if no "geoid" is found

        } catch (JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    protected JSONObject fetchForecast(String geoid, String latlon, String language) {
        String url;
        // if we have geoid use it to get forecast data
        if (geoid != null && !geoid.isEmpty()) {
            url = weatherUrl + "?geoid=" +
                    geoid +
                    "&endtime=data&format=json&attributes=geoid&lang=" +
                    language +
                    "&tz=utc&who=mobileweather-widget-android&producer=default&param=geoid,epochtime,localtime,utctime,name,region,iso2,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,smartSymbol,windDirection,windSpeedMS,windCompass8";
        } else { // otherwise use lat&lon to get forecast data
            url = weatherUrl + "?latlon=" +
                    latlon +
                    "&endtime=data&format=json&attributes=geoid&lang=" +
                    language +
                    "&tz=utc&who=mobileweather-widget-android&producer=default&param=geoid,epochtime,localtime,utctime,name,region,iso2,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,smartSymbol,windDirection,windSpeedMS,windCompass8";
        }

        try {
            String jsonString = fetchJsonString(url);
            return new JSONObject(jsonString);
        } catch (JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    private JSONArray fetchJsonArray(String src) {
        try {
            String jsonString = fetchJsonString(src);
            return new JSONArray(jsonString);
        } catch (JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    private String fetchJsonString(String src) {
        if (src == null || src.isEmpty())
            return null;

        try {
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

                Log.d("Download json", "fetchData Forecast json: " + jsonstr);

                return jsonstr;

            } catch (IOException e) {
                Log.e("Exception", Objects.requireNonNull(e.getMessage()));
            }

            // if something went wrong, return null
            return null;

        } catch (IOException e) {
            Log.e("Exception", Objects.requireNonNull(e.getMessage()));
            return null;
        }
    }

    protected void onPostExecute(JSONObject json, JSONArray json2, RemoteViews main, SharedPreferencesHelper pref) {

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Get settings
        String background = pref.getString("background", "transparent");
        Log.d("Download json", "Background: " + background);

        // Get the layout for the App Widget now if needed
        if (main == null) {
            // Get the stored layout for the App Widget
            int currentLayoutId = loadLayoutResourceId(context, appWidgetId);
            // If the layout is not stored, use the default layout
            if (currentLayoutId != 0) {
                main = new RemoteViews(context.getPackageName(), currentLayoutId);
            } else
                main = new RemoteViews(context.getPackageName(), getLayoutResourceId());
        }

        // Show normal view
        main.setInt(R.id.normalLayout, "setVisibility", VISIBLE);
        // Hide error view
        main.setInt(R.id.errorLayout, "setVisibility", GONE);

        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        json = useNewOrStoredJsonObject(json, pref);
        if (json == null) return;

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

            // Get the first JSONObject from the JSONArray
            JSONObject first = data.getJSONObject(0);

            String name = first.getString("name");
            String region = first.getString("region");

            // set location name and region
            main.setTextViewText(R.id.locationNameTextView, name+ ",");
            main.setTextViewText(R.id.locationRegionTextView, region);

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

            Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                    context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));

            main.setImageViewBitmap(R.id.weatherIconImageView, icon);

            // Update time TODO: should be hidden for release
            main.setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));

            json2 = useNewOrStoredCrisisJsonObject(json2, pref);

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

    @Nullable
    private JSONObject useNewOrStoredJsonObject(JSONObject json, SharedPreferencesHelper pref) {
        Date now = new Date();

        if (json == null) {
            // Restore latest json

            long updated = pref.getLong("latest_json_updated", 0L);

            if (updated > (now.getTime() - 24 * 60 * 60 * 1000)) {
                String jsonstr = pref.getString("latest_json", null);

                try {
                    json = new JSONObject(jsonstr);
                } catch (JSONException e) {
                    showErrorView(
                            context,
                            pref,
                            "(old restore error) " + context.getResources().getString(R.string.update_failed),
                            context.getResources().getString(R.string.check_internet_connection)
                    );
                    return null;
                }
            } else {
                showErrorView(
                        context,
                        pref,
                        " (too old error) " + context.getResources().getString(R.string.update_failed),
                        context.getResources().getString(R.string.check_internet_connection)
                );
                return null;
            }

        } else {
            // Store latest json
            pref.saveString("latest_json", json.toString());
            pref.saveLong("latest_json_updated", now.getTime());
        }
        return json;
    }

    @Nullable
    private JSONArray useNewOrStoredCrisisJsonObject(JSONArray json, SharedPreferencesHelper pref) {
        Date now = new Date();

        if (json == null) {
            // Restore latest crisis json

            long updated = pref.getLong("latest_crisis_json_updated", 0L);

            if (updated > (now.getTime() - 24 * 60 * 60 * 1000)) {
                String jsonstr = pref.getString("latest_crisis_json", null);

                try {
                    json = new JSONArray(jsonstr);
                } catch (JSONException e) {
                    Log.d("Download json", "Crisis Json parsing error: " + e.getMessage());
                }
            } else {
                Log.d("Download json", "Crisis Json too old");
            }

        } else {
            // Store latest crisis json
            pref.saveString("latest_crisis_json", json.toString());
            pref.saveLong("latest_crisis_json_updated", now.getTime());
        }
        return json;
    }

    protected void setColors(RemoteViews main, int backgroundColor, int textColor) {
        main.setInt(R.id.mainLinearLayout, "setBackgroundColor", backgroundColor);
        main.setInt(R.id.locationNameTextView, "setTextColor", textColor);
        main.setInt(R.id.locationRegionTextView, "setTextColor", textColor);
        main.setInt(R.id.temperatureTextView, "setTextColor", textColor);
        main.setInt(R.id.temperatureUnitTextView, "setTextColor", textColor);
        main.setInt(R.id.updateTimeTextView, "setTextColor", textColor);
    }

    protected void showErrorView(Context context, SharedPreferencesHelper pref, String errorText1, String errorText2) {
        String background = pref.getString("background", "dark");

        RemoteViews main = new RemoteViews(context.getPackageName(), getLayoutResourceId());

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        // Show error view
        main.setInt(R.id.errorLayout, "setVisibility", VISIBLE);
        // Hide normal view
        main.setInt(R.id.normalLayout, "setVisibility", GONE);

        if (background.equals("dark"))
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.parseColor("#191B22"));
        else if (background.equals("light")) {
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.rgb(255, 255, 255));
        } else
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.TRANSPARENT);

        main.setTextViewText(R.id.errorHeaderTextView, errorText1);
        main.setTextViewText(R.id.errorBodyTextView, errorText2);

        appWidgetManager.updateAppWidget(appWidgetId, main);
    }

    protected void saveLayoutResourceId(Context context, int appWidgetId, int layoutId) {
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        pref.saveInt("layout_res_id", layoutId);
    }

    protected int loadLayoutResourceId(Context context, int appWidgetId) {
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        return pref.getInt("layout_res_id", 0);
    }
}