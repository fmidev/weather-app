package fi.fmi.mobileweather;

import static fi.fmi.mobileweather.Theme.LIGHT;

import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public abstract class BaseWarningsWidgetProvider extends BaseWidgetProvider {

    @Override
    protected void executeDataFetchingWithLatLon(String latlon, SharedPreferencesHelper pref, int widgetId) {

        // if we have no location, do not update the widget
        if (latlon == null || latlon.isEmpty()) {
            Log.d("Widget Update", "No location data available, widget not updated");
            return;
        }

        ExecutorService executorService = Executors.newFixedThreadPool(2);

        // Get language string
        String language = getLanguageString();

        // temporary for testing.
//        String announceUrl = "https://en-beta.ilmatieteenlaitos.fi/api/general/mobileannouncements";
        String announceUrl = announcementsUrl;

        // get forecast based on geoid
        Future<JSONObject> future1 = executorService.submit(() -> fetchMainData(latlon, language));
        // get announcements
        Future<JSONArray> future2 = executorService.submit(() -> fetchJsonArray(announceUrl));

        executorService.submit(() -> {
            try {
                JSONObject result1 = future1.get();
                JSONArray result2 = future2.get();
                onDataFetchingPostExecute(result1, result2, null, pref, widgetId);
            } catch (Exception e) {
                Log.e("Download json", "Exception: " + e.getMessage());
                // NOTE: let's not show error view here, because connection problems with server
                //       seem to be quite frequent and we don't want to show error view every time
            }
        });
    }

    protected JSONObject fetchMainData(String latlon, String language) {

        String url;
        if (latlon != null && !latlon.isEmpty()) {
            url = warningsUrl + "?latlon=" +
                    latlon +
                    "&country=" +
                    language +
                    "&who=mobileweather-widget-android";
        } else {
            return null;
        }

        try {
            String jsonString = fetchJsonString(url);
            return new JSONObject(jsonString);
        } catch (JSONException e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            return null;
        }
    }

    @Override
    protected void setWidgetUi(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId) {

        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject warningsJson = widgetInitResult.mainJson();
        String theme = widgetInitResult.theme();

        if (warningsJson == null) {
            return;
        }

        try {
            List<Map<String, Object>> warningsList = parseWarningsJson(warningsJson);

            // loop through the warnings and show them in the widget
            for (int i = 0; i < warningsList.size(); i++) {
                Map<String, Object> warningData = warningsList.get(i);
                String type = (String) warningData.get("type");
                String description = (String) warningData.get("description");
                String startTime = (String) warningData.get("startTime");
                String endTime = (String) warningData.get("endTime");
                /*int windIntensity = (int) warningData.get("windIntensity");
                String windIntensityUom = (String) warningData.get("windIntensityUom");
                int windDirection = (int) warningData.get("windDirection");
                String windDirectionUom = (String) warningData.get("windDirectionUom");
*/
                // set the warning data to the widget
                widgetRemoteViews.setTextViewText(R.id.warningTypeTextView, type);
//                widgetRemoteViews.setTextViewText(R.id.warningDescriptionTextView, description);
                widgetRemoteViews.setTextViewText(R.id.warningStartTimeTextView, startTime);
                widgetRemoteViews.setTextViewText(R.id.warningEndTimeTextView, endTime);
                /*widgetRemoteViews.setTextViewText(R.id.warningWindIntensityTextView, windIntensity + " " + windIntensityUom);
                widgetRemoteViews.setTextViewText(R.id.warningWindDirectionTextView, windDirection + " " + windDirectionUom);
*/
                // update the widget
                appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
            }

            /*// Get the keys of the JSONObject
            Iterator<String> keys = warningsJson.keys();

            // Retrieve the first key
            if (!keys.hasNext()) {
                return;
            }
            String firstKey = keys.next();
            Log.d("Download json", "First key (geoid): " + firstKey);

            // Extract the JSONArray associated with the first key
            JSONArray data = warningsJson.getJSONArray(firstKey);

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

            String weatherSymbol = first.getString("smartSymbol");
            int drawableResId = context.getResources().getIdentifier("s_" + weatherSymbol + (theme.equals(LIGHT) ? "_light" : "_dark"), "drawable", context.getPackageName());
            widgetRemoteViews.setImageViewResource(R.id.weatherIconImageView, drawableResId);

            // Update time TODO: should be hidden for release
            widgetRemoteViews.setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));

            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref);

            appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
            return;
*/
        } catch (final Exception e) {
            Log.e("Download json", "Exception Json parsing error: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection),
                    widgetId
            );
        }

        appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
    }

    protected List<Map<String, Object>> parseWarningsJson(JSONObject warningsJsonObject) {
        List<Map<String, Object>> warningDataList = new ArrayList<>();
        try {
            JSONObject dataObject = warningsJsonObject.getJSONObject("data");
            JSONArray warningsArray = dataObject.getJSONArray("warnings");

            for (int i = 0; i < warningsArray.length(); i++) {
                Map<String, Object> warningData = new HashMap<>();

                JSONObject warning = warningsArray.getJSONObject(i);
                warningData.put("type", warning.getString("type"));
                warningData.put("language", warning.getString("language"));
                warningData.put("severity", warning.getString("severity"));
                warningData.put("description", warning.getString("description"));

                JSONObject duration = warning.getJSONObject("duration");
                warningData.put("startTime", duration.getString("startTime"));
                warningData.put("endTime", duration.getString("endTime"));

                /*JSONObject physical = warning.getJSONObject("physical");
                warningData.put("windIntensity", physical.getInt("windIntensity"));
                warningData.put("windIntensityUom", physical.getString("windIntensityUom"));
                warningData.put("windDirection", physical.getInt("windDirection"));
                warningData.put("windDirectionUom", physical.getString("windDirectionUom"));
*/
                warningDataList.add(warningData);
            }
        } catch (JSONException e) {
            Log.d("Download json", "Exception Json parsing error: " + e.getMessage());
        }
        return warningDataList;
    }

}
