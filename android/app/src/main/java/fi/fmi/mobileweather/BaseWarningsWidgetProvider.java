package fi.fmi.mobileweather;

import static android.text.format.DateUtils.isToday;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;

import static fi.fmi.mobileweather.model.PrefKey.FAVORITE_LATLON;
import static fi.fmi.mobileweather.model.PrefKey.WIDGET_UI_UPDATED;

import fi.fmi.mobileweather.util.SharedPreferencesHelper;

import android.annotation.SuppressLint;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

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
import fi.fmi.mobileweather.model.WidgetData;
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
        Future<JSONObject> warningsFuture = executorService.submit(() -> fetchWarnings(latlon, language));
        // get announcements
        Future<JSONArray> announcementsFuture = executorService.submit(() -> fetchJsonArray(announceUrl));
        // get location name and region
        Future<String> locationFuture = executorService.submit(() -> fetchLocationData(latlon));

        executorService.submit(() -> {
            JSONArray announcementsResult = null;
            // Announcements failure is not critical
            try { announcementsResult = announcementsFuture.get(); } catch(Exception e) {}
            try {
                JSONObject warningsResult = warningsFuture.get();
                String locationResult = locationFuture.get();
                var widgetData = new WidgetData(announcementsResult, null, warningsResult, locationResult);
                onDataFetchingPostExecute(widgetData, null, pref, widgetId);
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

    protected JSONObject fetchWarnings(String latlon, String language) {

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
    protected void setWidgetUi(WidgetData widgetData, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId) {

        Log.d("Warnings Widget Update", "setWidgetUi called");

        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject warningsJsonObj = widgetData.warnings();

        if (warningsJsonObj == null) {
            return;
        }

        try {
            Gson gson = new Gson();

            Type locationListType = new TypeToken<List<LocationRecord>>() {}.getType();
            List<LocationRecord> locations = gson.fromJson(widgetData.location(), locationListType);
            LocationRecord location = locations.get(0);

            if (!location.iso2().equals("FI")) {
                showErrorView(
                        context,
                        pref,
                        context.getResources().getString(R.string.location_outside_data_area_title),
                        context.getResources().getString(R.string.location_outside_data_area_description),
                        widgetId
                );
                return;
            }

            WarningsRecordRoot warningsRecordRoot = gson.fromJson(warningsJsonObj.toString(), WarningsRecordRoot.class);

            Log.d("Warnings Widget Update", "WarningsJson: " + warningsJsonObj);
            Log.d("Warnings Widget Update", "WarningsRecordRoot: " + warningsRecordRoot);

            // filter the warnings that only the ones remain if now is between the start and end date
            // (perhaps npt this: or if the warning starts today later)
            var warnings = warningsRecordRoot.data().warnings();
            warnings = filterByValidity(warnings);
            Collections.sort(warnings);

            warnings = filterUnique(warnings);

            // reset the warning icon layouts to GONE first
            resetWidgetUi(widgetRemoteViews);

            // Set the location name and region
            widgetRemoteViews.setTextViewText(R.id.locationNameTextView, location.name());
            widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, location.region());
            widgetRemoteViews.removeAllViews(R.id.warningIconContainer);

            // show a maximum of 2 warnings
            int amountOfWarnings = warnings.size();
            int amountOfWarningsToShow = Math.min(amountOfWarnings, 2);

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

                if (type.equals("seaWind") || type.equals("wind")) {
                    int windIntensity = warning.physical().windIntensity();
                    int windDirection = warning.physical().windDirection();

                    warningIcon.setImageViewResource(R.id.warningIconImageView, R.drawable.sea_wind);
                    // rotate the sea wind image view based on the wind direction number
                    warningIcon.setFloat(R.id.warningIconImageView, "setRotation", windDirection - 180);
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
                widgetRemoteViews.setTextViewText(R.id.warningTextView, "");
                RemoteViews customTextView = new RemoteViews(context.getPackageName(), R.layout.custom_text_layout);
                customTextView.setTextViewText(R.id.customTextView, context.getResources().getString(R.string.no_warnings));
                widgetRemoteViews.addView(R.id.warningIconContainer, customTextView);
            }

            // Crisis view
            showCrisisViewIfNeeded(widgetData.announcements(), widgetRemoteViews, pref, false, true);
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

    protected boolean isValidDate(Warning warning) {
        TimeZone timeZone = TimeZone.getTimeZone("Europe/Helsinki");
        TimeZone utc = TimeZone.getTimeZone("UTC");
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
        dateFormatter.setTimeZone(utc);
        String startTime = warning.duration().startTime();
        Date startDate;

        try {
            startDate = dateFormatter.parse(startTime);
        } catch (Exception e) {
            return false;
        }

        if (startDate != null) {
            Calendar warningStart = Calendar.getInstance();
            warningStart.setTimeZone(timeZone);
            warningStart.setTime(startDate);

            Calendar startOfDay = Calendar.getInstance();
            startOfDay.setTimeZone(timeZone);
            startOfDay.set(Calendar.HOUR_OF_DAY, 0);
            startOfDay.set(Calendar.MINUTE, 0);
            startOfDay.set(Calendar.SECOND, 0);
            startOfDay.set(Calendar.MILLISECOND, 0);

            Calendar endOfDay = Calendar.getInstance();
            endOfDay.setTimeZone(timeZone);
            endOfDay.set(Calendar.HOUR_OF_DAY, 23);
            endOfDay.set(Calendar.MINUTE, 59);
            endOfDay.set(Calendar.SECOND, 59);
            endOfDay.set(Calendar.MILLISECOND, 999);

            return warningStart.after(startOfDay) && warningStart.before(endOfDay);
        }

        return false;
    }

    @SuppressLint("NewApi")
    protected List<Warning> filterByValidity(List<Warning> warnings) throws ParseException {
        var items = warnings.stream().filter(warning -> Objects.equals(warning.language(), "fi")).collect(Collectors.toList());
        items = items.stream().filter(this::isValidDate).collect(Collectors.toList());
        return items;
    }

    @SuppressLint("NewApi")
    protected List<Warning> filterUnique(List<Warning> warnings) {
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
    @Override
    protected void onDataFetchingPostExecute(WidgetData data, RemoteViews remoteViews, SharedPreferencesHelper pref, int widgetId) {
        // Init widget, mainly layout initialization
        WidgetInitResult widgetInitResult = initWidget(remoteViews, pref, widgetId);

        var warnings = useNewOrStoredJsonObject(data != null ? data.warnings() : null, pref, widgetId);
        if (warnings == null) {
            Log.d("onDataFetchingPostExecute", "No warning data available");
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.failed_to_load_alerts),
                    getConnectionErrorDescription(),
                    widgetId
            );
            return;
        }

        var announcements = useNewOrStoredCrisisJsonObject(data != null ? data.announcements() : null, pref);

        setWidgetUi(
            new WidgetData(announcements, null, warnings, data != null ? data.location() : null),
            pref, widgetInitResult, widgetId
        );
    }
}
