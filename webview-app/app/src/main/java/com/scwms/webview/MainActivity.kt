package com.scwms.webview

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var errorView: View
    private lateinit var errorText: TextView

    companion object {
        private const val APP_URL = "http://192.168.0.88:3000/login"
        private const val PERMISSION_REQUEST_CODE = 100
        private const val FILE_CHOOSER_REQUEST_CODE = 101
    }

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraPhotoUri: Uri? = null
    private var cameraPhotoFile: File? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        errorView = findViewById(R.id.errorView)
        errorText = findViewById(R.id.errorText)

        requestPermissions()
        setupWebView()
        setupSwipeRefresh()

        findViewById<View>(R.id.btnRetry).setOnClickListener {
            retry()
        }
    }

    private fun requestPermissions() {
        val permissions = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            permissions.add(android.Manifest.permission.ACCESS_FINE_LOCATION)
            permissions.add(android.Manifest.permission.ACCESS_COARSE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            permissions.add(android.Manifest.permission.CAMERA)
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                permissions.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setGeolocationEnabled(true)
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            allowFileAccess = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                showError("Tidak dapat terhubung ke server.\nPeriksa koneksi internet Anda.")
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                swipeRefresh.isRefreshing = false
                progressBar.visibility = View.GONE
                errorView.visibility = View.GONE
                webView.visibility = View.VISIBLE
                val js = """
(function() {
    if (window.__gpsOverrideInjected) return;
    window.__gpsOverrideInjected = true;
    window.__gpsCallbacks = {};
    var _id = 0;
    var nat = window.Android;
    var orig = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    navigator.geolocation.getCurrentPosition = function(success, error, opt) {
        if (nat && nat.requestLocation) {
            var id = 'g_' + (++_id);
            window.__gpsCallbacks[id] = { success: success, error: error };
            nat.requestLocation(id);
            setTimeout(function() {
                if (window.__gpsCallbacks[id]) {
                    delete window.__gpsCallbacks[id];
                    orig(success, error, opt);
                }
            }, 8000);
        } else { orig(success, error, opt); }
    };
})();
""".trimIndent()
                webView.evaluateJavascript(js, null)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                filePathCallback = callback

                val galleryIntent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "image/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
                cameraPhotoFile = File.createTempFile("SCWMS_${timeStamp}_", ".jpg", this@MainActivity.cacheDir)
                cameraPhotoUri = FileProvider.getUriForFile(this@MainActivity, "com.scwms.driver.fileprovider", cameraPhotoFile!!)

                val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                    putExtra(MediaStore.EXTRA_OUTPUT, cameraPhotoUri)
                    addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }

                val chooser = Intent.createChooser(galleryIntent, "Ambil Foto")
                chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cameraIntent))
                startActivityForResult(chooser, FILE_CHOOSER_REQUEST_CODE)
                return true
            }
        }

        webView.addJavascriptInterface(WebAppInterface(this, webView), "Android")
        loadUrl()
    }

    private fun setupSwipeRefresh() {
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }
        swipeRefresh.setOnChildScrollUpCallback { _, _ ->
            !webView.canScrollVertically(-1)
        }
        swipeRefresh.setColorSchemeResources(
            android.R.color.holo_green_dark,
            android.R.color.holo_green_light
        )
    }

    private fun loadUrl() {
        errorView.visibility = View.GONE
        webView.visibility = View.VISIBLE
        webView.loadUrl(APP_URL)
    }

    private fun retry() {
        swipeRefresh.isRefreshing = true
        webView.reload()
    }

    private fun showError(message: String) {
        webView.visibility = View.GONE
        errorView.visibility = View.VISIBLE
        errorText.text = message
        swipeRefresh.isRefreshing = false
        progressBar.visibility = View.GONE
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: android.content.Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            val results = when {
                resultCode != RESULT_OK -> null
                data?.data != null -> {
                    val uri = data.data!!
                    try { contentResolver.openInputStream(uri)?.close(); arrayOf(uri) } catch (_: Exception) { null }
                }
                data?.clipData != null -> {
                    val uris = (0 until data.clipData!!.itemCount).map { data.clipData!!.getItemAt(it).uri }
                        .filter { try { contentResolver.openInputStream(it)?.close(); true } catch (_: Exception) { false } }
                    uris.toTypedArray().ifEmpty { null }
                }
                cameraPhotoFile?.exists() == true && cameraPhotoFile!!.length() > 0 -> {
                    arrayOf(cameraPhotoUri!!)
                }
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
            cameraPhotoUri = null
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            AlertDialog.Builder(this)
                .setTitle("Keluar")
                .setMessage("Apakah Anda ingin keluar dari aplikasi?")
                .setPositiveButton("Ya") { _, _ -> finishAffinity() }
                .setNegativeButton("Tidak", null)
                .show()
        }
    }
}
