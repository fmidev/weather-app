package fi.fmi.mobileweather;

import static android.text.format.DateUtils.isToday;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;

import static fi.fmi.mobileweather.model.PrefKey.FAVORITE_LATLON;
import static fi.fmi.mobileweather.model.PrefKey.WIDGET_UI_UPDATED;

import android.annotation.SuppressLint;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import fi.fmi.mobileweather.model.LocationRecord;
import fi.fmi.mobileweather.model.Warning;
import fi.fmi.mobileweather.model.WarningsRecordRoot;
import fi.fmi.mobileweather.util.AirplaneModeUtil;
import fi.fmi.mobileweather.util.WarningsIconMapper;
import fi.fmi.mobileweather.util.WarningsTextMapper;

public abstract class BaseWarningsWidgetProvider extends BaseWidgetProvider {

    @Override
    protected void executeDataFetchingWithSelectedLocation(int geoId, SharedPreferencesHelper pref, int widgetId) {
        String latlon = pref.getString(FAVORITE_LATLON, null);
        executeDataFetchingWithLatLon(latlon, pref, widgetId);
    }

    @Override
    protected String getConnectionErrorDescription() {
        return AirplaneModeUtil.isAirplaneModeOn(context) ?
                context.getResources().getString(R.string.airplane_mode_warnings) :
                context.getResources().getString(R.string.automatic_retry_warnings);
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
        Future<JSONObject> warningsFuture = executorService.submit(() -> fetchMainData(latlon, language));
        // get announcements
        Future<JSONArray> announcementsFuture = executorService.submit(() -> fetchJsonArray(announceUrl));
        // get location name and region
        Future<String> locationFuture = executorService.submit(() -> fetchLocationData(latlon));

        executorService.submit(() -> {
            JSONArray announcementsResult = null;
            // Announcements failure is not critical
            try { announcementsResult = announcementsFuture.get(); } catch(Exception e) {}
            try {
                JSONObject warningsresult = warningsFuture.get();
                String locationResult = locationFuture.get();
                onDataFetchingPostExecute(warningsresult, announcementsResult, locationResult, null, pref, widgetId);
            } catch (Exception e) {
                Log.e("Warnings Widget Update", "Exception: " + e.getMessage());
                showErrorView(
                        context,
                        pref,
                        context.getResources().getString(R.string.failed_to_load_alerts),
                        getConnectionErrorDescription(),
                        widgetId
                );
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
            Log.d("Warnings Widget Update", "Original size: " + warningsRecordRoot.data().warnings().size());

            // filter the warnings that only the ones remain if now is between the start and end date
            // (perhaps npt this: or if the warning starts today later)
            var warnings = warningsRecordRoot.data().warnings();
            warnings = filterByValidity(warnings);
            Collections.sort(warnings);

            Log.d("Warnings Widget Update", "After size: " + warnings.size());

            warnings = filterUnique(warnings);

            // reset the warning icon layouts to GONE first
            resetWidgetUi(widgetRemoteViews);

            // Set the location name and region
            widgetRemoteViews.setTextViewText(R.id.locationNameTextView, location.name());
            widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, location.region());
            widgetRemoteViews.removeAllViews(R.id.warningIconContainer);

            // show a maximum of 6 warnings
            int amountOfWarnings = warnings.size();
            Log.d("Warnings Widget Update", "Amount of warnings: " + amountOfWarnings);
            int amountOfWarningsToShow = Math.min(amountOfWarnings, 6);
            Log.d("Warnings Widget Update", "Amount of warnings to show: " + amountOfWarningsToShow);
            for (int i = 0; i < amountOfWarningsToShow; i++) {
                RemoteViews warningIcon = new RemoteViews(context.getPackageName(), R.layout.warning_icon);
                Warning warning = warnings.get(i);
                String type = warning.type();
                String severity = warning.severity();
                String startTime = warning.duration().startTime();
                String endTime = warning.duration().endTime();

                int circleBackgroundResourceId = WarningsIconMapper.getCircleBackgroundResourceId(severity);
                if (circleBackgroundResourceId != 0) {
                    warningIcon.setInt(R.id.warningIconBackgroundImageView, "setBackgroundResource", circleBackgroundResourceId);
                }

                if (type.equals("seaWind")) {
                    int windIntensity = warning.physical().windIntensity();
                    int windDirection = warning.physical().windDirection();

                    warningIcon.setImageViewResource(R.id.warningIconImageView, R.drawable.sea_wind);
                    // rotate the sea wind image view based on the wind direction number
                    warningIcon.setFloat(R.id.warningIconImageView, "setRotation", windDirection);
                    // add the wind intensity text in front of the image view
                    warningIcon.setViewVisibility(R.id.windIntensityTextView, VISIBLE);
                    warningIcon.setTextViewText(R.id.windIntensityTextView, Integer.toString(windIntensity));
                } else {
                    int iconResourceId = WarningsIconMapper.getIconResourceId(type);
                    Log.d("Warnings Widget Update", "IconResourceId: " + iconResourceId);
                    if (iconResourceId != 0) {
                        warningIcon.setImageViewResource(R.id.warningIconImageView, iconResourceId);
                    }
                }

                widgetRemoteViews.addView(R.id.warningIconContainer, warningIcon);

                // if there is only one warning, set the warning 'title' to the first warning
                if (amountOfWarningsToShow == 1) {
                    String warningTitle = context.getString(WarningsTextMapper.getStringResourceId(type));
                    widgetRemoteViews.setTextViewText(R.id.warningTextView, warningTitle);
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
            showCrisisViewIfNeeded(announcementsJson, widgetRemoteViews, pref, false, true);
            appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
            pref.saveLong(WIDGET_UI_UPDATED, System.currentTimeMillis());
        } catch (Exception e) {
            Log.e("Warnings Widget Update", "In base warnings setWidgetUi exception: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    widgetId
            );
        }
    }

    private boolean isValidDate(Warning warning) {
        Date now = new Date();
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
        String startTime = warning.duration().startTime();
        String endTime = warning.duration().endTime();
        Date startDate;
        Date endDate;

        try {
            startDate = dateFormatter.parse(startTime);
            endDate = dateFormatter.parse(endTime);
        } catch (Exception e) {
            return false;
        }

        if (startDate != null && endDate != null) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(startDate);
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            Date startOfDay = calendar.getTime();

            calendar.setTime(endDate);
            calendar.set(Calendar.HOUR_OF_DAY, 23);
            calendar.set(Calendar.MINUTE, 59);
            calendar.set(Calendar.SECOND, 59);
            calendar.set(Calendar.MILLISECOND, 999);
            Date endOfDay = calendar.getTime();

            if (now.after(startOfDay) && now.before(endOfDay)) {
                return true;
            }
        }

        return false;
    }

    @SuppressLint("NewApi")
    private List<Warning> filterByValidity(List<Warning> warnings) throws ParseException {
        var items = warnings.stream().filter(warning -> Objects.equals(warning.language(), "fi")).collect(Collectors.toList());
        items = items.stream().filter(this::isValidDate).collect(Collectors.toList());
        return items;
    }

    @SuppressLint("NewApi")
    private List<Warning> filterUnique(List<Warning> warnings) {
        List<Warning> processed = new ArrayList<>();
        Iterator<Warning> iterator = warnings.iterator();
        while (iterator.hasNext()) {
            Warning current = iterator.next();
            boolean contains = processed.stream().anyMatch(item ->
                Objects.equals(item.type(), current.type()) && Objects.equals(item.severity(), current.severity())
            );
            if (!contains) {
                processed.add(current);
            }
        }

        return processed;
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
        inputFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        // Parse the time strings to Date
        Date startDate = inputFormatter.parse(startTime);
        Date endDate = inputFormatter.parse(endTime);

        // Define the output formatter
        SimpleDateFormat outputFormatter = new SimpleDateFormat("HH:mm", Locale.getDefault());
        outputFormatter.setTimeZone(TimeZone.getTimeZone("Europe/Helsinki"));
        SimpleDateFormat outputFormatterWithDate = new SimpleDateFormat("dd.MM. HH:mm", Locale.getDefault());
        outputFormatterWithDate.setTimeZone(TimeZone.getTimeZone("Europe/Helsinki"));

        if (startDate != null && !isToday(endDate.getTime())) {
            return outputFormatterWithDate.format(startDate) + " - " + outputFormatterWithDate.format(endDate);
        } else {
            return outputFormatter.format(startDate) + " - " + outputFormatter.format(endDate);
        }
    }
}
