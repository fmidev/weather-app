package fi.fmi.mobileweather;

import android.util.Log;
import android.widget.RemoteViews;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.List;
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

        ExecutorService executorService = Executors.newFixedThreadPool(3);

        // Get language string
        String language = getLanguageString();

        // temporary for testing.
//        String announceUrl = "https://en-beta.ilmatieteenlaitos.fi/api/general/mobileannouncements";
        String announceUrl = announcementsUrl;

        // get warnings data bases on latlon
        Future<JSONObject> future1 = executorService.submit(() -> fetchMainData(latlon, language));
        // get announcements
        Future<JSONArray> future2 = executorService.submit(() -> fetchJsonArray(announceUrl));
        // get location name and region
        Future<String> future3 = executorService.submit(() -> fetchLocationData(latlon));

        executorService.submit(() -> {
            try {
                JSONObject result1 = future1.get();
                JSONArray result2 = future2.get();
                String result3 = future3.get();
                onDataFetchingPostExecute(result1, result2, result3, null, pref, widgetId);
            } catch (Exception e) {
                Log.e("Download json", "Exception: " + e.getMessage());
                // NOTE: let's not show error view here, because connection problems with server
                //       seem to be quite frequent and we don't want to show error view every time
            }
        });
    }

    private String fetchLocationData(String latlon) {
        // example: ?param=geoid,name,region,latitude,longitude,region,country,iso2,localtz&latlon=62.5,26.2&format=json
        String url = weatherUrl
                + "?param=geoid,name,region,latitude,longitude,region,country,iso2,localtz&latlon="
                + latlon
                + "&format=json";
        try {
            return fetchJsonString(url);
        } catch (Exception e) {
            Log.e("Download json", "fetchLocationData exception: " + e.getMessage());
            return null;
        }
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
            Log.e("Download json", "In base warnings fetchMainData exception: " + e.getMessage());
            return null;
        }
    }

    @Override
    protected void setWidgetUi(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId, String locationJson) {

        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject warningsJsonObj = widgetInitResult.mainJson();
        String theme = widgetInitResult.theme();

        if (warningsJsonObj == null) {
            return;
        }

        try {

            Gson gson = new Gson();

            Type locationListType = new TypeToken<List<LocationRecord>>() {}.getType();
            List<LocationRecord> locations = gson.fromJson(locationJson, locationListType);
            LocationRecord location = locations.get(0);

            WarningsRecordRoot warningsRecordRoot = gson.fromJson(warningsJsonObj.toString(), WarningsRecordRoot.class);
            String updated = warningsRecordRoot.data().updated();

            // show a maximum of 3 warnings
            int numberOfWarningsToShow = Math.min(warningsRecordRoot.data().warnings().size(), 3);
            for (int i = 0; i < numberOfWarningsToShow; i++) {
                Warning warning = warningsRecordRoot.data().warnings().get(i);
                String type = warning.type();
                String language = warning.language();
                String severity = warning.severity();
                String description = warning.description();

                String startTime = warning.duration().startTime();
                String endTime = warning.duration().endTime();

                // *** set the warning data to the widget

                // Set the location name and region
                widgetRemoteViews.setTextViewText(R.id.locationNameTextView, location.name());
                widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, location.region());

                // Set the icons in the layout
                int iconResourceId = WarningsIconMapper.getIconResourceId(type);
                if (iconResourceId != 0) {
                    widgetRemoteViews.setImageViewResource(R.id.warningIconImageView0, iconResourceId);
                }



               /* widgetRemoteViews.setTextViewText(R.id.warningTypeTextView, type);
                widgetRemoteViews.setTextViewText(R.id.warningDescriptionTextView, description);
                widgetRemoteViews.setTextViewText(R.id.warningStartTimeTextView, startTime);
                widgetRemoteViews.setTextViewText(R.id.warningEndTimeTextView, endTime);*/
            }
        } catch (Exception e) {
            Log.e("Download json", "In base warnings setWidgetUi exception: " + e.getMessage());
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

}
