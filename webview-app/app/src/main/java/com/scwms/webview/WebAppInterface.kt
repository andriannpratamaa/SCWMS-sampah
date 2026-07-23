package com.scwms.webview

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast

class WebAppInterface(
    private val context: Context,
    private val webView: WebView? = null
) {
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }

    @JavascriptInterface
    fun requestLocation(callbackId: String) {
        val lm = locationManager ?: run {
            callJsCallback(callbackId, null, "Location service not available")
            return
        }

        try {
            val hasGps = lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
            val hasNetwork = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

            if (!hasGps && !hasNetwork) {
                callJsCallback(callbackId, null, "GPS is disabled")
                return
            }

            val providers = mutableListOf<String>()
            if (hasGps) providers.add(LocationManager.GPS_PROVIDER)
            if (hasNetwork) providers.add(LocationManager.NETWORK_PROVIDER)

            for (p in providers) {
                val last = lm.getLastKnownLocation(p)
                if (last != null && System.currentTimeMillis() - last.time < 60000) {
                    callJsCallback(callbackId, last, null)
                    return
                }
            }

            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    lm.removeUpdates(this)
                    callJsCallback(callbackId, location, null)
                }

                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {
                    lm.removeUpdates(this)
                    callJsCallback(callbackId, null, "GPS provider disabled")
                }
            }

            for (p in providers) {
                try { lm.requestSingleUpdate(p, listener, Looper.getMainLooper()) } catch (_: Exception) {}
            }

            Handler(Looper.getMainLooper()).postDelayed({
                lm.removeUpdates(listener)
                callJsCallback(callbackId, null, "GPS timeout")
            }, 15000)
        } catch (e: SecurityException) {
            callJsCallback(callbackId, null, "Location permission denied")
        } catch (e: Exception) {
            callJsCallback(callbackId, null, e.message ?: "Location error")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun callJsCallback(callbackId: String, location: Location?, error: String?) {
        val js = if (location != null) {
            """(function(){
                var cb = window.__gpsCallbacks && window.__gpsCallbacks['$callbackId'];
                if (cb && cb.success) cb.success({
                    coords: {
                        latitude: ${location.latitude},
                        longitude: ${location.longitude},
                        accuracy: ${location.accuracy},
                        altitude: ${if (location.hasAltitude()) location.altitude else "null"},
                        speed: ${if (location.hasSpeed()) location.speed else "null"}
                    },
                    timestamp: ${location.time}
                });
                delete window.__gpsCallbacks['$callbackId'];
            })()"""
        } else {
            """(function(){
                var cb = window.__gpsCallbacks && window.__gpsCallbacks['$callbackId'];
                if (cb && cb.error) cb.error({code: 1, message: '${error?.replace("'", "\\'") ?: "Unknown error"}'});
                delete window.__gpsCallbacks['$callbackId'];
            })()"""
        }
        webView?.post { webView.evaluateJavascript(js, null) }
    }
}
