package fi.fmi.mobileweather;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class LocationWorker extends Worker {

    private static LocationUpdateCallback locationUpdateCallback;

    public LocationWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    public static void setLocationUpdateCallback(LocationUpdateCallback callback) {
        locationUpdateCallback = callback;
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        boolean isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        boolean isGPSEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);

        if (!isGPSEnabled && !isNetworkEnabled) {
            Log.d("Widget Location", "GPS and Network not enabled");
            return Result.failure();
        }

        Criteria criteria = new Criteria();
        criteria.setAccuracy(Criteria.ACCURACY_COARSE);
        criteria.setPowerRequirement(Criteria.POWER_LOW);

        String provider = locationManager.getBestProvider(criteria, true);
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d("Widget Location", "Permissions missing");
            return Result.failure();
        }

        assert provider != null;
        locationManager.requestLocationUpdates(provider, 10000, 10, new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                if (locationUpdateCallback != null) {
                    locationUpdateCallback.onLocationUpdated(location);
                }
            }

            @Override public void onStatusChanged(String provider, int status, Bundle extras) { }
            @Override public void onProviderEnabled(String provider) { }
            @Override public void onProviderDisabled(String provider) { }
        }, Looper.getMainLooper());

        return Result.success();
    }
}
