package fi.fmi.mobileweather;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.util.Log;
import android.content.ComponentName;

public class NewSmallWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_AUTO_UPDATE =
            "fi.fmi.mobileweather.AUTO_UPDATE";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if(intent!=null && intent.getAction()!=null &&
                intent.getAction().equals(ACTION_AUTO_UPDATE)){
            onUpdate(context);
        }
    }

    private void onUpdate(Context context) {
        Log.d("MyWidget Update","Udpate triggered");
        AppWidgetManager appWidgetManager =
                AppWidgetManager.getInstance(context);
        ComponentName thisAppWidgetComponentName = new ComponentName(context.getPackageName(),getClass().getName());
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName);
        onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
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
        super.onEnabled(context);
        WidgetNotification.scheduleWidgetUpdate(context);
    }

    private void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        // Update the text
        views.setTextViewText(R.id.widget_text, "Updated Text at " + java.text.DateFormat.getTimeInstance().format(new java.util.Date()));

        // Update the image
//        views.setImageViewResource(R.id.widget_image, R.drawable.updated_image);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
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


    public void execute() {
        Future<JSONObject> future1 = executorService.submit(() -> fetchData(urls[0]));
        Future<JSONObject> future2 = executorService.submit(() -> fetchData(urls[1]));

        executorService.submit(() -> {
            try {
                JSONObject result1 = future1.get();
                JSONObject result2 = future2.get();
                onPostExecute(result1, result2);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private JSONObject fetchData(String src) {
        if (src == null || src.equals(""))
            return null;

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

    protected void onPostExecute(JSONObject json, JSONObject json2) {
        // TODO: check canceling
        /*if (isCancelled()) {
          return;
        }*/

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

        /*if (dpiwidth > 400 && !version.equals("classic") && !version.equals("experimental")) {
            cellwidth = 66;
        }*/

        String geoid = "";
        DateFormat format = new SimpleDateFormat("yyyyMMdd'T'HHmm");
        DateFormat obstimeformat = new SimpleDateFormat("yyyyMMddHHmm");
        DateFormat hourformat = new SimpleDateFormat("HH:mm");
        DateFormat shorthourformat = new SimpleDateFormat("HH");
        DateFormat shortdayformat = new SimpleDateFormat("EE");
        String iso2 = "";

        Log.d("DownloadData json", "Forecast json: " + json.toString());

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

            String name = first.getString("name");
            String region = first.getString("region");
            iso2 = first.getString("iso2");
            geoid = firstKey;

            main.setTextViewText(R.id.locationTextView, name + ", " + region);

           /* if (!version.equals("classic") && !version.equals("experimental"))
                main.removeAllViews(R.id.weatherRowLinearLayout);*/

            int count = 0;

            for (int i = 0; i < data.length(); i++) {

                if (count >= Math.floor((dpiwidth - 14) / cellwidth))
                    break;

                JSONObject current = data.getJSONObject(i);
                String localtime = current.getString("localtime");
                String utcttime = current.getString("utctime");

                /*if (!isTimeDisplayable(utcttime, localtime, forecast_mode))
                    continue;*/

                if (version.equals("classic") || version.equals("classic")) {
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
            }

        } catch (final JSONException e) {
            Log.e("DownloadData json", "Exception Json parsing error: " + e.getMessage());
            main.setTextViewText(R.id.locationTextView, "Virhe ennusteen käsittelyssä");
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
        else if (version.equals("experimental"))
            main = new RemoteViews(context.getPackageName(), R.layout.experimentalwidget);
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

        if (version.equals("classic") || version.equals("experimental")) {
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
}