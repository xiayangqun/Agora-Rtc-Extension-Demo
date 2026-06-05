package io.agora.demo.permissions;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.cocos.lib.GlobalObject;

public final class AgoraDemoPermissionHelper {
    private static final String TAG = "AgoraDemoPermission";
    private static final int REQUEST_CAMERA = 43001;
    private static final int REQUEST_MICROPHONE = 43002;

    private AgoraDemoPermissionHelper() {}

    public static boolean requestCameraPermission() {
        return requestRuntimePermission(Manifest.permission.CAMERA, REQUEST_CAMERA);
    }

    public static boolean hasCameraPermission() {
        return hasRuntimePermission(Manifest.permission.CAMERA);
    }

    public static boolean requestMicrophonePermission() {
        return requestRuntimePermission(Manifest.permission.RECORD_AUDIO, REQUEST_MICROPHONE);
    }

    public static boolean hasMicrophonePermission() {
        return hasRuntimePermission(Manifest.permission.RECORD_AUDIO);
    }

    public static boolean requestScreenCapturePermission() {
        Log.i(TAG, "暂时不需要");
        return true;
    }

    public static boolean hasScreenCapturePermission() {
        Log.i(TAG, "暂时不需要");
        return true;
    }

    private static boolean requestRuntimePermission(String permission, int requestCode) {
        Activity activity = getActivity();
        if (activity == null) {
            Log.e(TAG, "requestRuntimePermission failed: activity is null, permission=" + permission);
            return false;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || activity.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED) {
            return true;
        }

        activity.requestPermissions(new String[] { permission }, requestCode);
        return false;
    }

    private static boolean hasRuntimePermission(String permission) {
        Activity activity = getActivity();
        return activity != null && (Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                activity.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED);
    }

    private static Activity getActivity() {
        return GlobalObject.getActivity();
    }
}
