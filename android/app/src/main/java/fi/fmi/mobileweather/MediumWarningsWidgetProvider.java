package fi.fmi.mobileweather;

import static android.text.format.DateUtils.isToday;
import static android.view.View.VISIBLE;

import static fi.fmi.mobileweather.model.PrefKey.WIDGET_UI_UPDATED;

import android.annotation.SuppressLint;
import android.util.Log;
import android.widget.RemoteViews;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.json.JSONObject;

import java.lang.reflect.Type;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import fi.fmi.mobileweather.enumeration.WidgetType;
import fi.fmi.mobileweather.model.WidgetData;
import fi.fmi.mobileweather.model.Warning;
import fi.fmi.mobileweather.model.LocationRecord;
import fi.fmi.mobileweather.model.WarningsRecordRoot;
import fi.fmi.mobileweather.util.SharedPreferencesHelper;
import fi.fmi.mobileweather.util.WarningsIconMapper;
import fi.fmi.mobileweather.util.WarningsTextMapper;

public class MediumWarningsWidgetProvider extends BaseWarningsWidgetProvider {
    @Override
    protected WidgetType getWidgetType() {
        return WidgetType.WARNINGS;
    }

    @Override
    protected int getLayoutResourceId() {
        return R.layout.medium_warnings_widget_layout;
    }

    @Override
    @SuppressLint("NewApi")
    protected void setWidgetUi(WidgetData widgetData, SharedPreferencesHelper pref, WidgetInitResult widgetInitResult, int widgetId) {
        final int MAX_NUMBER_OF_WARNINGS = 3;

        Log.d("setWidgetUi", "called for widget: "+widgetId);

        RemoteViews widgetRemoteViews = widgetInitResult.widgetRemoteViews();
        JSONObject warningsJsonObj = widgetData.warnings();

        LocalTime currentTime = LocalTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        var updatedText = context.getResources().getString(R.string.updated) + " "+ currentTime.format(formatter);

        if (warningsJsonObj == null || widgetData.location() == null) {
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

            widgetRemoteViews.setTextViewText(R.id.locationNameTextView, location.name()+", ");
            widgetRemoteViews.setTextViewText(R.id.locationRegionTextView, location.region());

            WarningsRecordRoot warningsRecordRoot = gson.fromJson(warningsJsonObj.toString(), WarningsRecordRoot.class);

            Log.d("Warnings Widget Update", "WarningsJson: " + warningsJsonObj);
            Log.d("Warnings Widget Update", "WarningsRecordRoot: " + warningsRecordRoot);

            var warnings = warningsRecordRoot.data().warnings();
            try {
                warnings = filterByValidity(warnings);
            } catch (ParseException e) {
                Log.e("setWidgetUI", "Exception: "+e.getMessage());
            }
            Collections.sort(warnings);

            warnings = filterUnique(warnings);

            widgetRemoteViews.removeAllViews(R.id.warningRowContainer);

            // show a maximum of 6 warnings
            int amountOfWarnings = warnings.size();
            int amountOfWarningsToShow = Math.min(amountOfWarnings, MAX_NUMBER_OF_WARNINGS);

            for (int i = 0; i < amountOfWarningsToShow; i++) {
                RemoteViews warningRow = new RemoteViews(context.getPackageName(), R.layout.warning_row);
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

                warningRow.addView(R.id.warningIconContainer, warningIcon);
                String warningTitle = context.getString(WarningsTextMapper.getStringResourceId(type));
                warningRow.setTextViewText(R.id.warningTitle, warningTitle);
                warningRow.setTextViewText(R.id.warningDuration, getFormattedWarningTimeFrame(startTime, endTime));

                widgetRemoteViews.addView(R.id.warningRowContainer, warningRow);
            }

            widgetRemoteViews.setTextViewText(R.id.updateTime, updatedText);

            if (amountOfWarnings > MAX_NUMBER_OF_WARNINGS) {
                String moreWarnings = context.getResources().getString(R.string.more_warnings)+" ("+(amountOfWarnings-MAX_NUMBER_OF_WARNINGS)+")";
                RemoteViews moreWarningsTextView = new RemoteViews(context.getPackageName(), R.layout.more_warnings);
                moreWarningsTextView.setTextViewText(R.id.moreWarnings, moreWarnings);
                widgetRemoteViews.addView(R.id.warningRowContainer, moreWarningsTextView);
            }

            // if there are no warnings, show "No warnings"
            if (amountOfWarningsToShow == 0) {
                RemoteViews noWarningsTextView = new RemoteViews(context.getPackageName(), R.layout.no_warnings);
                widgetRemoteViews.addView(R.id.warningRowContainer, noWarningsTextView);
            }

            // Crisis view
            showCrisisViewIfNeeded(widgetData.announcements(), widgetRemoteViews, pref, false, false);
            appWidgetManager.updateAppWidget(widgetId, widgetRemoteViews);
            pref.saveLong(WIDGET_UI_UPDATED, System.currentTimeMillis());
        } catch (Exception e) {
            Log.e("setWidgetUi", "In medium warnings setWidgetUi exception: " + e.getMessage());
            showErrorView(
                    context,
                    pref,
                    context.getResources().getString(R.string.update_failed),
                    getConnectionErrorDescription(),
                    widgetId
            );
        }
    }

    @Override
    protected String getFormattedWarningTimeFrame(String startTime, String endTime) throws ParseException {
        SimpleDateFormat inputFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
        inputFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        Date startDate = inputFormatter.parse(startTime);
        Date endDate = inputFormatter.parse(endTime);

        SimpleDateFormat outputFormatterWithDate = new SimpleDateFormat("dd.MM. HH:mm", Locale.getDefault());
        outputFormatterWithDate.setTimeZone(TimeZone.getTimeZone("Europe/Helsinki"));

        return outputFormatterWithDate.format(startDate) + " - " + outputFormatterWithDate.format(endDate);
    }
}
