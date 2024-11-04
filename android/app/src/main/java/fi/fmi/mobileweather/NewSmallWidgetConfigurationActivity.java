package fi.fmi.mobileweather;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import static android.appwidget.AppWidgetManager.INVALID_APPWIDGET_ID;
import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.app.JobIntentService;
import android.text.Html;
import android.text.method.LinkMovementMethod;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;
import android.widget.TextView;
import android.widget.RemoteViews;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;

import com.reactnativecommunity.asyncstorage.AsyncLocalStorageUtil;
import com.reactnativecommunity.asyncstorage.ReactDatabaseSupplier;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class NewSmallWidgetConfigurationActivity extends Activity {
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
	protected void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);
		setContentView(R.layout.new_small_widget_configure);
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

        // Hide elements that are not used in small widget

        TextView tv = (TextView) findViewById(R.id.forecastTitleTextView);
        tv.setVisibility(View.GONE);
        RadioGroup rg = (RadioGroup) findViewById(R.id.forecastRadioGroup);
        rg.setVisibility(View.GONE);

        initListViews();
        askLocationPermission();
	}

    @Override
    public void onResume(){
        super.onResume();

        // Android Pie (SDK 28) and later are more restrictive when battery saving is enabled.
        // Therefore ask user to disable battery saving.

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            String packageName = getPackageName();
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            LinearLayout batteryOptimizationWarning = (LinearLayout) findViewById(R.id.batteryOptimizationWarning);

            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                batteryOptimizationWarning.setVisibility(View.VISIBLE);
            } else {
                batteryOptimizationWarning.setVisibility(View.GONE);
            }
        }
    }

	public void initListViews() {

		Button okButton = (Button) findViewById(R.id.okButton);
		okButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				handleOkButton();
			}
		});

        Button appSettingsButton = (Button) findViewById(R.id.appSettingsButton);
        appSettingsButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                // TODO Auto-generated method stub
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivity(intent);
            }
        });

		// Add favorites to location options

        SQLiteDatabase readableDatabase = null;
        readableDatabase = ReactDatabaseSupplier.getInstance(this.getApplicationContext()).getReadableDatabase();

        if (readableDatabase != null) {
            String impl = AsyncLocalStorageUtil.getItemImpl(readableDatabase, "persist:location");

            if (impl != null) {
                try {
                    RadioGroup locationRadioGroup = (RadioGroup) findViewById(R.id.locationRadioGroup);

                    JSONObject dump = new JSONObject(impl);
                    JSONArray favorites = new JSONArray(dump.getString("favorites"));

                    TextView favoriteinfo = (TextView) findViewById(R.id.favoriteInfoTextView);

                    if (favorites.length()==0)
                        favoriteinfo.setVisibility(View.VISIBLE);
                    else
                        favoriteinfo.setVisibility(View.GONE);

                    for (int i = 0; i < favorites.length(); i++) {
                        JSONObject current = favorites.getJSONObject(i);
                        int geoid = current.getInt("id");
                        String name = current.getString("name");
                        int padding = this.getResources().getDimensionPixelSize(R.dimen.radiobutton_padding);

                        RadioButton favoriteRadioButton = new RadioButton(this);
                        favoriteRadioButton.setPadding(0, padding, 0, padding);
                        favoriteRadioButton.setText(name);
                        favoriteRadioButton.setTag(geoid);
                        favoriteRadioButton.setId(geoid);

                        locationRadioGroup.addView(favoriteRadioButton);

                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        ActivityCompat.requestPermissions(NewSmallWidgetConfigurationActivity.this,
                new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION},
                1);

	}

    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {

        RadioGroup locationRadioGroup = (RadioGroup) findViewById(R.id.locationRadioGroup);
        RadioButton positionedRadioButton = (RadioButton) findViewById(R.id.optionPositionedRadioButton);
        LinearLayout view = (LinearLayout) findViewById(R.id.configurationLinearLayout);

        switch (requestCode) {
            case 1: {

                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {

                    // Permission granted

                    positionedRadioButton.setEnabled(true);
                    locationRadioGroup.check(R.id.optionPositionedRadioButton);

                    Button grantbutton = (Button) findViewById(1);

                    if (grantbutton!=null)
                        grantbutton.setVisibility(View.GONE);

                } else {

                    // Permission denied

                    Toast.makeText(NewSmallWidgetConfigurationActivity.this, getString(R.string.denied_positioning),
                            Toast.LENGTH_SHORT).show();

                    // Uncheck positioned radiobutton and disable it

                    locationRadioGroup.clearCheck();
                    positionedRadioButton.setEnabled(false);

                    // Add grant permission for positioning button

                    Button grantButton = (Button) findViewById(1);

                    if (grantButton==null) {

                        grantButton = new Button(this);
                        grantButton.setId(1);
                        grantButton.setText(getString(R.string.allow_positioning));
                        grantButton.setOnClickListener(new OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                ActivityCompat.requestPermissions(NewSmallWidgetConfigurationActivity.this,
                                        new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                                                Manifest.permission.ACCESS_FINE_LOCATION,
                                                Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                                        1);
                            }
                        });
                        view.addView(grantButton);
                    }

                }
                return;
            }
        }
    }

	private void handleOkButton() {
		showAppWidget();
	}

	int widgetId;

	private void showAppWidget() {

		widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
		Intent intent = getIntent();
		Bundle extras = intent.getExtras();
		if (extras != null) {
			widgetId = extras.getInt(EXTRA_APPWIDGET_ID,
					INVALID_APPWIDGET_ID);

            // Save settings

            Context context = getBaseContext();

            SharedPreferences pref = context.getSharedPreferences("fi.fmi.mobileweather.widget_"+widgetId, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = pref.edit();

            RadioGroup background = (RadioGroup)findViewById(R.id.backgroundRadioGroup);
            int selectedBackground = background.getCheckedRadioButtonId();

            if (selectedBackground==R.id.optionLightRadioButton)
                editor.putString("background", "light");
            else if (selectedBackground==R.id.optionTransparentRadioButton)
                editor.putString("background", "transparent");
            else
                editor.putString("background", "dark");

            editor.putString("version", "classic");
            editor.putString("forecast", "hours");

            RadioGroup location = (RadioGroup)findViewById(R.id.locationRadioGroup);
            int selectedLocation = location.getCheckedRadioButtonId();

            if (selectedLocation==-1) {
                editor.clear();
                Toast.makeText(NewSmallWidgetConfigurationActivity.this, getString(R.string.forecast_location_not_defined),
                        Toast.LENGTH_SHORT).show();
                return;
            }

            if (selectedLocation==R.id.optionPositionedRadioButton)
                editor.putInt("location", 0);
            else
                editor.putInt("location", selectedLocation);

            editor.commit();

			/*AppWidgetProviderInfo providerInfo = AppWidgetManager.getInstance(context).getAppWidgetInfo(widgetId);
			String appWidgetLabel = providerInfo.label;

			Intent startService = new Intent(NewSmallWidgetConfigurationActivity.this, UpdateWidgetJobIntentService.class);
			startService.putExtra(EXTRA_APPWIDGET_ID, widgetId);
			startService.setAction("FROM CONFIGURATION ACTIVITY");
            Uri data = Uri.withAppendedPath(
                    Uri.parse("fi.fmi.mobileweather.MobileWeatherWidget://widget/id/")
                    ,String.valueOf(widgetId));
            startService.setData(data);
			setResult(RESULT_OK, startService);

            JobIntentService.enqueueWork(context, UpdateWidgetJobIntentService.class, 1, startService);
*/

            // Update the widget
            /*AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(NewSmallWidgetConfigurationActivity.this);
            RemoteViews views = new RemoteViews(NewSmallWidgetConfigurationActivity.this.getPackageName(), R.layout.new_small_widget_layout);
            appWidgetManager.updateAppWidget(appWidgetId, views);*/

            // Make sure we pass back the original appWidgetId
            Intent resultValue = new Intent();
            resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            setResult(RESULT_OK, resultValue);
			finish();
		}
		if (widgetId == INVALID_APPWIDGET_ID) {
			Log.i("widgetId", "Invalid appwidget id");
			finish();
		}

	}

    public void askLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            if (ActivityCompat.checkSelfPermission(
                    NewSmallWidgetConfigurationActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) !=
                    PackageManager.PERMISSION_GRANTED
                    || ActivityCompat.checkSelfPermission(
                    NewSmallWidgetConfigurationActivity.this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) !=
                    PackageManager.PERMISSION_GRANTED) {

                new AlertDialog.Builder(this)
                        .setTitle(R.string.location_service_info_title)
                        .setMessage(R.string.location_service_info)
                        .setPositiveButton(R.string.ask_permission, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                ActivityCompat.requestPermissions(NewSmallWidgetConfigurationActivity.this,
                                        new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                                                Manifest.permission.ACCESS_FINE_LOCATION,
                                                Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                                        1);
                            }
                        })
                        .setNegativeButton(android.R.string.cancel, null).show();
            }
        } else {
            ActivityCompat.requestPermissions(NewSmallWidgetConfigurationActivity.this,
                    new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                    1);
        }
    }

}
