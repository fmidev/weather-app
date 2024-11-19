package fi.fmi.mobileweather;


import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class WidgetSetupManager {
    private static WidgetSetup widgetSetup;

    public static WidgetSetup getWidgetSetup() {
        return widgetSetup;
    }


    public static void initializeSetup(Context context) {
        if (widgetSetup == null) {
            try {
                AssetManager assetManager = context.getAssets();
                InputStream inputStream = assetManager.open("widgetConfig.json");
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader reader = new BufferedReader(inputStreamReader);
                StringBuilder stringBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    stringBuilder.append(line);
                }
                String jsonString = stringBuilder.toString();

                // Parse the JSON string using GSON
                Gson gson = new Gson();
                widgetSetup = gson.fromJson(jsonString, WidgetSetup.class);

            } catch (IOException e) {
                Log.e("NewWidget Update", "Error reading setup file", e);
            }
        }
    }
}
