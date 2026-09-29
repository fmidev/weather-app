package fi.fmi.mobileweather

import android.graphics.Color
import android.os.Build
import androidx.core.view.WindowCompat
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class NavigationBarModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var darkTheme: Boolean? = null

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = "NavigationBar"

    @ReactMethod
    fun setDarkTheme(isDark: Boolean) {
        UiThreadUtil.runOnUiThread {
            darkTheme = isDark
            updateAppearance()
        }
    }

    @Suppress("DEPRECATION")
    private fun updateAppearance() {
        val isDark = darkTheme ?: return
        val window = reactApplicationContext.currentActivity?.window ?: return
        WindowCompat.getInsetsController(window, window.decorView)
            .isAppearanceLightNavigationBars = !isDark

        // Before Android 15, the bar can remain opaque; keep the icons readable.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            window.navigationBarColor =
                if (isDark || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) Color.BLACK
                else Color.WHITE
        }
    }

    override fun onHostResume() = updateAppearance()

    override fun onHostPause() = Unit

    override fun onHostDestroy() = Unit

    override fun invalidate() {
        reactApplicationContext.removeLifecycleEventListener(this)
        super.invalidate()
    }
}
