package fi.fmi.mobileweather;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RemoteViews;


public class MyWidgetConfigureActivity extends Activity {
    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private EditText configureText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the result to CANCELED in case the user backs out
        setResult(RESULT_CANCELED);

        // Set the layout
        setContentView(R.layout.widget_configure);

        // Find the EditText and Button
        configureText = findViewById(R.id.configure_text);
        Button configureButton = findViewById(R.id.configure_button);

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

        // Set the click listener for the button
        configureButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final String widgetText = configureText.getText().toString();

                // Save the text to SharedPreferences or another storage
                // (not shown here for brevity)

                // Update the widget
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(MyWidgetConfigureActivity.this);
                RemoteViews views = new RemoteViews(MyWidgetConfigureActivity.this.getPackageName(), R.layout.widget_layout);
                views.setTextViewText(R.id.widget_text, widgetText);
                appWidgetManager.updateAppWidget(appWidgetId, views);

                // Make sure we pass back the original appWidgetId
                Intent resultValue = new Intent();
                resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
                setResult(RESULT_OK, resultValue);
                finish();
            }
        });
    }
}