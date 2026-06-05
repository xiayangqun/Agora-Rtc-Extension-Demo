# Agora Demo Native Permissions

This extension is demo-only glue for native permissions used by the Agora RTC demo.

## Boundaries

- Do not add Agora SDK binaries, Agora native bindings, or JSB bindings here.
- Do not modify `agora-rtc-extension-for-cocos-creator` from this extension's build hook.
- Keep this plugin focused on runtime permissions and native permission-result plumbing.
- Do not add Android screen-capture object plumbing here. The Agora Android screen-share path does not need this demo plugin to cache or pass native capture objects.

## Android

- The build hook may copy Java helper sources into the generated Android project.
- Do not write Android manifest permissions from this plugin; the RTC extension owns permission configuration.
- Do not inject or modify generated Activity lifecycle methods from this plugin.
- Camera and microphone permissions should use Android runtime permission requests.
- Screen sharing should log `暂时不需要` on Android.

## iOS/macOS

- Camera and microphone permissions should use `AVCaptureDevice` authorization APIs.
- macOS screen sharing should use CoreGraphics screen-capture authorization APIs.
- iOS screen sharing should log `暂时不需要`.
- Do not write `Info.plist` or entitlement permission keys from this plugin; the RTC extension owns permission configuration.

## Windows

- Camera, microphone, and screen-sharing permission entry points should open the corresponding Windows privacy settings pages.
