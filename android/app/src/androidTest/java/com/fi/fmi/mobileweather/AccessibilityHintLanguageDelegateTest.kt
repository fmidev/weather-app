package fi.fmi.mobileweather

import android.text.Spanned
import android.os.Parcel
import android.text.style.LocaleSpan
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.ViewCompat
import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import androidx.core.view.accessibility.AccessibilityNodeProviderCompat
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.uimanager.ReactAccessibilityDelegate
import java.util.Locale
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AccessibilityHintLanguageDelegateTest {
    private fun onMainThread(block: () -> Unit) {
        var failure: Throwable? = null
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            try { block() } catch (error: Throwable) { failure = error }
        }
        failure?.let { throw it }
    }

    private fun button(): View {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        return View(context).apply {
            contentDescription = "Suomi"
            isSelected = true
            setTag(com.facebook.react.R.id.accessibility_hint, "Vaihda sovelluksen kieli")
            setTag(
                com.facebook.react.R.id.accessibility_role,
                ReactAccessibilityDelegate.AccessibilityRole.BUTTON
            )
            ReactAccessibilityDelegate.setDelegate(this, isFocusable, importantForAccessibility)
        }
    }

    private fun node(view: View): AccessibilityNodeInfoCompat {
        val info = AccessibilityNodeInfoCompat.obtain()
        // This fixture is unattached; seed the fields Android supplies for an attached view.
        info.contentDescription = view.contentDescription
        info.isSelected = view.isSelected
        ViewCompat.onInitializeAccessibilityNodeInfo(view, info)
        return info
    }

    @Test
    fun announcesTheNameAndHintInTheAppLanguageWithoutDuplicatingTheTooltip() = onMainThread {
        for (tag in listOf("fi", "sv", "en")) {
            val view = button()
            val original = ViewCompat.getAccessibilityDelegate(view)!!
            ViewCompat.setAccessibilityDelegate(view,
                AccessibilityHintLanguageDelegate(original) { Locale.forLanguageTag(tag) })

            val info = node(view)
            val hint = info.contentDescription as Spanned
            val spans = hint.getSpans(0, hint.length, LocaleSpan::class.java)
            assertEquals("Suomi. Vaihda sovelluksen kieli", hint.toString())
            assertEquals(1, spans.size)
            assertEquals(tag, spans[0].locale?.language)
            assertEquals(0, hint.getSpanStart(spans[0]))
            assertEquals(hint.length, hint.getSpanEnd(spans[0]))
            assertNull(info.tooltipText)
            assertEquals("android.widget.Button", info.className.toString())
            assertTrue(info.isSelected)
        }
    }

    @Test
    fun readsTheCurrentHintAndLanguageWhenTheNodeIsRequested() = onMainThread {
        val view = button()
        var locale = Locale.forLanguageTag("fi")
        val original = ViewCompat.getAccessibilityDelegate(view)!!
        ViewCompat.setAccessibilityDelegate(view,
            AccessibilityHintLanguageDelegate(original) { locale })
        node(view)

        locale = Locale.forLanguageTag("sv")
        view.setTag(com.facebook.react.R.id.accessibility_hint, "Ändra appens språk")
        val hint = node(view).contentDescription as Spanned
        assertEquals("Suomi. Ändra appens språk", hint.toString())
        assertEquals("sv", hint.getSpans(0, hint.length, LocaleSpan::class.java)[0].locale?.language)

        view.setTag(com.facebook.react.R.id.accessibility_hint, null)
        assertNull(node(view).tooltipText)
        assertEquals("Suomi", node(view).contentDescription.toString())
    }

    @Test
    fun preservesClickActionsVirtualNodeProviderAndFocusProperties() = onMainThread {
        val view = button()
        var clicks = 0
        view.setOnClickListener { clicks += 1 }
        val focusable = view.isFocusable
        val importance = view.importantForAccessibility
        val original = ViewCompat.getAccessibilityDelegate(view)!!
        val provider = original.getAccessibilityNodeProvider(view)
        ViewCompat.setAccessibilityDelegate(view,
            AccessibilityHintLanguageDelegate(original) { Locale.forLanguageTag("fi") })

        assertTrue(view.performAccessibilityAction(AccessibilityNodeInfo.ACTION_CLICK, null))
        assertEquals(1, clicks)
        assertSame(provider, ViewCompat.getAccessibilityDelegate(view)!!.getAccessibilityNodeProvider(view))
        assertEquals(focusable, view.isFocusable)
        assertEquals(importance, view.importantForAccessibility)
    }

    @Test
    fun installingTwiceDoesNotNestDelegates() = onMainThread {
        val view = button()
        AccessibilityHintLanguageDelegate.install(view)
        val first = ViewCompat.getAccessibilityDelegate(view)
        AccessibilityHintLanguageDelegate.install(view)
        assertSame(first, ViewCompat.getAccessibilityDelegate(view))
    }

    @Test
    fun preservesAnExistingVirtualNodeProvider() = onMainThread {
        val view = button()
        val provider = AccessibilityNodeProviderCompat()
        val original = object : AccessibilityDelegateCompat() {
            override fun getAccessibilityNodeProvider(host: View) = provider
        }
        ViewCompat.setAccessibilityDelegate(view,
            AccessibilityHintLanguageDelegate(original) { Locale.forLanguageTag("fi") })
        assertSame(provider, ViewCompat.getAccessibilityDelegate(view)!!.getAccessibilityNodeProvider(view))
    }

    @Test
    fun preservesTheFullDescriptionAndItsLanguageAcrossParceling() = onMainThread {
        val view = button()
        ViewCompat.setAccessibilityDelegate(view,
            AccessibilityHintLanguageDelegate(ViewCompat.getAccessibilityDelegate(view)!!) {
                Locale.forLanguageTag("fi")
            })
        val parcel = Parcel.obtain()
        node(view).unwrap().writeToParcel(parcel, 0)
        parcel.setDataPosition(0)
        val received = AccessibilityNodeInfo.CREATOR.createFromParcel(parcel)
        parcel.recycle()

        val description = received.contentDescription as Spanned
        assertEquals("Suomi. Vaihda sovelluksen kieli", description.toString())
        assertEquals("fi", description.getSpans(0, description.length, LocaleSpan::class.java)[0].locale?.language)
        assertNull(received.tooltipText)
    }

    @Test
    fun doesNotRepeatAHintThatIsAlreadyTheLabel() = onMainThread {
        val view = button()
        view.contentDescription = "Vaihda sovelluksen kieli"
        ViewCompat.setAccessibilityDelegate(view,
            AccessibilityHintLanguageDelegate(ViewCompat.getAccessibilityDelegate(view)!!) {
                Locale.forLanguageTag("fi")
            })

        assertEquals("Vaihda sovelluksen kieli", node(view).contentDescription.toString())
        assertNull(node(view).tooltipText)
    }

    @Test
    fun invalidatesCachedNodesOnlyWhenTheHintChanges() = onMainThread {
        val view = button()
        var invalidations = 0
        ViewCompat.setAccessibilityDelegate(view, object : AccessibilityDelegateCompat() {
            override fun sendAccessibilityEvent(host: View, eventType: Int) {
                if (eventType == android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
                    invalidations += 1
                }
            }
        })

        AccessibilityHintLanguageDelegate.install(view)
        AccessibilityHintLanguageDelegate.install(view)
        assertEquals(1, invalidations)
        view.setTag(com.facebook.react.R.id.accessibility_hint, "Ändra appens språk")
        AccessibilityHintLanguageDelegate.install(view)
        assertEquals(2, invalidations)
        view.setTag(com.facebook.react.R.id.accessibility_hint, null)
        AccessibilityHintLanguageDelegate.install(view)
        assertEquals(3, invalidations)
    }
}
