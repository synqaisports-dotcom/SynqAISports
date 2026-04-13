package com.synqai.sports;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.BridgeActivity;

/**
 * Deep links → carga directa en WebView (servidor remoto Capacitor).
 *
 * <p>HTTPS App Links: {@code https://synqai.net/sandbox/app…} (ver {@code assetlinks.json}).
 * Esquema custom: {@code synqai-sports://open/sandbox/app…} → mismo origen que {@code
 * BuildConfig.DEEPLINK_REMOTE_ORIGIN} (sincronizado con {@code CAPACITOR_SERVER_URL} al compilar).
 */
public class MainActivity extends BridgeActivity {

    private boolean appliedInitialLaunchIntent;

    @Override
    public void onStart() {
        super.onStart();
        if (!appliedInitialLaunchIntent) {
            appliedInitialLaunchIntent = true;
            applyDeepLinkIfPresent(getIntent());
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        applyDeepLinkIfPresent(intent);
    }

    private void applyDeepLinkIfPresent(Intent intent) {
        if (bridge == null || intent == null) {
            return;
        }
        Uri data = intent.getData();
        String target = mapDeepLinkToServerUrl(data);
        if (target != null) {
            bridge.getWebView().loadUrl(target);
        }
    }

    private static String mapDeepLinkToServerUrl(Uri data) {
        if (data == null) {
            return null;
        }
        String scheme = data.getScheme();
        if (scheme == null) {
            return null;
        }

        if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) {
            String host = data.getHost();
            if (host == null) {
                return null;
            }
            Uri cfg = Uri.parse(BuildConfig.DEEPLINK_REMOTE_ORIGIN);
            String cfgHost = cfg.getHost();
            boolean allowedHost =
                (cfgHost != null && cfgHost.equalsIgnoreCase(host))
                    || "synqai.net".equalsIgnoreCase(host)
                    || host.toLowerCase().endsWith(".synqai.net");
            if (!allowedHost) {
                return null;
            }
            String path = data.getPath();
            if (path != null && path.startsWith("/sandbox/app")) {
                return data.toString();
            }
            return null;
        }

        if ("synqai-sports".equalsIgnoreCase(scheme)) {
            String path = data.getPath();
            if (path != null && path.startsWith("/sandbox/app")) {
                String q = data.getEncodedQuery();
                return BuildConfig.DEEPLINK_REMOTE_ORIGIN + path + (q != null && !q.isEmpty() ? "?" + q : "");
            }
        }

        return null;
    }
}
