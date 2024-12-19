package fi.fmi.mobileweather;

import android.content.Context;
import androidx.core.content.ContextCompat;

public class ColorUtils {
    public static int getPrimaryBlue(Context context) {
        return ContextCompat.getColor(context, R.color.primaryBlue);
    }
}