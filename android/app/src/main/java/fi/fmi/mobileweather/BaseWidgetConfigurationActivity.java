package fi.fmi.mobileweather;

import static android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE;
import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import static android.appwidget.AppWidgetManager.INVALID_APPWIDGET_ID;
import static android.content.res.Configuration.UI_MODE_NIGHT_MASK;
import static android.content.res.Configuration.UI_MODE_NIGHT_NO;
import static android.view.View.GONE;
import static android.view.View.VISIBLE;

import static fi.fmi.mobileweather.model.LocationConstants.CURRENT_LOCATION;
import static fi.fmi.mobileweather.model.PrefKey.FAVORITE_LATLON;
import static fi.fmi.mobileweather.model.PrefKey.SELECTED_LOCATION;
import static fi.fmi.mobileweather.model.PrefKey.GRADIENT_BACKGROUND;

import fi.fmi.mobileweather.util.SharedPreferencesHelper;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.LayoutInflater;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;
import android.widget.TextView;
import android.content.pm.PackageManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class BaseWidgetConfigurationActivity extends Activity {

    protected abstract Class<?> getWidgetProviderClass();

    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private RadioGroup locationRadioGroup;

    protected int getLayoutResourceId() {
        return R.layout.base_widget_configure;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(getLayoutResourceId());
        setResult(RESULT_CANCELED);

        // Get the widget ID from the intent
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            appWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        // If this activity was started with an invalid appWidgetId, finish with an error
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        initViews();
    }

    @Override
    public void onResume(){
        super.onResume();

        setLocationFavoritesButtons();
    }

    public void initViews() {
        setReadyButton();

        // Add app location favorites to location radio button group
        setLocationFavoritesButtons();
        setAddFavoriteLocationsClickListener();

        int currentNightMode = getResources().getConfiguration().uiMode & UI_MODE_NIGHT_MASK;
        LinearLayout themeOptions = findViewById(R.id.themeOptionsContainer);
        if (currentNightMode == UI_MODE_NIGHT_NO) {
            // Hide gradient background option
            themeOptions.setVisibility(GONE);
        } else {
            themeOptions.setVisibility(VISIBLE);
        }
    }

    private void setLocationFavoritesButtons() {
        locationRadioGroup = findViewById(R.id.locationRadioGroup);

        SQLiteDatabase readableDatabase;
        readableDatabase = ReactDatabaseSupplier.getInstance(this.getApplicationContext()).getReadableDatabase();

        if (readableDatabase != null) {
            String impl = AsyncLocalStorageUtil.getItemImpl(readableDatabase, "persist:location");

            if (impl != null) {
                try {
                    JSONObject dump = new JSONObject(impl);
                    JSONArray favorites = new JSONArray(dump.getString("favorites"));

                    Log.d("Widget Update", "Favorites: " + favorites);

                    TextView addFavoriteLocationsExplanationTextView = findViewById(R.id.addFavoriteLocationsExplanationTextView);
                    Button addFavoriteLocationsButton = findViewById(R.id.addFavoriteLocationsButton);

                    // if there are no favorite locations in the app yet
                    if (favorites.length() == 0) {
                        // show explanation text
                        addFavoriteLocationsExplanationTextView.setVisibility(VISIBLE);
                        // set the button text to add favorite locations in app
                        addFavoriteLocationsButton.setText(R.string.add_your_favorite_locations);
                    }
                    else {
                        // hide explanation text
                        addFavoriteLocationsExplanationTextView.setVisibility(GONE);
                        // set the button text to add more favorite locations in app
                        addFavoriteLocationsButton.setText(R.string.add_more_favorite_locations);
                    }

                    // add a radio button for each favorite location
                    LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                    for (int i = 0; i < favorites.length(); i++) {
                        JSONObject current = favorites.getJSONObject(i);
                        int geoId = current.getInt("id");
                        String name = current.getString("name");

                        String latlon = getLatLonString(current);

                        RadioButton existingRadioButton = findViewById(geoId);

                        if (existingRadioButton == null) {
                            RadioButton favoriteRadioButton = (RadioButton) inflater.inflate(R.layout.favorite_radio_button, locationRadioGroup, false);
                            favoriteRadioButton.setText(name);
                            favoriteRadioButton.setTag(latlon);
                            favoriteRadioButton.setId(geoId);
                            locationRadioGroup.addView(favoriteRadioButton);
                        }
                    }
                } catch (JSONException e) {
                    Log.d("Widget Update", "Error parsing location favorites: " + e.getMessage());
                }
            }
        }
    }

    @NonNull
    private static String getLatLonString(JSONObject current) throws JSONException {
        double latitude = current.getDouble("lat");
        double longitude = current.getDouble("lon");
        // Round to 4 decimals
        latitude = (double)Math.round(latitude * 10000d) / 10000d;
        longitude = (double)Math.round(longitude * 10000d) / 10000d;
        String latlon = latitude + "," + longitude;
        return latlon;
    }

    private void setAppSettingsButton() {
        /*
        Button appSettingsButton = (Button) findViewById(R.id.appSettingsButton);
        appSettingsButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                openAppDetailsSettings();
            }
        });
        */
    }

    private void setReadyButton() {
        Button okButton = findViewById(R.id.okButton);
        okButton.setOnClickListener(v -> showAppWidget());
    }

    private void setAddFavoriteLocationsClickListener() {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("fmiweather://search"));
        Button addFavoriteLocationsButton = findViewById(R.id.addFavoriteLocationsButton);
        // on click send the intent to open the app main activity
        addFavoriteLocationsButton.setOnClickListener(v -> startActivity(intent));
    }

    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions, @NonNull int[] grantResults) {

        // if generic or background location permissions were requested
        if (requestCode == 1 || requestCode == 2) {
            // If location permission granted (if request is cancelled, the result arrays are empty)
            if (grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // finalize the widget with the current location
                finalizeWidget(CURRENT_LOCATION, null);
            } else { // Permission denied
                Toast.makeText(BaseWidgetConfigurationActivity.this, getString(R.string.denied_positioning),
                        Toast.LENGTH_SHORT).show();
            }
        }
    }

    int widgetId;

    protected void showAppWidget() {

        widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {

            widgetId = extras.getInt(EXTRA_APPWIDGET_ID,
                    INVALID_APPWIDGET_ID);

            // get selected location (current location or geoId) from checked radio button's ID
            int selectedLocation = locationRadioGroup.getCheckedRadioButtonId();

            if (selectedLocation==R.id.currentLocationRadioButton) {
                Log.d("Widget Update", "Selected location: current");
                // create a dialog to explain the user needs to enable background location
                askLocationPermissionIfNeeded();
            }
            else {
                Log.d("Widget Update", "Selected location: " + selectedLocation);
                RadioButton selectedRadioButton = findViewById(selectedLocation);
                String latlon = (String) selectedRadioButton.getTag();
                Log.d("Widget Update", "Selected latlon: " + latlon);
                // finalize the widget with the selected location (geoId)
                finalizeWidget(selectedLocation, latlon);
            }
        }
        if (widgetId == INVALID_APPWIDGET_ID) {
            Log.i("Widget Update", "Invalid appwidget id");
            finish();
        }
    }

    private void finalizeWidget(int selectedLocation, String latlon) {
        // Save settings

        Context context = getBaseContext();

        SharedPreferencesHelper pref = SharedPreferencesHelper.getInstance(context, appWidgetId);
        Log.d("Widget Update","pref for this appWidgetId: " + appWidgetId);

        pref.saveInt(SELECTED_LOCATION, selectedLocation);
        if (latlon != null)
            pref.saveString(FAVORITE_LATLON, latlon);

        CheckBox gradientBackgroundCheckbox= findViewById(R.id.gradientBackgroundCheckbox);
        boolean gradientBackgroundEnabled = gradientBackgroundCheckbox.isChecked();
        pref.saveInt(GRADIENT_BACKGROUND, gradientBackgroundEnabled ? 1 : 0);

        // Send a broadcast to trigger onUpdate()
        int[] appWidgetIds = getIntent().getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS);
        // we need the actual widget provider class here
        Intent updateIntent = new Intent(ACTION_APPWIDGET_UPDATE).setClass(context, getWidgetProviderClass());
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
        sendBroadcast(updateIntent);

        // Make sure we pass back the original appWidgetId
        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }

    public void askLocationPermissionIfNeeded() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
                || ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            showGenericLocationPermissionDialog();
        } else if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            showBackgroundLocationPermissionDialog();
        } else {
            finalizeWidget(CURRENT_LOCATION, null);
        }
    }

    private void showBackgroundLocationPermissionDialog() {
        new AlertDialog.Builder(this)
                .setMessage(R.string.allow_background_location_service)
                .setPositiveButton(android.R.string.ok, (dialog, whichButton) -> requestBackgroundLocationPermission())
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void requestGenericLocationPermissions() {
        ActivityCompat.requestPermissions(BaseWidgetConfigurationActivity.this,
                new String[]{
                        Manifest.permission.ACCESS_COARSE_LOCATION,
                        Manifest.permission.ACCESS_FINE_LOCATION
                },
                1);
    }

    private void requestBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.requestPermissions(BaseWidgetConfigurationActivity.this,
                    new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                    2);
        } else {
            // open app settings for user to enable background location
            openAppDetailsSettings();
        }
    }

    private void openAppDetailsSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", getPackageName(), null);
        intent.setData(uri);
        startActivity(intent);
    }

    private void showGenericLocationPermissionDialog() {
        //                    @RequiresApi(api = Build.VERSION_CODES.Q)
        new AlertDialog.Builder(this)
                .setMessage(R.string.allow_background_location_service)
                .setPositiveButton(android.R.string.ok, (dialog, whichButton) -> requestGenericLocationPermissions())
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Release resources and unregister listeners or receivers here
        if (locationRadioGroup != null) {
            locationRadioGroup.removeAllViews();
            locationRadioGroup = null;
        }
    }
}
