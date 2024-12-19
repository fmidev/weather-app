package fi.fmi.mobileweather;

import static android.text.format.DateUtils.isToday;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;

import static fi.fmi.mobileweather.ColorUtils.getPrimaryBlue;
import static fi.fmi.mobileweather.PrefKey.FAVORITE_LATLON;
import static fi.fmi.mobileweather.Theme.LIGHT;

import android.graphics.Color;
import android.util.Log;
import android.widget.RemoteViews;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public abstract class BaseWarningsWidgetProvider extends BaseWidgetProvider {

    @Override
    protected void executeDataFetchingWithSelectedLocation(int geoId, SharedPreferencesHelper pref, int widgetId) {
        String latlon = pref.getString(FAVORITE_LATLON, null);
        executeDataFetchingWithLatLon(latlon, pref, widgetId);
    }

    @Override
    protected void executeDataFetchingWithLatLon(String latlon, SharedPreferencesHelper pref, int widgetId) {

        // if we have no location, do not update the widget
        if (latlon == null || latlon.isEmpty()) {
            Log.d("Warnings Widget Update", "No location data available, widget not updated");
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
                Log.e("Warnings Widget Update", "Exception: " + e.getMessage());
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
            Log.e("Warnings Widget Update", "fetchLocationData exception: " + e.getMessage());
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
            Log.e("Warnings Widget Update", "In base warnings fetchMainData exception: " + e.getMessage());
            return null;
        }
    }

    @Override
    protected void setWidgetUi(JSONArray announcementsJson, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId, String locationJson) {

        Log.d("Warnings Widget Update", "setWidgetUi called");

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

            Log.d("Warnings Widget Update", "WarningsJson: " + warningsJsonObj);
            Log.d("Warnings Widget Update", "WarningsRecordRoot: " + warningsRecordRoot);


            // filter out the warnings by language
            Iterator<Warning> iterator = warningsRecordRoot.data().warnings().iterator();
            while (iterator.hasNext()) {
                Warning warning = iterator.next();
                if (!warning.language().equals(getLanguageString())) {
                    iterator.remove();
                }
            }

            // filter the warnings that only the ones remain if now is between the start and end date
            // (perhaps npt this: or if the warning starts today later)
            Iterator<Warning> iterator2 = warningsRecordRoot.data().warnings().iterator();
            while (iterator2.hasNext()) {
                Warning warning = iterator2.next();
                String startTime = warning.duration().startTime();
                String endTime = warning.duration().endTime();
                SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
                Date startDate = formatter.parse(startTime);
                Date endDate = formatter.parse(endTime);
                if (!isNowValid(startDate, endDate) /*&& !startsTodayLater(startDate)*/) {
                    iterator2.remove();
                }
            }

            // reset the warning icon layouts to GONE first
            resetWidgetUi(widgetRemoteViews);

            // show a maximum of 3 warnings
            int amountOfWarnings = warningsRecordRoot.data().warnings().size();
            Log.d("Warnings Widget Update", "Amount of warnings: " + amountOfWarnings);
            int amountOfWarningsToShow = Math.min(amountOfWarnings, 3);
            Log.d("Warnings Widget Update", "Amount of warnings to show: " + amountOfWarningsToShow);
            for (int i = 0; i < amountOfWarningsToShow; i++) {
                Warning warning = warningsRecordRoot.data().warnings().get(i);
                String type = warning.type();
                String severity = warning.severity();
                String startTime = warning.duration().startTime();
                String endTime = warning.duration().endTime();

                // *** set the warning data to the widget

                // Set the location name and region
                widgetRemoteViews.setTextViewText(R.id.locationNameTextView, location.name());
                widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, location.region());

                // make the warning icon layout visible
                int warningIconLayoutId = context.getResources().getIdentifier("warningIconLayout" + i, "id", context.getPackageName());
                widgetRemoteViews.setViewVisibility(warningIconLayoutId, VISIBLE);

                // set the background circles
                int circleBackgroundId = context.getResources().getIdentifier("warningIconBackgroundImageView" + i, "id", context.getPackageName());
                Log.d("Warnings Widget Update", "circleBackgroundId: " + circleBackgroundId);
                int circleBackgroundResourceId = WarningsIconMapper.getCircleBackgroundResourceId(severity);
                Log.d("Warnings Widget Update", "CircleBackgroundResourceId: " + circleBackgroundResourceId);
                if (circleBackgroundResourceId != 0) {
                    widgetRemoteViews.setInt(circleBackgroundId, "setBackgroundResource", circleBackgroundResourceId);
                }

                // Set the icons in the layout
                int warningIconImageViewId = context.getResources().getIdentifier("warningIconImageView" + i, "id", context.getPackageName());
                Log.d("Warnings Widget Update", "warningIconImageViewId: " + warningIconImageViewId);
                int iconResourceId = WarningsIconMapper.getIconResourceId(type);
                Log.d("Warnings Widget Update", "IconResourceId: " + iconResourceId);
                if (iconResourceId != 0) {
                    widgetRemoteViews.setImageViewResource(warningIconImageViewId, iconResourceId);
                }

                // set warning text and time frame colors based on theme
                int textColor = theme.equals(LIGHT) ? getPrimaryBlue(context) : Color.WHITE;
                widgetRemoteViews.setInt(R.id.warningTextView, "setTextColor", textColor);
                widgetRemoteViews.setInt(R.id.warningTimeFrameTextView, "setTextColor", textColor);

                // if there is only one warning, set the warning 'title' to the first warning
                if (amountOfWarningsToShow == 1) {
                    String warningTitle = context.getString(WarningsTextMapper.getStringResourceId(type));
                    widgetRemoteViews.setTextViewText(R.id.warningTextView, warningTitle);
                    widgetRemoteViews.setTextViewText(R.id.warningTimeFrameTextView, getFormattedWarningTimeFrame(startTime, endTime));
                    // Show also the time fame
                    widgetRemoteViews.setViewVisibility(R.id.warningTimeFrameTextView, VISIBLE);
                    widgetRemoteViews.setTextViewText(R.id.warningTimeFrameTextView, getFormattedWarningTimeFrame(startTime, endTime));
                }
            }

            // if there is more than one warning, set the warning text to "Warnings (amount)" and do show time frame
            if (amountOfWarningsToShow > 1) {
                String warningsText = context.getResources().getString(R.string.warnings) + " (" + amountOfWarnings + ")";
                widgetRemoteViews.setTextViewText(R.id.warningTextView, warningsText);
            }

            // if there are no warnings, show "No warnings"
            if (amountOfWarningsToShow == 0) {
                String warningsText = context.getResources().getString(R.string.no_warnings);
                widgetRemoteViews.setTextViewText(R.id.warningTextView, warningsText);
            }

            // Crisis view
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref);

            // Update time TODO: should be hidden for release
            widgetRemoteViews.setTextViewText(R.id.updateTimeTextView, DateFormat.getTimeInstance().format(new Date()));

            appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);

        } catch (Exception e) {
            Log.e("Warnings Widget Update", "In base warnings setWidgetUi exception: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    context.getResources().getString(R.string.check_internet_connection),
                    widgetId
            );
        }
    }

    private boolean startsTodayLater(Date startDate) {
        // check if the start time is today and in the future
        return isToday(startDate.getTime()) && startDate.after(new Date());
    }

    private boolean isNowValid(Date startDate, Date endDate) {
        Date now = new Date();
        return now.after(startDate) && now.before(endDate);
    }

    private void resetWidgetUi(RemoteViews widgetRemoteViews) {
        for (int i = 0; i < 3; i++) {
            int warningIconLayoutId = context.getResources().getIdentifier("warningIconLayout" + i, "id", context.getPackageName());
            widgetRemoteViews.setViewVisibility(warningIconLayoutId, GONE);
        }
        widgetRemoteViews.setViewVisibility(R.id.warningTimeFrameTextView, GONE);
    }

    protected String getFormattedWarningTimeFrame(String startTime, String endTime) throws ParseException {
        // Define the input formatter
        SimpleDateFormat inputFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
        // Parse the time strings to Date
        Date startDate = inputFormatter.parse(startTime);
        Date endDate = inputFormatter.parse(endTime);

        // Define the output formatter
        SimpleDateFormat outputFormatter = new SimpleDateFormat("HH:mm", Locale.getDefault());
        SimpleDateFormat outputFormatterWithDate = new SimpleDateFormat("dd.MM. HH:mm", Locale.getDefault());

        // if start date is not today, add the date to the output
        if (startDate != null && !isToday(startDate.getTime())) {
            return outputFormatterWithDate.format(startDate) + " - " + outputFormatter.format(endDate);
        } else {
            return outputFormatter.format(startDate) + " - " + outputFormatter.format(endDate);
        }
    }
}
