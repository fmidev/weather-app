package fi.fmi.mobileweather;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.util.DisplayMetrics;
import android.view.View;
import android.widget.RemoteViews;
import android.util.Log;
import android.os.AsyncTask;
import android.os.Bundle;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.fewlaps.quitnowcache.QNCache;
import com.fewlaps.quitnowcache.QNCacheBuilder;

/**
 * Created by Pekka Keränen on 16.2.2017.
 */

public class DownloadData extends AsyncTask<String, Void, JSONObject> {

  QNCache cache = new QNCacheBuilder().setAutoReleaseInSeconds(60 * 60).createQNCache();

  private String src;
  private Context context;
  private int WidgetID;
  private AppWidgetManager WidgetManager;

  public DownloadData(String src, Context context, int appWidgetID, AppWidgetManager appWidgetManager) {
    this.src = src;
    this.context = context;
    this.WidgetID = appWidgetID;
    this.WidgetManager = appWidgetManager;
  }

  @Override
  protected JSONObject doInBackground(String... params) {

    // Check can we find result from cache

    String cachejson = (String) cache.get(src);

    if (cachejson != null) {
      Log.d("cache", src + " found from cache");

      try {
        JSONObject jsonObject = new JSONObject(cachejson);
        return jsonObject;
      } catch (JSONException e) {
        e.printStackTrace();
      }

      return null;
    }

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

        // Store to cache

        cache.set(src, jsonstr, 2 * 60 * 1000);
        JSONObject jsonObject = new JSONObject(jsonstr);

        // returns the json object
        return jsonObject;

      } catch (IOException e) {
        e.printStackTrace();
      } catch (JSONException e) {
        e.printStackTrace();
      }

      // if something went wrong, return null
      return null;

    } catch (IOException e) {
      e.printStackTrace();
      // Log.e("Exception",e.getMessage());
      return null;
    }
  }

  @Override
  protected void onPostExecute(JSONObject json) {
    if (isCancelled()) {
      return;
    }

    Intent intent = new Intent(context, MainActivity.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

    // Get settings

    SharedPreferences pref = context.getSharedPreferences("fi.fmi.mobileweather.widget_" + WidgetID,
        Context.MODE_PRIVATE);
    String background = pref.getString("background", "dark");
    String forecast_mode = pref.getString("forecast", "hours");
    String version = pref.getString("version", "advanced");

    // Widget manager gives widget width and height

    Bundle options = WidgetManager.getAppWidgetOptions(WidgetID);
    int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
    int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

    // Get the layout for the App Widget

    RemoteViews main = null;

    if (version.equals("classic"))
      main = new RemoteViews(context.getPackageName(), R.layout.smallwidget);
    else
      main = new RemoteViews(context.getPackageName(), R.layout.widgetng);

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
          RemoteViews errorview = buildErrorView(context, pref,
              context.getResources().getString(R.string.update_failed));
          WidgetManager.updateAppWidget(WidgetID, errorview);
          return;
        }
      } else {
        RemoteViews errorview = buildErrorView(context, pref, context.getResources().getString(R.string.update_failed));
        WidgetManager.updateAppWidget(WidgetID, errorview);
        return;
      }

    } else {
      // Store latest json

      SharedPreferences.Editor editor = pref.edit();
      editor.putString("latest_json", json.toString());
      editor.putLong("latest_json_updated", now.getTime());
      editor.commit();

    }

    if (background.equals("dark"))
      main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.parseColor("#191B22"));
    else if (background.equals("light")) {
      main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.rgb(255, 255, 255));
      main.setInt(R.id.locationTextView, "setTextColor", Color.rgb(48, 49, 147));
      main.setInt(R.id.observationTitleTextView, "setTextColor", Color.rgb(48, 49, 147));
    } else
      main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.TRANSPARENT);

    DisplayMetrics metrics = context.getResources().getDisplayMetrics();
    float dpiwidth = metrics.widthPixels / metrics.density;

    int cellwidth = 40;

    if (dpiwidth > 400 && !version.equals("classic")) {
      cellwidth = 66;
    }

    String geoid = "";
    DateFormat format = new SimpleDateFormat("yyyyMMdd'T'HHmm");
    DateFormat obstimeformat = new SimpleDateFormat("yyyyMMddHHmm");
    DateFormat hourformat = new SimpleDateFormat("HH:mm");
    DateFormat shorthourformat = new SimpleDateFormat("HH");
    DateFormat shortdayformat = new SimpleDateFormat("EE");
    String iso2 = "";

    Log.d("DownloadData json", json.toString());

    /*try {

      // Get the keys of the JSONObject
      Iterator<String> keys = json.keys();

      // Retrieve the first key
      if (keys.hasNext()) {
        String firstKey = keys.next();
        Log.d("DownloadData json", "First key: " + firstKey);

        // Extract the JSONArray associated with the first key
        JSONArray jsonArray = json.getJSONArray(firstKey);

        // Get the first JSONObject from the JSONArray
        JSONObject firstObject = jsonArray.getJSONObject(0);

        // Retrieve the temperature and feelsLike values
        int temperature = firstObject.getInt("temperature");
        int feelsLike = firstObject.getInt("feelsLike");

        // Print the values
        Log.d("DownloadData json", "Temperature: " + temperature);
        Log.d("DownloadData json", "Feels Like: " + feelsLike);
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
*/
    try {


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
      
      /*JSONArray forecasts = json.getJSONArray("forecasts");
      JSONObject forecast = forecasts.getJSONObject(0);
      JSONArray data = forecast.getJSONArray("forecast");

      JSONObject first = data.getJSONObject(0);*/



      String name = first.getString("name");
      String region = first.getString("region");
      iso2 = first.getString("iso2");
      geoid = firstKey;

      main.setTextViewText(R.id.locationTextView, name + ", " + region);

      if (!version.equals("classic"))
        main.removeAllViews(R.id.weatherRowLinearLayout);

      int count = 0;

      for (int i = 0; i < data.length(); i++) {

        if (count >= Math.floor((dpiwidth - 14) / cellwidth))
          break;

        JSONObject current = data.getJSONObject(i);
        String localtime = current.getString("localtime");
        String utcttime = current.getString("utctime");

        if (!isTimeDisplayable(utcttime, localtime, forecast_mode))
          continue;

        if (version.equals("classic")) {
          // Update classic widget here!

          try {
            Date date = format.parse(localtime);
            main.setTextViewText(R.id.shortTimeTextView, shorthourformat.format(date));
            main.setTextViewText(R.id.timeTextView, hourformat.format(date));
          } catch (Exception e) {
            continue;
          }

          String temperature = current.getString("temperature");
          main.setTextViewText(R.id.temperatureTextView, temperature + "°");

          String weathersymbol = current.getString("smartSymbol");

          Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
              context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));

          main.setImageViewBitmap(R.id.weatherIconImageView, icon);

          // Resolve feelsike icon

          String feelslike = "basic";

          try {
            Boolean feelslikeboolean = json.getBoolean("feelslike");
          } catch (Exception e) {
          }

          if (feelslike.equals("basic")) {
            try {
              JSONObject feelslikehash = json.getJSONObject("feelslike");
              feelslike = feelslikehash.getString(iso2.toLowerCase());
            } catch (Exception e) {
            }
          }

          if (feelslike.equals("basic")) {
            try {
              JSONObject feelslikehash = json.getJSONObject("feelslike");
              feelslike = feelslikehash.getString("all");
            } catch (Exception e) {
            }
          }

          if (feelslike.equals("basic"))
            feelslike = resolveFeelsLikeIcon(current);

          // Remove .svg from filename if exists

          feelslike = feelslike.replace(".svg", "");

          Bitmap feelslikeicon = BitmapFactory.decodeResource(context.getResources(),
              context.getResources().getIdentifier(feelslike, "drawable", context.getPackageName()));

          main.setImageViewBitmap(R.id.feelsLikeImageView, feelslikeicon);

          // If size is small then hide feels like icon

          if (minWidth < 140 || minHeight < 140)
            main.setViewVisibility(R.id.feelsLikeRelativeLayout, View.GONE);
          else
            main.setViewVisibility(R.id.feelsLikeRelativeLayout, View.VISIBLE);
          // If very small then also hide location name and show time

          if (minWidth < 70 || minHeight < 70) {
            main.setViewVisibility(R.id.locationTextView, View.GONE);
          } else {
            main.setViewVisibility(R.id.locationTextView, View.VISIBLE);
          }

          if (minWidth < 70) {
            main.setViewVisibility(R.id.timeTextView, View.GONE);
            main.setViewVisibility(R.id.shortTimeTextView, View.VISIBLE);
          } else {
            main.setViewVisibility(R.id.shortTimeTextView, View.GONE);
            main.setViewVisibility(R.id.timeTextView, View.VISIBLE);
          }

          WidgetManager.updateAppWidget(WidgetID, main);
          return;
        }

        RemoteViews cell = null;

        if (dpiwidth < 400)
          cell = new RemoteViews(context.getPackageName(), R.layout.weathercellsmall);
        else
          cell = new RemoteViews(context.getPackageName(), R.layout.weathercell);

        try {
          Date date = format.parse(localtime);
          if (forecast_mode.equals("hours"))
            cell.setTextViewText(R.id.timeTextView, hourformat.format(date));
          else
            cell.setTextViewText(R.id.timeTextView, shortdayformat.format(date));

          if (background.equals("light"))
            cell.setInt(R.id.timeTextView, "setTextColor", Color.rgb(48, 49, 147));
        } catch (Exception e) {
          continue;
        }

        iso2 = current.getString("iso2");
        String temperature = current.getString("temperature");
        cell.setTextViewText(R.id.temperatureTextView, temperature + "°");

        if (background.equals("light"))
          cell.setInt(R.id.temperatureTextView, "setTextColor", Color.rgb(48, 49, 147));

        String weathersymbol = current.getString("smartSymbol");

        Bitmap icon = BitmapFactory.decodeResource(context.getResources(),
            context.getResources().getIdentifier("s" + weathersymbol + (background.equals("light") ? "_light" : "_dark"), "drawable", context.getPackageName()));

        cell.setImageViewBitmap(R.id.weatherIconImageView, icon);

        main.addView(R.id.weatherRowLinearLayout, cell);
        count++;

      }

    } catch (final JSONException e) {
      Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
      main.setTextViewText(R.id.locationTextView, "Virhe ennusteen käsittelyssä");
    }

    // ***TODO: Observations to be handled separately
    // Make observation text

    try {
      JSONObject observations = json.getJSONObject("observations");
      JSONArray stations = observations.getJSONArray(geoid);

      for (int n = 0; n < stations.length(); n++) {

        JSONObject data = stations.getJSONObject(n);

        String localtime = data.getString("localtime");
        String name = data.getString("name");
        String region = data.getString("region");
        String temperature = data.getString("temperature");
        String dewpoint = data.getString("DewPoint");
        String wc = data.getString("WindCompass8");
        String ws = data.getString("WindSpeedMS");
        String wg = data.getString("WindGust");
        String humidity = data.getString("Humidity");
        String pressure = data.getString("Pressure");
        String cloudiness = data.getString("TotalCloudCover");
        String visibility = data.getString("Visibility");
        String rain = "nan";
        String snowdepth = "nan";

        if (iso2.equals("FI")) {
          rain = data.getString("RI_10MIN");
          snowdepth = data.getString("SnowDepth");
        }

        Date date = obstimeformat.parse(localtime);

        main.setTextViewText(R.id.observationTitleTextView,
            context.getString(R.string.observation) + ": " + name + ", " + region + " " + hourformat.format(date));

        String parameters = "";
        String values = "";

        if (!isNan(temperature)) {
          parameters += context.getString(R.string.temperature) + "\n";
          values += temperature + " °C\n";
        } else {
          // Without temperature we don't have reasonable data to show.
          // Try next station

          continue;

        }

        if (!isNan(dewpoint)) {
          parameters += context.getString(R.string.dewpoint) + "\n";
          values += dewpoint + " °C\n";
        }

        if (!isNan(wc) && !isNan(ws)) {
          float wsfloat = Float.parseFloat(ws);
          String windtxt = convertWindCompassToText(wc, wsfloat);

          if (windtxt.length() > 13)
            windtxt = windtxt.substring(0, 13);

          parameters += windtxt + "\n";
          values += Math.round(wsfloat) + " m/s\n";
        }

        if (!isNan(wg)) {
          parameters += context.getString(R.string.gust) + "\n";
          float wgfloat = Float.parseFloat(wg);
          values += Math.round(wgfloat) + " m/s\n";
        }

        if (!isNan(humidity)) {
          float hfloat = Float.parseFloat(humidity);
          parameters += context.getString(R.string.humidity) + "\n";
          values += Math.round(hfloat) + " %\n";
        }

        // Quite difficult to do two column layout, but I have not found anything better
        // that works.
        // Pekka Keränen 23.1.2017

        main.removeAllViews(R.id.observationsLinearLayout);

        RemoteViews column1 = null;

        if (dpiwidth < 400)
          column1 = new RemoteViews(context.getPackageName(), R.layout.parametertextviewsmall);
         else
          column1 = new RemoteViews(context.getPackageName(), R.layout.parametertextview);

        column1.setTextViewText(R.id.emptyTextView, parameters);
        if (background.equals("light")) {
          column1.setInt(R.id.emptyTextView, "setTextColor", Color.rgb(48, 49, 147));
        }

        main.addView(R.id.observationsLinearLayout, column1);

        RemoteViews column2 = null;

        if (dpiwidth < 400)
          column2 = new RemoteViews(context.getPackageName(), R.layout.valuetextviewsmall);
        else
          column2 = new RemoteViews(context.getPackageName(), R.layout.valuetextview);

        column2.setTextViewText(R.id.emptyTextView, values);
        if (background.equals("light")) {
          column2.setInt(R.id.emptyTextView, "setTextColor", Color.rgb(48, 49, 147));
        }

        main.addView(R.id.observationsLinearLayout, column2);

        parameters = "";
        values = "";

        if (!isNan(pressure)) {
          parameters += context.getString(R.string.pressure) + "\n";
          values += pressure + " hPa\n";
        }

        if (!isNan(visibility)) {

          float val = Float.parseFloat(visibility);
          String valstr = "";
          String unit = "";

          if (val < 1000) {
            val = Math.round(val);
            unit = "m";
          } else if (val < 5000) {
            val = val / 1000;
            valstr = String.format("%.1f", val);
            unit = "km";
          } else if (val >= 50000) {
            valstr = context.getString(R.string.over) + " 50";
            unit = "km";
          } else {
            val = Math.round(val / 1000);
            valstr = String.format("%.0f", val);
            unit = "km";
          }

          parameters += context.getString(R.string.visibility) + "\n";

          if (valstr.equals(""))
            values += val + " " + unit + "\n";
          else
            values += valstr + " " + unit + "\n";
        }

        if (!isNan(rain)) {
          parameters += context.getString(R.string.rain) + "\n";
          values += rain + " mm/h\n";
        }

        if (!isNan(snowdepth) && !snowdepth.equals("-1.0")) {
          float sdfloat = Float.parseFloat(snowdepth);
          parameters += context.getString(R.string.snowdepth) + "\n";
          values += Math.round(sdfloat) + " cm\n";
        }

        if (!isNan(cloudiness)) {
          parameters += context.getString(R.string.cloudiness) + "\n";
          values += convertCloudinessToText(cloudiness) + "\n";
        }

        RemoteViews column3 = null;

        if (dpiwidth < 400)
          column3 = new RemoteViews(context.getPackageName(), R.layout.parametertextviewsmall);
        else
          column3 = new RemoteViews(context.getPackageName(), R.layout.parametertextview);

        column3.setTextViewText(R.id.emptyTextView, parameters);
        if (background.equals("light")) {
          column3.setInt(R.id.emptyTextView, "setTextColor", Color.rgb(48, 49, 147));
        }

        main.addView(R.id.observationsLinearLayout, column3);

        RemoteViews column4 = null;

        if (dpiwidth < 400)
          column4 = new RemoteViews(context.getPackageName(), R.layout.valuetextviewsmall);
        else
          column4 = new RemoteViews(context.getPackageName(), R.layout.valuetextview);

        column4.setTextViewText(R.id.emptyTextView, values);
        if (background.equals("light")) {
          column4.setInt(R.id.emptyTextView, "setTextColor", Color.rgb(48, 49, 147));
        }

        main.addView(R.id.observationsLinearLayout, column4);

        break;

      }

    } catch (final Exception e) {
      Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
      main.setTextViewText(R.id.observationTitleTextView, "Virhe havaintojen käsittelyssä.");
    }

    WidgetManager.updateAppWidget(WidgetID, main);
    return;

  }

  public RemoteViews buildErrorView(Context context, SharedPreferences pref, String errorstr) {
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
      main.setInt(R.id.mainLinearLayout, "setBackgroundColor", Color.parseColor("#191B22"));
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

  private Boolean isNan(String value) {
    if (value.toLowerCase().equals("nan"))
      return true;
    else
      return false;
  }

  private String convertWindCompassToText(String wc, float ws) {
    if (ws == 0)
      return context.getString(R.string.calm);
    if (wc.equals("N"))
      return context.getString(R.string.north_wind);
    if (wc.equals("NE"))
      return context.getString(R.string.north_east_wind);
    if (wc.equals("E"))
      return context.getString(R.string.east_wind);
    if (wc.equals("SE"))
      return context.getString(R.string.south_east_wind);
    if (wc.equals("S"))
      return context.getString(R.string.south_wind);
    if (wc.equals("SW"))
      return context.getString(R.string.south_west_wind);
    if (wc.equals("W"))
      return context.getString(R.string.west_wind);
    if (wc.equals("NW"))
      return context.getString(R.string.north_west_wind);

    return "";
  }

  private String convertCloudinessToText(String cloudiness) {
    float c = Float.parseFloat(cloudiness);

    if (c < 1)
      return context.getString(R.string.sky_clear);
    if (c == 1 || c == 2)
      return context.getString(R.string.almost_clear);
    if (c >= 3 && c <= 5)
      return context.getString(R.string.partly_cloudy);
    if (c == 6 || c == 7)
      return context.getString(R.string.almost_cloudy);
    if (c >= 8)
      return context.getString(R.string.cloudy);

    return "";
  }

  protected Boolean isTimeDisplayable(String utctime, String localtime, String mode) {
    // Check that time is in future

    DateFormat format = new SimpleDateFormat("yyyyMMdd'T'HHmm");
    format.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));

    try {
      Date utcdate = format.parse(utctime);
      Date now = new Date();

      if (utcdate.before(now))
        return false;

    } catch (Exception e) {
      return false;
    }

    if (mode.equals("days")) {
      String hour = localtime.substring(9, 11);

      if (hour.equals("15"))
        return true;
      else
        return false;
    }

    return true;
  }

  protected String resolveFeelsLikeIcon(JSONObject timestep) {
    int ws;
    int temperature;
    int weathersymbol;

    try {
      ws = timestep.getInt("windSpeedMS");
      temperature = timestep.getInt("temperature");
      weathersymbol = timestep.getInt("smartSymbol");
    } catch (final JSONException e) {
      return "basic";
    }

    if (ws >= 10)
      return "windy";
    if (temperature >= 30)
      return "hot";
    if (temperature <= -10)
      return "winter";
    if (weathersymbol >= 37 && weathersymbol <= 39)
      return "raining";

    return "basic";
  }

}
