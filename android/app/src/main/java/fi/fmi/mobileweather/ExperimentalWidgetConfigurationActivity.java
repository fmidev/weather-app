package fi.fmi.mobileweather; // Package declaration

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID; // Import static field for app widget ID
import static android.appwidget.AppWidgetManager.INVALID_APPWIDGET_ID; // Import static field for invalid app widget ID
import android.Manifest; // Import for Android permissions
import android.app.Activity; // Import for Android activity
import android.app.AlertDialog; // Import for alert dialog
import android.appwidget.AppWidgetManager; // Import for app widget manager
import android.appwidget.AppWidgetProviderInfo; // Import for app widget provider info
import android.content.Context; // Import for context
import android.content.DialogInterface; // Import for dialog interface
import android.content.Intent; // Import for intent
import android.database.sqlite.SQLiteDatabase; // Import for SQLite database
import android.net.Uri; // Import for URI
import android.os.Build; // Import for build version
import android.os.Bundle; // Import for bundle
import android.os.PowerManager; // Import for power manager
import android.provider.Settings; // Import for settings
import androidx.core.app.JobIntentService; // Import for job intent service
import android.text.Html; // Import for HTML text
import android.text.method.LinkMovementMethod; // Import for link movement method
import android.util.Log; // Import for logging
import android.view.View; // Import for view
import android.view.View.OnClickListener; // Import for view click listener
import android.widget.Button; // Import for button
import android.widget.LinearLayout; // Import for linear layout
import android.widget.RadioButton; // Import for radio button
import android.widget.RadioGroup; // Import for radio group
import android.widget.Toast; // Import for toast
import android.widget.TextView; // Import for text view
import android.content.SharedPreferences; // Import for shared preferences
import android.content.pm.PackageManager; // Import for package manager
import androidx.core.app.ActivityCompat; // Import for activity compatibility

import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil; // Import for async local storage utility
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier; // Import for react database supplier

import org.json.JSONArray; // Import for JSON array
import org.json.JSONException; // Import for JSON exception
import org.json.JSONObject; // Import for JSON object

/**
 * Activity for configuring the Experimental Widget.
 */
public class ExperimentalWidgetConfigurationActivity extends Activity {

    /**
     * Called when the activity is first created.
     * @param savedInstanceState If the activity is being re-initialized after previously being shut down then this Bundle contains the data it most recently supplied in onSaveInstanceState(Bundle).
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); // Call the superclass onCreate method
        setContentView(R.layout.widgetconf); // Set the content view to the widget configuration layout
        setResult(RESULT_CANCELED); // Set the result to canceled

        // Hide elements that are not used in this widget
        TextView tv = (TextView) findViewById(R.id.forecastTitleTextView); // Find the forecast title text view
        tv.setVisibility(View.GONE); // Set the visibility of the forecast title text view to gone
        RadioGroup rg = (RadioGroup) findViewById(R.id.forecastRadioGroup); // Find the forecast radio group
        rg.setVisibility(View.GONE); // Set the visibility of the forecast radio group to gone

        // Initialize list views and ask for location permission
        initListViews(); // Call the method to initialize list views
        askLocationPermission(); // Call the method to ask for location permission
    }

    /**
     * Called when the activity will start interacting with the user.
     */
    @Override
    public void onResume() {
        super.onResume(); // Call the superclass onResume method

        // Android Pie (SDK 28) and later are more restrictive when battery saving is enabled.
        // Therefore ask user to disable battery saving.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) { // Check if the build version is Pie or later
            String packageName = getPackageName(); // Get the package name
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE); // Get the power manager service
            LinearLayout batteryOptimizationWarning = (LinearLayout) findViewById(R.id.batteryOptimizationWarning); // Find the battery optimization warning layout

            if (!pm.isIgnoringBatteryOptimizations(packageName)) { // Check if the app is not ignoring battery optimizations
                batteryOptimizationWarning.setVisibility(View.VISIBLE); // Set the visibility of the battery optimization warning to visible
            } else {
                batteryOptimizationWarning.setVisibility(View.GONE); // Set the visibility of the battery optimization warning to gone
            }
        }
    }

    /**
     * Initialize the list views and set up button click listeners.
     */
    public void initListViews() {
        // Set up OK button click listener
        Button okButton = (Button) findViewById(R.id.okButton); // Find the OK button
        okButton.setOnClickListener(new OnClickListener() { // Set the click listener for the OK button
            @Override
            public void onClick(View v) { // Override the onClick method
                handleOkButton(); // Call the method to handle the OK button click
            }
        });

        // Set up App Settings button click listener
        Button appSettingsButton = (Button) findViewById(R.id.appSettingsButton); // Find the app settings button
        appSettingsButton.setOnClickListener(new OnClickListener() { // Set the click listener for the app settings button
            @Override
            public void onClick(View v) { // Override the onClick method
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS); // Create an intent to open the app settings
                Uri uri = Uri.fromParts("package", getPackageName(), null); // Create a URI with the package name
                intent.setData(uri); // Set the data for the intent
                startActivity(intent); // Start the activity with the intent
            }
        });

        // Add favorites to location options
        SQLiteDatabase readableDatabase = ReactDatabaseSupplier.getInstance(this.getApplicationContext()).getReadableDatabase(); // Get the readable database
        if (readableDatabase != null) { // Check if the readable database is not null
            String impl = AsyncLocalStorageUtil.getItemImpl(readableDatabase, "persist:location"); // Get the item from the database
            if (impl != null) { // Check if the item is not null
                try {
                    RadioGroup locationRadioGroup = (RadioGroup) findViewById(R.id.locationRadioGroup); // Find the location radio group
                    JSONObject dump = new JSONObject(impl); // Create a JSON object from the item
                    JSONArray favorites = new JSONArray(dump.getString("favorites")); // Create a JSON array from the favorites string
                    TextView favoriteinfo = (TextView) findViewById(R.id.favoriteInfoTextView); // Find the favorite info text view

                    if (favorites.length() == 0) // Check if the favorites array is empty
                        favoriteinfo.setVisibility(View.VISIBLE); // Set the visibility of the favorite info text view to visible
                    else
                        favoriteinfo.setVisibility(View.GONE); // Set the visibility of the favorite info text view to gone

                    for (int i = 0; i < favorites.length(); i++) { // Loop through the favorites array
                        JSONObject current = favorites.getJSONObject(i); // Get the current favorite JSON object
                        int geoid = current.getInt("id"); // Get the ID of the current favorite
                        String name = current.getString("name"); // Get the name of the current favorite
                        int padding = this.getResources().getDimensionPixelSize(R.dimen.radiobutton_padding); // Get the padding for the radio button

                        RadioButton favoriteRadioButton = new RadioButton(this); // Create a new radio button
                        favoriteRadioButton.setPadding(0, padding, 0, padding); // Set the padding for the radio button
                        favoriteRadioButton.setText(name); // Set the text for the radio button
                        favoriteRadioButton.setTag(geoid); // Set the tag for the radio button
                        favoriteRadioButton.setId(geoid); // Set the ID for the radio button

                        locationRadioGroup.addView(favoriteRadioButton); // Add the radio button to the location radio group
                    }
                } catch (JSONException e) { // Catch JSON exceptions
                    e.printStackTrace(); // Print the stack trace
                }
            }
        }

        // Request location permissions
        ActivityCompat.requestPermissions(ExperimentalWidgetConfigurationActivity.this,
                new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION},
                1); // Request location permissions
    }

    /**
     * Callback for the result from requesting permissions.
     * @param requestCode The request code passed in requestPermissions(android.app.Activity, String[], int).
     * @param permissions The requested permissions. Never null.
     * @param grantResults The grant results for the corresponding permissions which is either PERMISSION_GRANTED or PERMISSION_DENIED. Never null.
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        RadioGroup locationRadioGroup = (RadioGroup) findViewById(R.id.locationRadioGroup); // Find the location radio group
        RadioButton positionedRadioButton = (RadioButton) findViewById(R.id.optionPositionedRadioButton); // Find the positioned radio button
        LinearLayout view = (LinearLayout) findViewById(R.id.configurationLinearLayout); // Find the configuration linear layout

        switch (requestCode) { // Switch on the request code
            case 1: { // Case for request code 1
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) { // Check if the permission was granted
                    // Permission granted
                    positionedRadioButton.setEnabled(true); // Enable the positioned radio button
                    locationRadioGroup.check(R.id.optionPositionedRadioButton); // Check the positioned radio button

                    Button grantbutton = (Button) findViewById(1); // Find the grant button
                    if (grantbutton != null) // Check if the grant button is not null
                        grantbutton.setVisibility(View.GONE); // Set the visibility of the grant button to gone
                } else {
                    // Permission denied
                    Toast.makeText(ExperimentalWidgetConfigurationActivity.this, getString(R.string.denied_positioning),
                            Toast.LENGTH_SHORT).show(); // Show a toast message

                    // Uncheck positioned radiobutton and disable it
                    locationRadioGroup.clearCheck(); // Clear the check on the location radio group
                    positionedRadioButton.setEnabled(false); // Disable the positioned radio button

                    // Add grant permission for positioning button
                    Button grantButton = (Button) findViewById(1); // Find the grant button
                    if (grantButton == null) { // Check if the grant button is null
                        grantButton = new Button(this); // Create a new button
                        grantButton.setId(1); // Set the ID for the button
                        grantButton.setText(getString(R.string.allow_positioning)); // Set the text for the button
                        grantButton.setOnClickListener(new OnClickListener() { // Set the click listener for the button
                            @Override
                            public void onClick(View v) { // Override the onClick method
                                ActivityCompat.requestPermissions(ExperimentalWidgetConfigurationActivity.this,
                                        new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION},
                                        1); // Request location permissions
                            }
                        });
                        view.addView(grantButton); // Add the button to the view
                    }
                }
                return; // Return from the method
            }
        }
    }

    /**
     * Handle the OK button click event.
     */
    private void handleOkButton() {
        showAppWidget(); // Call the method to show the app widget
    }

    /**
     * The widget ID.
     */
    int widgetId; // Declare the widget ID

    /**
     * Show the app widget and save settings.
     */
    private void showAppWidget() {
        widgetId = AppWidgetManager.INVALID_APPWIDGET_ID; // Set the widget ID to invalid
        Intent intent = getIntent(); // Get the intent
        Bundle extras = intent.getExtras(); // Get the extras from the intent
        if (extras != null) { // Check if the extras are not null
            widgetId = extras.getInt(EXTRA_APPWIDGET_ID, INVALID_APPWIDGET_ID); // Get the widget ID from the extras

            // Save settings
            Context context = getBaseContext(); // Get the base context
            SharedPreferences pref = context.getSharedPreferences("fi.fmi.mobileweather.widget_" + widgetId, Context.MODE_PRIVATE); // Get the shared preferences
            SharedPreferences.Editor editor = pref.edit(); // Get the editor for the shared preferences

            RadioGroup background = (RadioGroup) findViewById(R.id.backgroundRadioGroup); // Find the background radio group
            int selectedBackground = background.getCheckedRadioButtonId(); // Get the selected background radio button ID

            if (selectedBackground == R.id.optionLightRadioButton) // Check if the selected background is light
                editor.putString("background", "light"); // Put the background as light in the editor
            else if (selectedBackground == R.id.optionTransparentRadioButton) // Check if the selected background is transparent
                editor.putString("background", "transparent"); // Put the background as transparent in the editor
            else
                editor.putString("background", "dark"); // Put the background as dark in the editor

            editor.putString("version", "classic"); // Put the version as classic in the editor
            editor.putString("forecast", "hours"); // Put the forecast as hours in the editor

            RadioGroup location = (RadioGroup) findViewById(R.id.locationRadioGroup); // Find the location radio group
            int selectedLocation = location.getCheckedRadioButtonId(); // Get the selected location radio button ID

            if (selectedLocation == -1) { // Check if no location is selected
                editor.clear(); // Clear the editor
                Toast.makeText(ExperimentalWidgetConfigurationActivity.this, getString(R.string.forecast_location_not_defined),
                        Toast.LENGTH_SHORT).show(); // Show a toast message
                return; // Return from the method
            }

            if (selectedLocation == R.id.optionPositionedRadioButton) // Check if the selected location is positioned
                editor.putInt("location", 0); // Put the location as 0 in the editor
            else
                editor.putInt("location", selectedLocation); // Put the selected location in the editor

            editor.commit(); // Commit the editor

            AppWidgetProviderInfo providerInfo = AppWidgetManager.getInstance(context).getAppWidgetInfo(widgetId); // Get the app widget provider info
            String appWidgetLabel = providerInfo.label; // Get the app widget label

            Intent startService = new Intent(ExperimentalWidgetConfigurationActivity.this, UpdateWidgetJobIntentService.class); // Create an intent to start the update widget job intent service
            startService.putExtra(EXTRA_APPWIDGET_ID, widgetId); // Put the widget ID in the intent
            startService.setAction("FROM CONFIGURATION ACTIVITY"); // Set the action for the intent
            Uri data = Uri.withAppendedPath(
                    Uri.parse("fi.fmi.mobileweather.MobileWeatherWidget://widget/id/"), String.valueOf(widgetId)); // Create a URI with the widget ID
            startService.setData(data); // Set the data for the intent
            setResult(RESULT_OK, startService); // Set the result to OK with the intent

            JobIntentService.enqueueWork(context, UpdateWidgetJobIntentService.class, 1, startService); // Enqueue the work for the job intent service

            finish(); // Finish the activity
        }
        if (widgetId == INVALID_APPWIDGET_ID) { // Check if the widget ID is invalid
            Log.i("widgetId", "Invalid appwidget id"); // Log the invalid widget ID
            finish(); // Finish the activity
        }
    }

    /**
     * Ask for location permission.
     */
    public void askLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) { // Check if the build version is Pie or later
            if (ActivityCompat.checkSelfPermission(
                    ExperimentalWidgetConfigurationActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) !=
                    PackageManager.PERMISSION_GRANTED
                    || ActivityCompat.checkSelfPermission(
                    ExperimentalWidgetConfigurationActivity.this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) !=
                    PackageManager.PERMISSION_GRANTED) { // Check if the location permissions are not granted

                new AlertDialog.Builder(this) // Create a new alert dialog builder
                        .setTitle(R.string.location_service_info_title) // Set the title for the alert dialog
                        .setMessage(R.string.location_service_info) // Set the message for the alert dialog
                        .setPositiveButton(R.string.ask_permission, new DialogInterface.OnClickListener() { // Set the positive button for the alert dialog
                            public void onClick(DialogInterface dialog, int whichButton) { // Override the onClick method
                                ActivityCompat.requestPermissions(ExperimentalWidgetConfigurationActivity.this,
                                        new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                                                Manifest.permission.ACCESS_FINE_LOCATION,
                                                Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                                        1); // Request location permissions
                            }
                        })
                        .setNegativeButton(android.R.string.cancel, null).show(); // Set the negative button for the alert dialog and show it
            }
        } else {
            ActivityCompat.requestPermissions(ExperimentalWidgetConfigurationActivity.this,
                    new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                    1); // Request location permissions
        }
    }
}