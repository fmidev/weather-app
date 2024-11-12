package fi.fmi.mobileweather;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.location.Criteria;
import android.location.LocationListener;
import android.location.Location;
import android.location.LocationProvider;
import android.os.Looper;
import android.os.HandlerThread;

import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

public class SingleShotLocationProvider {

    public interface LocationCallback {
        void onNewLocationAvailable(Location location);
    }

//    @SuppressLint("MissingPermission")
    public static Boolean requestSingleUpdate(final Context context, final LocationCallback callback) {
        //Looper.prepare();

        HandlerThread handlerThread = new HandlerThread("WidgetThread");
        handlerThread.start();
        // Now get the Looper from the HandlerThread
        // NOTE: This call will block until the HandlerThread gets control and initializes its Looper
        Looper looper = handlerThread.getLooper();

        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        boolean isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        boolean isGPSEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);

        if (!isGPSEnabled && !isNetworkEnabled) {
            Log.d("Widget Location", "GPS and Network not enabled");
            return false;
        }

        Criteria criteria = new Criteria();
        criteria.setAccuracy(Criteria.ACCURACY_COARSE);
        criteria.setPowerRequirement(Criteria.POWER_LOW);

        String provider = locationManager.getBestProvider(criteria, true);
        // If the app does NOT have the necessary permissions to access fine and coarse location data
        if (ActivityCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED || ActivityCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.

            Log.d("Widget Location", "Permissions missing");
            // location cannot be retrieved
            return false;
        }
        /*Location location = locationManager.getLastKnownLocation(provider);

        if (location != null) {
            // Do not use location more than 2 hours old

            Long currentTime = new java.util.Date().getTime();
            Long locationTime = location.getTime();
            if (Math.abs(currentTime-locationTime) < (2*60*60*1000)) {
                Log.d("Widget Location", "SingleShotLocationProvider: using last known location");
                callback.onNewLocationAvailable(location);
                return true;
            }
        }*/

        locationManager.requestSingleUpdate(criteria, new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                callback.onNewLocationAvailable(location);
                handlerThread.quitSafely();
            }

            @Override public void onStatusChanged(String provider, int status, Bundle extras) { }
            @Override public void onProviderEnabled(String provider) { }
            @Override public void onProviderDisabled(String provider) { }
        }, looper);

        return true;
    }

}
