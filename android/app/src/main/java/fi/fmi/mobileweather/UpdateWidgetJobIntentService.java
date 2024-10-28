package fi.fmi.mobileweather;

import android.Manifest;
import android.app.PendingIntent;
import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.location.Location;
import android.os.IBinder;
import androidx.core.app.JobIntentService;
import androidx.core.content.ContextCompat;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;

import com.fewlaps.quitnowcache.QNCache;
import com.fewlaps.quitnowcache.QNCacheBuilder;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import static android.appwidget.AppWidgetManager.INVALID_APPWIDGET_ID;

/**
 * Service for Widget
 * Created by Pekka Keränen on 25.1.2017.
 */

public class UpdateWidgetJobIntentService extends JobIntentService {

    QNCache cache = new QNCacheBuilder().setAutoReleaseInSeconds(60*60).createQNCache();

    @Override
    public void onCreate() {
        super.onCreate();

    }

    @Override
    protected void onHandleWork(Intent intent) {

        final int incomingAppWidgetId = intent.getIntExtra(EXTRA_APPWIDGET_ID, INVALID_APPWIDGET_ID);

        if (incomingAppWidgetId != INVALID_APPWIDGET_ID) {

            Log.d("starting", "widget: "+incomingAppWidgetId);

            SharedPreferences pref = getSharedPreferences("fi.fmi.mobileweather.widget_"+incomingAppWidgetId, Context.MODE_PRIVATE);
            int geoid = pref.getInt("location", 0);

            Log.d("location", "geoid: "+geoid);

            if (geoid==0) {

                if ((ContextCompat.checkSelfPermission(this,
                        Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED)
                        || (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)){

                    Boolean ok = SingleShotLocationProvider.requestSingleUpdate(this,
                            new SingleShotLocationProvider.LocationCallback() {
                                @Override
                                public void onNewLocationAvailable(Location location) {
                                    updateCoordinates(location.getLatitude(), location.getLongitude(), incomingAppWidgetId);
                                }
                            });

                    if (!ok)
                        this.updateWidgetWithPositioningError(incomingAppWidgetId);
                } else {
                    this.updateWidgetWithPositioningError(incomingAppWidgetId);
                }

            } else {
                this.updateWidgetUsingGeoId(geoid, incomingAppWidgetId);
            }

        }

    }

    @Override
    public boolean onStopCurrentWork() {
        Log.d("widget", "UpdateWidgetJobIntentService onStopCurrentWork");
        return true;
    }

    @Override
    public void onDestroy() {
        Log.d("widget", "UpdateWidgetJobIntentService onDestroy");
        super.onDestroy();
    }

    public RemoteViews buildErrorView(Context context, SharedPreferences pref, String errorstr)
    {
        String background = pref.getString("background", "dark");
        String version = pref.getString("version", "normal");
        RemoteViews main = null;

        if (version.equals("classic"))
            main = new RemoteViews(context.getPackageName(), R.layout.smallwidget);
        else
            main = new RemoteViews(context.getPackageName(), R.layout.widgetng);

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        main.setOnClickPendingIntent(R.id.mainLinearLayout, pendingIntent);

        if (background.equals("dark"))
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.parseColor("#80000000"));
        else if (background.equals("light")) {
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.argb(100, 238, 238, 238));
        } else
            main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.TRANSPARENT);


        if (version.equals("classic")) {
            main.setTextViewText(R.id.timeTextView, "");
            main.setTextViewText(R.id.temperatureTextView, "");
            main.setViewVisibility(R.id.feelsLikeImageView, View.GONE);

            Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
                    context.getResources().getIdentifier("error", "drawable", context.getPackageName()));

            main.setImageViewBitmap(R.id.weatherIconImageView, icon);
            main.setTextViewText(R.id.locationTextView, errorstr);

        } else {
            main.setTextViewText(R.id.locationTextView, "");
            main.setTextViewText(R.id.observationTitleTextView, "");
            main.removeAllViews(R.id.weatherRowLinearLayout);
            main.removeAllViews(R.id.observationsLinearLayout);
            RemoteViews error = new RemoteViews(context.getPackageName(), R.layout.error);
            error.setTextViewText(R.id.errorTextView, errorstr);
            main.addView(R.id.weatherRowLinearLayout, error);
        }

        return main;
    }


    protected void updateCoordinates(double latitude, double longitude, int widget_id) {

        AppWidgetManager manager = AppWidgetManager.getInstance(this);

        String language = java.util.Locale.getDefault().getLanguage();

        Log.d("language", language);

        if (!language.equals("fi") && !language.equals("sv") && !language.equals("en"))
            language = "en";

        String version = "";

        try {
            version = this.getPackageManager()
                    .getPackageInfo(this.getPackageName(), 0).versionName;
        } catch(Exception e) {
        }

        // Round to 4 decimals

        latitude = (double)Math.round(latitude * 10000d) / 10000d;
        longitude = (double)Math.round(longitude * 10000d) / 10000d;

        String params = "locations="+latitude+","+longitude+"&l="+language
                +"&version="+version;

        //Log.d("params", params);

        // Large widget

        String url = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries?geoid=658994&endtime=data&format=json&attributes=geoid&lang=fi&tz=utc&who=MobileWeather&producer=default&param=geoid,epochtime,name,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,dewPoint,smartSymbol,windDirection,windSpeedMS,pop,hourlymaximumgust,relativeHumidity,pressure,precipitation1h,windCompass8";
        Log.d("DownloadData json", "url 1: " + url);

//        String url = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries?param=geoid,name,region,latitude,longitude,region,country,iso2,localtz&latlon=62.5,26.2&format=json";

        // String url =  "https://widget.weatherproof.fi/android/androidwidget.php?"+params;

        fetchDataAndUpdateViews(url, widget_id);

    }

    protected void updateWidgetUsingGeoId(int geoid, int widget_id) {

        String language = java.util.Locale.getDefault().getLanguage();

        if (!language.equals("fi") && !language.equals("sv") && !language.equals("en"))
            language = "en";

        String version = "";

        try {
            version = this.getPackageManager()
                    .getPackageInfo(this.getPackageName(), 0).versionName;
        } catch(Exception e) {
            version = "";
        }

        String params = "locations="+geoid+"&l="+language+"&version="+version;

        // Large widget

        String url = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries?geoid=658994&endtime=data&format=json&attributes=geoid&lang=fi&tz=utc&who=MobileWeather&producer=default&param=geoid,epochtime,name,sunrise,sunset,sunriseToday,sunsetToday,dayLength,modtime,dark,temperature,feelsLike,dewPoint,smartSymbol,windDirection,windSpeedMS,pop,hourlymaximumgust,relativeHumidity,pressure,precipitation1h,windCompass8";
        Log.d("DownloadData json", "url 2: " + url);

        // String url =  "https://widget.weatherproof.fi/android/androidwidget.php?"+params;

        fetchDataAndUpdateViews(url, widget_id);

    }

    protected void fetchDataAndUpdateViews(String url, int widget_id)
    {

        // AsyncTask for downloading data

        new DownloadData(url, this, widget_id, AppWidgetManager.getInstance(this)).execute("fi.fmi.mobileweather");
    }

    protected void updateWidgetWithPositioningError(int widget_id)
    {
        SharedPreferences pref = this.getSharedPreferences("fi.fmi.mobileweather.widget_"+widget_id,
                                                            Context.MODE_PRIVATE);

        AppWidgetManager manager = AppWidgetManager.getInstance(this);
        RemoteViews updateViews = buildErrorView(this, pref, getString(R.string.positioning_failed));
        manager.updateAppWidget(widget_id, updateViews);
    }

 }
