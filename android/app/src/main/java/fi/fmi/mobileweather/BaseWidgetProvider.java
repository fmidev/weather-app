package fi.fmi.mobileweather;


import static android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE;
import static android.content.res.Configuration.UI_MODE_NIGHT_MASK;
import static android.content.res.Configuration.UI_MODE_NIGHT_YES;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;
import static fi.fmi.mobileweather.model.LocationConstants.CURRENT_LOCATION;
import static fi.fmi.mobileweather.model.PrefKey.*;
import static fi.fmi.mobileweather.WidgetNotification.ACTION_APPWIDGET_AUTO_UPDATE;

import android.Manifest;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
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
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import fi.fmi.mobileweather.enumeration.WidgetType;
import fi.fmi.mobileweather.model.WidgetData;
import fi.fmi.mobileweather.util.AirplaneModeUtil;
import fi.fmi.mobileweather.util.SharedPreferencesHelper;
import fi.fmi.mobileweather.util.SingleShotLocationProvider;

public abstract class BaseWidgetProvider extends AppWidgetProvider {
    // forecast data valid for 24 hours
    private static final long FORECAST_DATA_VALIDITY = 24 * 60 * 60 * 1000;
    // crisis data valid for 12 hours
    private static final long CRISIS_DATA_VALIDITY = 12 * 60 * 60 * 1000;
    private static final long WARNING_DATA_VALIDITY = 12 * 60 * 60 * 1000;

    Context context;
    AppWidgetManager appWidgetManager;

    private Handler timeoutHandler;
    private Runnable timeoutRunnable;
    protected static String weatherUrl;
    protected static String announcementsUrl;
    protected static String warningsUrl;

    protected abstract WidgetType getWidgetType();
    protected abstract int getLayoutResourceId();

    // ********** WidgetProvider main methods: **********

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("BaseWidgetProvider", "onReceive");
        super.onReceive(context, intent);
        String action = intent.getAction();
        if( action != null &&
            (action.equals(ACTION_APPWIDGET_AUTO_UPDATE) || action.equals(ACTION_APPWIDGET_UPDATE))) {
            updateAfterReceive(context);
        }
    }

    private void updateAfterReceive(Context context) {
        Log.d("Widget Update", "updateAfterReceive triggered");

        // Use the setup data
        WidgetSetup setup = WidgetSetupManager.getWidgetSetup(context);
        if (setup != null) {
            weatherUrl = setup.weather().apiUrl();
            warningsUrl = setup.warnings().apiUrl();

            if (getLanguageString() == "fi") {
                announcementsUrl = setup.announcements().api().fi();
            } else if (getLanguageString() == "sv") {
                announcementsUrl = setup.announcements().api().sv();
            } else {
                announcementsUrl = setup.announcements().api().en();
            }

            Log.d("updateAfterReceive", "announcementsUrl: "+announcementsUrl);
        }

        // Get the list of appWidgetIds that have been bound to the given AppWidget provider.
        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(), getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);

        Log.d("Widget Update","Widget Component Name: " + thisAppWidgetComponentName);
        Log.d("Widget Update","Widget Ids: " + Arrays.toString(appWidgetIds));

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
            updateAppWidget(context, appWidgetManager, widgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        Log.d("Widget Update","onEnabled");
        super.onEnabled(context);
        
        // Schedule an update for the widget (e.g. every 15 minutes)
        WidgetNotification.scheduleWidgetUpdate(context, this.getClass(), getWidgetType());
    }


    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);

        Log.d("Widget Update", "Options changed");

        // Update the widget layout without downloading new data
        RemoteViews views = new RemoteViews(context.getPackageName(), getLayoutResourceId());
        updateAppWidgetWithoutDataDownload(context, appWidgetManager, appWidgetId, views);
    }

    protected void updateAppWidgetWithoutDataDownload(Context context, AppWidgetManager appWidgetManager, int appWidgetId, RemoteViews remoteViews) {
        Log.d("Widget Update", "updateAppWidgetWithoutDataDownload");

        this.context = context;
        this.appWidgetManager = appWidgetManager;
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);

        onDataFetchingPostExecute(null, remoteViews, pref, appWidgetId);
    }

    protected void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d("Widget Update","updateAppWidget");

        this.context = context;
        this.appWidgetManager = appWidgetManager;
        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        Log.d("Widget Update","pref for this appWidgetId: " + appWidgetId);

        // Get selected location for the widget (current location as default)
        int selectedLocation = pref.getInt(SELECTED_LOCATION, CURRENT_LOCATION);
        if (selectedLocation == CURRENT_LOCATION) {
            // get current location
            requestLocation(context, pref, appWidgetId);
        } else {
            // use selected location
            executeDataFetchingWithSelectedLocation(selectedLocation, pref, appWidgetId);
        }
    }

    protected void executeDataFetchingWithSelectedLocation(int geoId, SharedPreferencesHelper pref, int widgetId) {
        executeDataFetchingWithGeoId(geoId, null, pref, widgetId);
    }

    protected boolean checkLocationPermissions() {
        return (ContextCompat.checkSelfPermission(context,
                Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                || (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED);
    }

    private void requestLocation(Context context, SharedPreferencesHelper pref, int widgetId) {
        Log.d("Widget Location", "Trying to request current location");
        if (checkLocationPermissions()) {

            Log.d("Widget Location", "Current location requested");
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

                        executeDataFetchingWithLatLon(latlon, pref, widgetId);
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
                        executeDataFetchingWithLatLon(latlon, pref, widgetId);
                    } else {
                        Log.d("Widget Location", "Timeout reached, no location available");
                        showLocationErrorView(context, pref, widgetId);
                    }
                };
                Log.d("Widget Location", "Timer started");
                timeoutHandler.postDelayed(timeoutRunnable, 10 * 1000); // 10 second timeout
            } else {
                Log.d("Widget Location", "Location not available from Location Manager");
                showLocationErrorView(context, pref, widgetId);
            }
        } else {
            Log.d("Widget Location", "Location permission not granted");
            showLocationErrorView(context, pref, widgetId);
        }
    }

    private void showLocationErrorView(Context context, SharedPreferencesHelper pref, int widgetId) {
        Log.d("ShowLocationErrorView", "Could not get current location");
        showErrorView(context, pref,
                context.getResources().getString(R.string.location_failed),
                checkLocationPermissions() ?
                    context.getResources().getString(R.string.retrying_location_services) :
                        context.getResources().getString(R.string.location_services_not_allowed),
                widgetId
        );
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        WidgetNotification.clearWidgetUpdate(context, getWidgetType());
    }

    public void executeDataFetchingWithGeoId(int geoId, RemoteViews remoteViews, SharedPreferencesHelper pref, int widgetId) {
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        // Get language string
        String language = getLanguageString();
        String announceUrl = announcementsUrl;

        // get forecast based on geoId
        Future<JSONObject> forecastFuture = executorService.submit(() -> fetchForecast(Integer.toString(geoId), null, language));
        // get announcements
        Future<JSONArray> announcementsFuture = executorService.submit(() -> fetchJsonArray(announceUrl));

        executorService.submit(() -> {
            JSONArray announcementsResult = null;
            // Announcements failure is not critical
            try { announcementsResult = announcementsFuture.get(); } catch(Exception e) {}
            try {
                JSONObject forecastResult = forecastFuture.get();
                var widgetData = new WidgetData(announcementsResult, forecastResult);
                onDataFetchingPostExecute(widgetData, remoteViews, pref, widgetId);
            } catch (Exception e) {
                Log.e("executeWithGeoId", "Exception: " + e.getMessage());
                showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    widgetId
                );
            }
        });
    }

    protected void executeDataFetchingWithLatLon(String latlon, SharedPreferencesHelper pref, int widgetId) {

        // if we have no location, do not update the widget
        if (latlon == null || latlon.isEmpty()) {
            Log.d("Widget Update", "No location data available, widget not updated");
            return;
        }

        ExecutorService executorService = Executors.newFixedThreadPool(3);

        String language = getLanguageString();
        String announceUrl = announcementsUrl;

        // get geoid
        Future<String> geoFuture = executorService.submit(() -> fetchGeoid(latlon));
        // get forecast based on geoid
        Future<JSONObject> forecastFuture = executorService.submit(() -> fetchForecast(geoFuture.get(), latlon, language));
        // get announcements
        Future<JSONArray> announcementsFuture = executorService.submit(() -> fetchJsonArray(announceUrl));

        executorService.submit(() -> {
            JSONArray announcementsResult = null;
            // Announcements failure is not critical
            try { announcementsResult = announcementsFuture.get(); } catch(Exception e) {}
            try {
                JSONObject forecastResult = forecastFuture.get();
                var widgetData = new WidgetData(announcementsResult, forecastResult);
                onDataFetchingPostExecute(widgetData,null, pref, widgetId);
            } catch (Exception e) {
                Log.e("executeWithLatLon", "Exception: " + e.getMessage());
                showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    widgetId
                );
            }
        });
    }

    protected String fetchGeoid(String latlon) {
        try {
            String url = weatherUrl +
                    "?param=geoid,name,region,latitude,longitude,region,country,iso2,localtz&latlon=" +
                    latlon +
                    "&format=json";

            String jsonString = fetchJsonString(url);
            // Response example: [{"geoid":658994,"name":"Hänniskylä","region":"Konnevesi","latitude":62.50000,"longitude":26.20000,"region":"Konnevesi","country":"Suomi","iso2":"FI","localtz":"Europe/Helsinki"}]

            if (jsonString == null) {
                return null;
            }

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
            Log.e("Download json", "In fetchGeoid exception: " + e.getMessage());
            return null;
        }
    }

    protected JSONObject fetchForecast(String geoid, String latlon, String language) {
        String url;

        Log.d("Fetch forecast", "geoid: "+geoid+" latlon: "+latlon);

        var params = "geoid,epochtime,localtime,utctime,name,region,iso2,temperature,feelsLike,smartSymbol,windDirection,windSpeedMS,windCompass8";

        if (geoid != null && !geoid.isEmpty()) {
            url = weatherUrl + "?geoid=" + geoid + "&endtime=data&format=json&attributes=geoid&lang=" +
                    language + "&who=mobileweather-widget-android&producer=default&param="+params;
        } else if (latlon != null && !latlon.isEmpty()) {
            url = weatherUrl + "?latlon=" + latlon + "&endtime=data&format=json&attributes=geoid&lang=" +
                    language + "&who=mobileweather-widget-android&producer=default&param="+params;
        } else {
            return null;
        }

        try {
            String jsonString = fetchJsonString(url);
            return new JSONObject(jsonString);
        } catch (JSONException e) {
            Log.e("Download json", "In base widget fetchMainData exception: " + e.getMessage());
            return null;
        }
    }

    protected void onDataFetchingPostExecute(WidgetData data, RemoteViews remoteViews, SharedPreferencesHelper pref, int widgetId) {
        // Init widget, mainly layout initialization
        WidgetInitResult widgetInitResult = initWidget(remoteViews, pref, widgetId);

        var forecast = useNewOrStoredJsonObject(data != null ? data.forecast() : null, pref, widgetId);
        if (forecast == null) {
            Log.d("onDataFetchingPostExecute", "No forecast data available");
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    widgetId
            );
            return;
        }

        var announcements = useNewOrStoredCrisisJsonObject(data != null ? data.announcements() : null, pref);

        setWidgetUi(new WidgetData(announcements, forecast), pref, widgetInitResult, widgetId);

    }

    protected void setWidgetUi(WidgetData widgetData, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId) {
        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject forecastJson = widgetData.forecast();

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
            widgetRemoteViews.setTextViewText(R.id.temperatureUnitTextView, getWidgetWidthInPixels(widgetId) < 140 ? "°" :  "°C");

            // ** set the weather icon

            int weatherSymbol = first.getInt("smartSymbol");
            int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol, "drawable", context.getPackageName());
            widgetRemoteViews.setImageViewResource(R.id.weatherIconImageView, drawableResId);
            widgetRemoteViews.setContentDescription(R.id.weatherIconImageView, getSymbolTranslation(weatherSymbol));

            // Crisis view
            showCrisisViewIfNeeded(widgetData.announcements(), widgetRemoteViews, pref, false, false);

            appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
            pref.saveLong(WIDGET_UI_UPDATED, System.currentTimeMillis());
            return;

        } catch (final Exception e) {
            Log.e("Download json", "In base widget setWidgetUi exception: " + e.getMessage());
            showErrorView(
                context,
                pref,
                context.getResources().getString(R.string.update_failed),
                getConnectionErrorDescription(),
                widgetId
            );
        }

        appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
    }


    // ********** Helper methods: **********


    protected JSONArray fetchJsonArray(String src) {
        try {
            String jsonString = fetchJsonString(src);
            return new JSONArray(jsonString);
        } catch (JSONException e) {
            Log.e("Download json", "In base widget fetchJsonArray xception: " + e.getMessage());
            return null;
        }
    }

    protected String fetchJsonString(String src) {
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
                BufferedReader streamReader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
                StringBuilder responseStrBuilder = new StringBuilder();

                String inputStr;
                while ((inputStr = streamReader.readLine()) != null)
                    responseStrBuilder.append(inputStr);

                String jsonstr = responseStrBuilder.toString();

                Log.d("Download json", "fetchData json: " + jsonstr);

                return jsonstr;

            } catch (IOException e) {
                Log.e("Download json", "fetchJsonString exception: " + Objects.requireNonNull(e.getMessage()));
            }

            // if something went wrong, return null
            return null;

        } catch (IOException e) {
            Log.e("Download json", "fetchJsonString exception: " + Objects.requireNonNull(e.getMessage()));
            return null;
        }
    }

    protected String getLanguageString() {
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
    protected WidgetInitResult initWidget(RemoteViews widgetRemoteViews, SharedPreferencesHelper pref, int widgetId) {
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        int currentNightMode = context.getResources().getConfiguration().uiMode & UI_MODE_NIGHT_MASK;
        boolean gradientBackround = currentNightMode == UI_MODE_NIGHT_YES && pref.getInt(GRADIENT_BACKGROUND, 0) == 1;

        // get remote views of widget
        widgetRemoteViews = getRemoteViews(widgetRemoteViews, widgetId);

        Log.d("initWidget", "gradient: "+gradientBackround+" currentNightMode: "+currentNightMode);

        // gradient background is supported in dark mode only
        if (gradientBackround) {
            Log.d("initWidget", "Set background gradient");
            widgetRemoteViews.setInt(
                R.id.mainLinearLayout, "setBackgroundResource", R.drawable.gradient_background
            );
        } else {
            widgetRemoteViews.setInt(R.id.mainLinearLayout, "setBackgroundResource", R.color.widgetBackground);
        }

        // Show normal view
        widgetRemoteViews.setInt(R.id.normalLayout, "setVisibility", VISIBLE);
        // Hide error view
        widgetRemoteViews.setInt(R.id.errorLayout, "setVisibility", GONE);
        widgetRemoteViews.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        return new WidgetInitResult(widgetRemoteViews, gradientBackround);
    }

    protected record WidgetInitResult(RemoteViews widgetRemoteViews, boolean gradientBackground) {
    }

    @NonNull
    private RemoteViews getRemoteViews(RemoteViews widgetRemoteViews, int widgetId) {
        // Get the layout for the App Widget now if needed
        if (widgetRemoteViews == null) {
            // Get the stored layout for the App Widget
            int currentLayoutId = loadLayoutResourceId(context, widgetId);
            // If the layout is not stored, use the default layout
            if (currentLayoutId != 0) {
                widgetRemoteViews = new RemoteViews(context.getPackageName(), currentLayoutId);
            } else
                widgetRemoteViews = new RemoteViews(context.getPackageName(), getLayoutResourceId());
        }
        return widgetRemoteViews;
    }

    protected void showCrisisViewIfNeeded(
        JSONArray announcementsJson, RemoteViews widgetRemoteViews, SharedPreferencesHelper pref,
        Boolean hideLocation, Boolean hideIcon
    ) {
        announcementsJson = useNewOrStoredCrisisJsonObject(announcementsJson, pref);
        widgetRemoteViews.removeAllViews(R.id.crisisViewContainer);

        if (announcementsJson != null) {
            boolean crisisFound = false;
            try {
                for (int i = 0; i < announcementsJson.length(); i++) {
                    JSONObject jsonObject = announcementsJson.getJSONObject(i);
                    String type = jsonObject.getString("type");
                    if (type.equals("Crisis")) {
                        String content = jsonObject.getString("content");
                        RemoteViews crisisView = new RemoteViews(context.getPackageName(), R.layout.crisis_view);
                        crisisView.setTextViewText(R.id.crisisText, content);

                        if (hideIcon) {
                            crisisView.setViewVisibility(R.id.crisisIcon, GONE);
                        }

                        widgetRemoteViews.addView(R.id.crisisViewContainer, crisisView);
                        widgetRemoteViews.setViewVisibility(R.id.crisisViewContainer, VISIBLE);

                        if (hideLocation) {
                            widgetRemoteViews.setViewVisibility(R.id.locationNameTextView, GONE);
                            widgetRemoteViews.setViewVisibility(R.id.locationRegionTextView, GONE);
                            widgetRemoteViews.setViewVisibility(R.id.timeTextView, GONE);
                        }

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
                widgetRemoteViews.setViewVisibility(R.id.locationNameTextView, VISIBLE);
                widgetRemoteViews.setViewVisibility(R.id.locationRegionTextView, VISIBLE);
                widgetRemoteViews.setViewVisibility(R.id.timeTextView, VISIBLE);
            }
        } else {
            widgetRemoteViews.setViewVisibility(R.id.crisisViewContainer, GONE);
        }
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
    JSONObject useNewOrStoredJsonObject(JSONObject json, SharedPreferencesHelper pref, int widgetId) {
        Date now = new Date();
        long validity = getWidgetType() == WidgetType.WEATHER_FORECAST ? FORECAST_DATA_VALIDITY : WARNING_DATA_VALIDITY;

        if (json == null) {
            // Restore latest mainJson

            long updated = pref.getLong(LATEST_JSON_UPDATED, 0L);

            if (updated > (now.getTime() - validity)) {
                String jsonstr = pref.getString(LATEST_JSON, null);

                try {
                    json = new JSONObject(jsonstr);
                } catch (JSONException e) {
                    showErrorView(
                        context,
                        pref,
                        context.getResources().getString(R.string.update_failed),
                        getConnectionErrorDescription(),
                        widgetId
                    );
                    return null;
                }
            } else {
                showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.old_weather_data),
                    getConnectionErrorDescription(),
                    widgetId
                );
                return null;
            }

        } else {
            // Store latest mainJson
            pref.saveString("latest_json", json.toString());
            pref.saveLong(LATEST_JSON_UPDATED, now.getTime());
        }
        return json;
    }

    protected String getConnectionErrorDescription() {
        return AirplaneModeUtil.isAirplaneModeOn(context) ?
                context.getResources().getString(R.string.airplane_mode) :
                context.getResources().getString(R.string.automatic_retry);
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

    protected void showErrorView(Context context, SharedPreferencesHelper pref, String errorText1, String errorText2, int widgetId) {
        long updated = pref.getLong(WIDGET_UI_UPDATED, 0);
        long validity = getWidgetType() == WidgetType.WEATHER_FORECAST ? FORECAST_DATA_VALIDITY : WARNING_DATA_VALIDITY;

        if (updated > 0 && (System.currentTimeMillis() - updated < validity)) {
            Log.d("showErrorView", "Skip errorview, because data is still valid: " + updated);
            // No need to show error, because old data is still valid
            return;
        }

        RemoteViews widgetRemoteViews = new RemoteViews(context.getPackageName(), getLayoutResourceId());

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        widgetRemoteViews.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        // Show error view
        widgetRemoteViews.setInt(R.id.errorLayout, "setVisibility", VISIBLE);
        // Hide normal view
        widgetRemoteViews.setInt(R.id.normalLayout, "setVisibility", GONE);

        widgetRemoteViews.setTextViewText(R.id.errorHeaderTextView, errorText1);
        widgetRemoteViews.setTextViewText(R.id.errorBodyTextView, errorText2);

        appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
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

    protected String getSymbolTranslation(int symbol) {
        // > 100 is night version, but we can use day symbol translation
        int symbolId = context.getResources().getIdentifier(
                symbol > 100 ? "s_"+(symbol-100) : "s_"+symbol,
                "string",
                context.getPackageName()
        );
        return context.getString(symbolId);
    }

    protected int getWidgetWidthInPixels(int appWidgetId) {
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        return minWidth;
    }
}