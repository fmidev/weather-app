package fi.fmi.mobileweather

import android.os.Bundle
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.LocaleSpan
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import androidx.core.view.accessibility.AccessibilityNodeProviderCompat
import com.facebook.react.uimanager.ReactAccessibilityDelegate
import java.util.Locale

internal class AccessibilityHintLanguageDelegate(
    private val original: AccessibilityDelegateCompat,
    private val language: () -> Locale? = { AppCompatDelegate.getApplicationLocales()[0] },
) : AccessibilityDelegateCompat() {

    private var lastHint: Pair<String?, Locale?>? = null

    override fun onInitializeAccessibilityNodeInfo(host: View, info: AccessibilityNodeInfoCompat) {
        original.onInitializeAccessibilityNodeInfo(host, info)
        val hint = info.tooltipText?.takeIf { it.isNotEmpty() } ?: return
        val locale = language() ?: return
        val description = info.contentDescription?.takeIf { it.isNotEmpty() }
            ?: info.text?.takeIf { it.isNotEmpty() }
            ?: ReactAccessibilityDelegate.getTalkbackDescription(host, info)
        val combined = SpannableStringBuilder()
        if (!description.isNullOrEmpty()) {
            combined.append(description)
            if (description.toString() != hint.toString()) combined.append(". ").append(hint)
        } else {
            combined.append(hint)
        }
        val localizedDescription = SpannableString(combined)
        localizedDescription.getSpans(0, localizedDescription.length, LocaleSpan::class.java).forEach {
            localizedDescription.removeSpan(it)
        }
        localizedDescription.setSpan(
            LocaleSpan(locale), 0, localizedDescription.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        // Some TalkBack versions do not apply the app language consistently to tooltip speech.
        // Keep the full app-authored text on the description path and announce the hint only once.
        info.contentDescription = localizedDescription
        info.tooltipText = null
    }

    private fun notifyHintChanged(view: View) {
        val hint = view.getTag(com.facebook.react.R.id.accessibility_hint)?.toString() to language()
        if (lastHint == hint) return
        lastHint = hint
        // The delegate is attached after layout; invalidate nodes TalkBack may already have cached.
        view.sendAccessibilityEvent(AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED)
    }

    // Keep React Native's event handling, actions and virtual accessibility nodes intact.
    override fun sendAccessibilityEvent(host: View, eventType: Int) =
        original.sendAccessibilityEvent(host, eventType)

    override fun sendAccessibilityEventUnchecked(host: View, event: AccessibilityEvent) =
        original.sendAccessibilityEventUnchecked(host, event)

    override fun dispatchPopulateAccessibilityEvent(host: View, event: AccessibilityEvent): Boolean =
        original.dispatchPopulateAccessibilityEvent(host, event)

    override fun onPopulateAccessibilityEvent(host: View, event: AccessibilityEvent) =
        original.onPopulateAccessibilityEvent(host, event)

    override fun onInitializeAccessibilityEvent(host: View, event: AccessibilityEvent) =
        original.onInitializeAccessibilityEvent(host, event)

    override fun onRequestSendAccessibilityEvent(
        host: ViewGroup, child: View, event: AccessibilityEvent
    ): Boolean = original.onRequestSendAccessibilityEvent(host, child, event)

    override fun getAccessibilityNodeProvider(host: View): AccessibilityNodeProviderCompat? =
        original.getAccessibilityNodeProvider(host)

    override fun performAccessibilityAction(host: View, action: Int, args: Bundle?): Boolean =
        original.performAccessibilityAction(host, action, args)

    companion object {
        fun install(view: View) {
            val current = ViewCompat.getAccessibilityDelegate(view)
            if (current is AccessibilityHintLanguageDelegate) {
                current.notifyHintChanged(view)
                return
            }
            val original = current ?: ReactAccessibilityDelegate(
                view, view.isFocusable, view.importantForAccessibility
            )
            val delegate = AccessibilityHintLanguageDelegate(original)
            ViewCompat.setAccessibilityDelegate(view, delegate)
            delegate.notifyHintChanged(view)
        }
    }
}
