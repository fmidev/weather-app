package fi.fmi.mobileweather;


import static android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;
import static fi.fmi.mobileweather.PrefKey.*;
import static fi.fmi.mobileweather.Theme.*;
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

import androidx.annotation.NonNull;
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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


public abstract class BaseWidgetProvider extends AppWidgetProvider {

    // forecast data valid for 24 hours
    private static final long FORECAST_DATA_VALIDITY = 24 * 60 * 60 * 1000;
    // crisis data valid for 12 hours
    private static final long CRISIS_DATA_VALIDITY = 12 * 60 * 60 * 1000;

    Context context;
    int appWidgetId;
    AppWidgetManager appWidgetManager;

    private Handler timeoutHandler;
    private Runnable timeoutRunnable;
    private static String weatherUrl;
    private static String announcementsUrl;

    protected static String immediateThemeSetting;

    protected abstract int getLayoutResourceId();

    // ********** WidgetProvider main methods: **********

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

        // Get the list of appWidgetIds that have been bound to the given AppWidget provider.
        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(), getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);

        Log.d("Widget Update","thisAppWidgetComponentName: " + thisAppWidgetComponentName);

        onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d("Widget Update","onUpdate");

        // if no widgets, log and return
        if (appWidgetIds.length == 0) {
            Log.w("Widget Update","No widgets to update");
            return;
        }

        // There may be multiple widgets active, so update all
        for (int widgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId, null);
        }
    }

    @Override
    public void onEnabled(Context context) {
        Log.d("Widget Update","onEnabled");
        super.onEnabled(context);

        // Schedule an update for the widget (e.g. every 15 minutes)
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

    protected void onPostExecute(JSONObject forecastJson, JSONArray announcementsJson, RemoteViews main, SharedPreferencesHelper pref) {

        // init widget, returns (new) forecast forecastJson, widget layout views and theme
        WidgetInitResult widgetInitResult = initWidget(forecastJson, main, pref);

        // populate widget with data
        setWidgetData(announcementsJson, pref, widgetInitResult);
    }

    protected void setWidgetData(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult) {
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject forecastJson = widgetInitResult.forecastJson();
        String theme = widgetInitResult.theme();

        try {
            // Get the keys of the JSONObject
            Iterator<String> keys = forecastJson.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download json", "First key (geoid): " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = forecastJson.getJSONArray(firstKey);

            // Get the first JSONObject with future epochtime from the JSONArray
            // find first epoch time which is in future
            int firstFutureTimeIndex = getFirstFutureTimeIndex(data);
            JSONObject first = data.getJSONObject(firstFutureTimeIndex);

            String name = first.getString("name");
            String region = first.getString("region");

            // set location name and region
            widgetRemoteViews.setTextViewText(R.id.locationNameTextView, name+ ",");
            widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, region);

            String temperature = first.getString("temperature");
            temperature = addPlusIfNeeded(temperature);
            widgetRemoteViews.setTextViewText(R.id.temperatureTextView, temperature);
            widgetRemoteViews.setTextViewText(R.id.temperatureUnitTextView, "°C");

            // ** set the weather icon

            String weathersymbol = first.getString("smartSymbol");

            Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                    context.getResources().getIdentifier("s" + weathersymbol + (theme.equals(LIGHT) ? "_light" : "_dark"), "drawable", context.getPackageName()));

            widgetRemoteViews.setImageViewBitmap(R.id.weatherIconImageView, icon);

            // Update time TODO: should be hidden for release
            widgetRemoteViews.setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));

            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref);

            appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
            return;

        } catch (final JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection)
            );
        }

        appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
    }


    // ********** Helper methods: **********


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

    @NonNull
    protected WidgetInitResult initWidget(JSONObject forecastJson, RemoteViews widgetRemoteViews, SharedPreferencesHelper pref) {
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Get theme setting
        String theme;
        if (immediateThemeSetting == null) {
            theme = pref.getString(THEME, LIGHT);
        } else {
            theme = immediateThemeSetting;
            immediateThemeSetting = null;
        }

        Log.d("Download json", "Theme: " + theme);

        // get remote views of widget
        widgetRemoteViews = getRemoteViews(widgetRemoteViews);

        // Show normal view
        widgetRemoteViews.setInt(R.id.normalLayout, "setVisibility", VISIBLE);
        // Hide error view
        widgetRemoteViews.setInt(R.id.errorLayout, "setVisibility", GONE);

        widgetRemoteViews.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        forecastJson = useNewOrStoredJsonObject(forecastJson, pref);
        if (forecastJson == null) {
            Log.d("Download json", "No forecastJson data available");
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection)
            );
        }

        setWidgetColors(widgetRemoteViews, theme);

        Log.d("Download json", "Forecast json: " + forecastJson);
        
        WidgetInitResult widgetInitResult = new WidgetInitResult(forecastJson, widgetRemoteViews, theme);
        return widgetInitResult;
    }

    protected record WidgetInitResult(JSONObject forecastJson, RemoteViews widgetRemoteViews, String theme) {
    }

    @NonNull
    private RemoteViews getRemoteViews(RemoteViews widgetRemoteViews) {
        // Get the layout for the App Widget now if needed
        if (widgetRemoteViews == null) {
            // Get the stored layout for the App Widget
            int currentLayoutId = loadLayoutResourceId(context, appWidgetId);
            // If the layout is not stored, use the default layout
            if (currentLayoutId != 0) {
                widgetRemoteViews = new RemoteViews(context.getPackageName(), currentLayoutId);
            } else
                widgetRemoteViews = new RemoteViews(context.getPackageName(), getLayoutResourceId());
        }
        return widgetRemoteViews;
    }

    protected void showCrisisViewIfNeeded(JSONArray announcementsJson, RemoteViews widgetRemoteViews, SharedPreferencesHelper pref) {
        announcementsJson = useNewOrStoredCrisisJsonObject(announcementsJson, pref);
        
        // example forecastJson: [{"type":"Crisis","content":"Varoitusnauha -testi EN","link":"https://www.fmi.fi"}]
        if (announcementsJson != null) {
            boolean crisisFound = false;
            try {
                for (int i = 0; i < announcementsJson.length(); i++) {
                    JSONObject jsonObject = announcementsJson.getJSONObject(i);
                    String type = jsonObject.getString("type");
                    if (type.equals("Crisis")) {
                        String content = jsonObject.getString("content");
                        widgetRemoteViews.setViewVisibility(R.id.crisisTextView, VISIBLE);
                        widgetRemoteViews.setTextViewText(R.id.crisisTextView, content);
                        crisisFound = true;
                        // if a crisis found, exit the loop
                        break;
                    }
                }
            } catch (JSONException e) {
                Log.e("Download json", "Crisis Json parsing error: " + e.getMessage());
            }
            if (!crisisFound) {
                widgetRemoteViews.setViewVisibility(R.id.crisisTextView, GONE);
            }
        } else {
            widgetRemoteViews.setViewVisibility(R.id.crisisTextView, GONE);
        }
    }

    private void setWidgetColors(RemoteViews main, String theme) {
        if (theme.equals(DARK)) {
            setColors(main,
                    0,
                    Color.BLACK,
                    Color.WHITE);
        }
        else if (theme.equals(GRADIENT)) {
            setColors(main,
                    R.drawable.gradient_2,
                    0,
                    Color.WHITE);
        }
        else { // light theme
            setColors(main,
                    0,
                    Color.WHITE,
                    Color.BLACK);
        }
    }

    protected void setLargeWidgetSpecificColors(RemoteViews main, String theme) {
        if (theme.equals(DARK)) {
            setWeatherRowColors(main,
                    Color.rgb(255, 255, 255));
        }
        else if (theme.equals(LIGHT)) {
            setWeatherRowColors(main,
                    Color.rgb(48, 49, 147));
        } else {
            setWeatherRowColors(main,
                    Color.rgb(48, 49, 147));
        }
    }

    protected void setColors(RemoteViews remoteViews, int backgroundResource, int backgroundColor, int textColor) {
        // Set theme
        if (backgroundResource != 0)
            // Set theme resource, i.e. drawable resource ID
            remoteViews.setInt(R.id.mainLinearLayout, "setBackgroundResource", backgroundResource);
        else
            // Set theme color
            remoteViews.setInt(R.id.mainLinearLayout, "setBackgroundColor", backgroundColor);

        remoteViews.setInt(R.id.locationNameTextView, "setTextColor", textColor);
        remoteViews.setInt(R.id.locationRegionTextView, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureUnitTextView, "setTextColor", textColor);
        remoteViews.setInt(R.id.updateTimeTextView, "setTextColor", textColor);
    }

    protected void setWeatherRowColors(RemoteViews remoteViews, int textColor) {
        remoteViews.setInt(R.id.timeTextView0, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView0, "setTextColor", textColor);
        remoteViews.setInt(R.id.timeTextView1, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView1, "setTextColor", textColor);
        remoteViews.setInt(R.id.timeTextView2, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView2, "setTextColor", textColor);
        remoteViews.setInt(R.id.timeTextView3, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView3, "setTextColor", textColor);
        remoteViews.setInt(R.id.timeTextView4, "setTextColor", textColor);
        remoteViews.setInt(R.id.temperatureTextView4, "setTextColor", textColor);
    }

    protected String addPlusIfNeeded(String temperature) {
        // temperature string to float
        float tempFloat = Float.parseFloat(temperature);
        // if temperature is positive, add plus sign to temperature string
        if (tempFloat > 0) {
            temperature = "+" + temperature;
        }
        return temperature;
    }

    @Nullable
    JSONObject useNewOrStoredJsonObject(JSONObject json, SharedPreferencesHelper pref) {
        Date now = new Date();

        if (json == null) {
            // Restore latest forecastJson

            long updated = pref.getLong(LATEST_JSON_UPDATED, 0L);

            if (updated > (now.getTime() - FORECAST_DATA_VALIDITY)) {
                String jsonstr = pref.getString(LATEST_JSON, null);

                try {
                    json = new JSONObject(jsonstr);
                } catch (JSONException e) {
                    showErrorView(
                            context,
                            pref,
                            context.getResources().getString(R.string.update_failed),
                            context.getResources().getString(R.string.check_internet_connection)
                    );
                    return null;
                }
            } else {
                showErrorView(
                        context,
                        pref,
                        context.getResources().getString(R.string.update_failed),
                        context.getResources().getString(R.string.check_internet_connection)
                );
                return null;
            }

        } else {
            // Store latest forecastJson
            pref.saveString("latest_json", json.toString());
            pref.saveLong(LATEST_JSON_UPDATED, now.getTime());
        }
        return json;
    }

    @Nullable
    JSONArray useNewOrStoredCrisisJsonObject(JSONArray json, SharedPreferencesHelper pref) {
        Date now = new Date();

        if (json == null) {
            // Restore latest crisis json

            long updated = pref.getLong("latest_crisis_json_updated", 0L);

            if (updated > (now.getTime() - CRISIS_DATA_VALIDITY)) {
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

    protected void showErrorView(Context context, SharedPreferencesHelper pref, String errorText1, String errorText2) {
        String theme = pref.getString(THEME, DARK);

        RemoteViews widgetRemoteViews = new RemoteViews(context.getPackageName(), getLayoutResourceId());

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        widgetRemoteViews.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        // Show error view
        widgetRemoteViews.setInt(R.id.errorLayout, "setVisibility", VISIBLE);
        // Hide normal view
        widgetRemoteViews.setInt(R.id.normalLayout, "setVisibility", GONE);

        if (theme.equals(DARK))
            widgetRemoteViews.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.BLACK);
        else if (theme.equals(LIGHT))
            widgetRemoteViews.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.WHITE);
        else
            widgetRemoteViews.setInt(R.id.mainLinearLayout, "setBackgroundResource", R.drawable.gradient_background);

        widgetRemoteViews.setTextViewText(R.id.errorHeaderTextView, errorText1);
        widgetRemoteViews.setTextViewText(R.id.errorBodyTextView, errorText2);

        appWidgetManager.updateAppWidget(appWidgetId, widgetRemoteViews);
    }

    protected void saveLayoutResourceId(Context context, int appWidgetId, int layoutId) {
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        pref.saveInt(LAYOUT_RES_ID, layoutId);
    }

    protected int loadLayoutResourceId(Context context, int appWidgetId) {
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        return pref.getInt(LAYOUT_RES_ID, 0);
    }

    @NonNull
    protected String getFormattedWeatherTime(String localTime) throws ParseException {
        // Define the input formatter
        SimpleDateFormat inputFormatter = new SimpleDateFormat("yyyyMMdd'T'HHmmss", Locale.getDefault());
        // Parse the time string to Date
        Date date = inputFormatter.parse(localTime);
        // Define the output formatter
        SimpleDateFormat outputFormatter = new SimpleDateFormat("HH:mm", Locale.getDefault());
        // Format the Date to the desired format and return the result
        return outputFormatter.format(date);
    }

    protected int getFirstFutureTimeIndex(JSONArray data) throws JSONException {

        // Find the first epoch time long in the future

        // Get the current time in milliseconds
        long currentTime = System.currentTimeMillis();

        for (int i = 0; i < data.length(); i++) {
            JSONObject forecast = data.getJSONObject(i);
            // Get the epoch time and convert to milliseconds
            long epochTime = forecast.getLong("epochtime") * 1000 ;
            if (epochTime > currentTime) {
                // return the index of the first future time
                return i;
            }
        }
        // if no future time found
        return -1;
    }
}