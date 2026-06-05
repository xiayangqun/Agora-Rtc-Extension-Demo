import { native, sys } from "cc";

const ANDROID_HELPER_CLASS = "io/agora/demo/permissions/AgoraDemoPermissionHelper";
const APPLE_HELPER_CLASS = "AgoraDemoPermissionHelper";

const WINDOWS_CAMERA_SETTINGS = "ms-settings:privacy-webcam";
const WINDOWS_MICROPHONE_SETTINGS = "ms-settings:privacy-microphone";
const WINDOWS_SCREEN_CAPTURE_SETTINGS = "ms-settings:privacy-graphicsCaptureProgrammatic";

function isAndroid(): boolean {
    return sys.isNative && sys.platform === sys.Platform.ANDROID;
}

function isAppleNative(): boolean {
    return sys.isNative && (sys.platform === sys.Platform.IOS || sys.platform === sys.Platform.MACOS);
}

function isWindows(): boolean {
    return sys.isNative && sys.platform === sys.Platform.WINDOWS;
}

function callAndroidBoolean(method: string): boolean {
    if (!isAndroid()) {
        return false;
    }
    return !!native.reflection.callStaticMethod(ANDROID_HELPER_CLASS, method, "()Z");
}

function callAppleBoolean(method: string): boolean {
    if (!isAppleNative()) {
        return false;
    }
    return !!native.reflection.callStaticMethod(APPLE_HELPER_CLASS, method);
}

function openWindowsSettings(url: string): boolean {
    if (!isWindows()) {
        return false;
    }
    sys.openURL(url);
    return true;
}

function logNoNeed(): void {
    console.info("Not Needed");
}

export function requestCameraPermission(): boolean {
    if (isAndroid()) {
        return callAndroidBoolean("requestCameraPermission");
    }
    if (isAppleNative()) {
        return callAppleBoolean("requestCameraPermission");
    }
    return openWindowsSettings(WINDOWS_CAMERA_SETTINGS);
}

export function hasCameraPermission(): boolean {
    if (isAndroid()) {
        return callAndroidBoolean("hasCameraPermission");
    }
    if (isAppleNative()) {
        return callAppleBoolean("hasCameraPermission");
    }
    return false;
}

export function requestMicrophonePermission(): boolean {
    if (isAndroid()) {
        return callAndroidBoolean("requestMicrophonePermission");
    }
    if (isAppleNative()) {
        return callAppleBoolean("requestMicrophonePermission");
    }
    return openWindowsSettings(WINDOWS_MICROPHONE_SETTINGS);
}

export function hasMicrophonePermission(): boolean {
    if (isAndroid()) {
        return callAndroidBoolean("hasMicrophonePermission");
    }
    if (isAppleNative()) {
        return callAppleBoolean("hasMicrophonePermission");
    }
    return false;
}

export function requestScreenCapturePermission(): boolean {
    if (sys.platform === sys.Platform.MACOS) {
        return callAppleBoolean("requestScreenCapturePermission");
    }
    if (isWindows()) {
        return openWindowsSettings(WINDOWS_SCREEN_CAPTURE_SETTINGS);
    }
    logNoNeed();
    return true;
}

export function hasScreenCapturePermission(): boolean {
    if (sys.platform === sys.Platform.MACOS) {
        return callAppleBoolean("hasScreenCapturePermission");
    }
    if (isWindows()) {
        return false;
    }
    logNoNeed();
    return true;
}

export async function ensureRtcMediaPermissions(): Promise<boolean> {
    const cameraReady = hasCameraPermission() || requestCameraPermission();
    const micReady = hasMicrophonePermission() || requestMicrophonePermission();
    return cameraReady && micReady;
}

export async function ensureScreenCapturePermission(): Promise<boolean> {
    if (hasScreenCapturePermission()) {
        return true;
    }
    const requested = requestScreenCapturePermission();
    return hasScreenCapturePermission() || requested;
}
