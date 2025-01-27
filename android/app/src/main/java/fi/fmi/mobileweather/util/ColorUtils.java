package fi.fmi.mobileweather.util;

import android.content.Context;
import androidx.core.content.ContextCompat;

import fi.fmi.mobileweather.R;

public class ColorUtils {
    public static int getPrimaryBlue(Context context) {
        return ContextCompat.getColor(context, R.color.primaryBlue);
    }
}