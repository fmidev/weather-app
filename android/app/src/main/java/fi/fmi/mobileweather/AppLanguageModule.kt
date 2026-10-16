package fi.fmi.mobileweather

import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.IllegalViewOperationException
import com.facebook.react.uimanager.UIManagerHelper

class AppLanguageModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppLanguage"

    @ReactMethod
    fun localizeAccessibilityHint(reactTag: Int) {
        UiThreadUtil.runOnUiThread {
            try {
                val view = UIManagerHelper.getUIManagerForReactTag(reactApplicationContext, reactTag)
                    ?.resolveView(reactTag) ?: return@runOnUiThread
                AccessibilityHintLanguageDelegate.install(view)
            } catch (_: IllegalViewOperationException) {
                // The view may have unmounted while the layout event was reaching JavaScript.
            }
        }
    }

    @ReactMethod
    fun setLanguage(language: String, promise: Promise) = onMainThread(promise) {
        applyLanguage(language)
        null
    }

    private fun applyLanguage(language: String) {
        val locales = LocaleListCompat.forLanguageTags(language)
        if (AppCompatDelegate.getApplicationLocales() != locales) {
            AppCompatDelegate.setApplicationLocales(locales)
        }
    }

    private fun onMainThread(promise: Promise, action: () -> Any?) {
        UiThreadUtil.runOnUiThread {
            try {
                promise.resolve(action())
            } catch (error: Exception) {
                promise.reject("E_APP_LANGUAGE", "Failed to update the Android app language", error)
            }
        }
    }
}
