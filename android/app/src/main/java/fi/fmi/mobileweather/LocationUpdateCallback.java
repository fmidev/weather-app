package fi.fmi.mobileweather;

import android.location.Location;

public interface LocationUpdateCallback {
    void onLocationUpdated(Location location);
}
