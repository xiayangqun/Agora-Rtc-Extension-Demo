# Agora RTC Extension Demo

[English](#english) | [中文](#中文)

---

<a id="english"></a>

## English

### Introduction

This is a demo project for the [Agora RTC Extension for Cocos Creator](https://github.com/xiayangqun/Agora-Rtc-Extension-Demo), showcasing various real-time communication scenarios using the Agora RTC SDK.

### Main Scene

The main scene serves as the entry point of the application. It provides:

1. **Permission Request Buttons** — Three buttons to request device permissions:
   - 📷 **Camera Permission** — Request access to the camera for video capture
   - 🎤 **Microphone Permission** — Request access to the microphone for audio capture
   - 🖥️ **Screen Sharing Permission** — Request access to screen sharing

2. **Scene Selection** — A list of four demo scenarios that you can select and navigate to by clicking the "Go" button.

### Demo Scenarios

| Scenario | Description |
|----------|-------------|
| **Single Camera** | Join a channel with a single camera for basic 1-on-1 or group video calls. |
| **Multi Camera** | Join the same channel with two cameras and two user IDs for multi-camera video calls. Ideal for scenarios requiring multiple camera angles. |
| **Camera + Screen Share** | Join a channel with both camera and screen sharing enabled simultaneously. Perfect for presentations and remote collaboration. |
| **Media Player** | Join a channel with a media player for video calls while streaming media files to remote users. |

### Platform Support

| Scenario | Android | iOS | Windows | macOS | Chrome Desktop |
|----------|:-------:|:---:|:-------:|:-----:|:--------------:|
| **Single Camera** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi Camera** | ❌ | ⚠️ ¹ | ✅ | ✅ | ✅ |
| **Camera + Screen Share** | ✅ | ⚠️ ² | ✅ | ✅ | ✅ |
| **Media Player** | ✅ | ✅ | ✅ | ✅ | ✅ |

> **⚠️ Notes:**
> - ¹ **Multi Camera** on iOS requires iPhone XR or later, with iOS 13.0 or above.
> - ² **Screen Sharing** on iOS requires additional setup for Broadcast Upload Extension. See [Agora iOS Screen Sharing Documentation](https://docs-legacy.agora.io/en/Video/screensharing_ios?platform=iOS).

### macOS Screen Sharing Permission Troubleshooting

If you can see the screen window icons and thumbnails in the screen sharing list on macOS, but the game displays a black screen after clicking "Start", it means the screen sharing permission has not been properly granted. Follow these steps to resolve the issue:

1. **Stop running the project in Xcode**
2. **Open System Settings** → **Privacy & Security** → **Screen Sharing**
3. **Find** `Agora-Rtc-Extension-Demo-desktop` and **remove it** from the list
4. **Click the plus button (+)** to re-add it, using the following path:
   ```
   <your_project_path>/build/mac/proj/Debug/Agora-Rtc-Extension-Demo-desktop
   ```
5. **Re-run the project in Xcode**
6. **Enter the main scene** and click the **Screen permission button**
7. If the Xcode log shows successful authorization and **no system permission dialog appears**, the permission has been correctly granted
8. You can now enter the screen sharing case to test

> **Note:** If the system still shows a permission dialog, the permission was not properly granted. Please repeat the steps above.

### Quick Start

1. Clone this repository
2. Open the project in Cocos Creator (>= 3.8.8)
3. Run the `main` scene
4. Click the permission buttons to grant device access
5. Select a demo scenario and click "Go" to navigate

---

<a id="中文"></a>

## 中文

### 简介

这是 [Agora RTC Extension for Cocos Creator](https://github.com/xiayangqun/Agora-Rtc-Extension-Demo) 的演示项目，展示了使用 Agora RTC SDK 实现的各种实时通信场景。

### 主场景 (Main Scene)

主场景是应用程序的入口，提供以下功能：

1. **权限申请按钮** — 三个用于申请设备权限的按钮：
   - 📷 **摄像头权限** — 申请访问摄像头，用于视频采集
   - 🎤 **麦克风权限** — 申请访问麦克风，用于音频采集
   - 🖥️ **屏幕共享权限** — 申请访问屏幕共享功能

2. **场景选择** — 包含四个演示场景的列表，选中后点击 "Go" 按钮即可跳转到对应场景。

### 演示场景

| 场景 | 描述 |
|------|------|
| **单摄像头 (Single Camera)** | 使用单个摄像头加入频道，进行一对一或多人视频通话。 |
| **多摄像头 (Multi Camera)** | 使用两个摄像头和两个用户 ID 加入同一频道，实现多摄像头视频通话。适用于需要多个拍摄角度的场景。 |
| **摄像头 + 屏幕共享 (Camera + Screen Share)** | 同时使用摄像头和屏幕共享加入频道。适合演示和远程协作场景。 |
| **媒体播放器 (Media Player)** | 使用媒体播放器加入频道，在进行视频通话的同时向远端用户推送媒体文件流。 |

### 平台支持情况

| 场景 | Android | iOS | Windows | macOS | Chrome Desktop |
|------|:-------:|:---:|:-------:|:-----:|:--------------:|
| **单摄像头 (Single Camera)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **多摄像头 (Multi Camera)** | ❌ | ⚠️ ¹ | ✅ | ✅ | ✅ |
| **摄像头 + 屏幕共享 (Camera + Screen Share)** | ✅ | ⚠️ ² | ✅ | ✅ | ✅ |
| **媒体播放器 (Media Player)** | ✅ | ✅ | ✅ | ✅ | ✅ |

> **⚠️ 说明：**
> - ¹ **多摄像头** 在 iOS 上需要 iPhone XR 或更高机型，且系统版本需 iOS 13.0 或以上。
> - ² **屏幕共享** 在 iOS 上需要额外配置 Broadcast Upload Extension。详见 [Agora iOS 屏幕共享文档](https://docs-legacy.agora.io/en/Video/screensharing_ios?platform=iOS)。

### macOS 屏幕共享权限问题排查

如果在 macOS 上使用屏幕共享功能时，已经获取到了屏幕窗口的图标和缩略图，但点击"开始"后游戏画面显示黑屏，说明屏幕共享权限没有真正授予。请按以下步骤解决：

1. **停止 Xcode 运行**
2. **打开系统设置** → **隐私与安全性** → **屏幕共享**
3. **找到** `Agora-Rtc-Extension-Demo-desktop` **项目**，先将其**删除**
4. **点击加号 (+)** 重新添加，添加路径为：
   ```
   <你的项目路径>/build/mac/proj/Debug/Agora-Rtc-Extension-Demo-desktop
   ```
5. **重新运行 Xcode**
6. **进入 main 场景**，点击 **Screen 授权按钮**
7. 如果 Xcode 日志显示授权成功，且系统**没有弹出任何权限弹窗**，说明权限已正确授予
8. 此时可以进入屏幕共享 case 进行测试

> **注意：** 如果系统仍然弹出权限弹窗，说明权限未正确授予，请重复上述步骤。

### 快速开始

1. 克隆此仓库
2. 使用 Cocos Creator (>= 3.8.8) 打开项目
3. 运行 `main` 场景
4. 点击权限按钮授予设备访问权限
5. 选择一个演示场景，点击 "Go" 跳转

---

## License

This project is for demonstration purposes. See the [Agora RTC Extension](https://github.com/xiayangqun/Agora-Rtc-Extension-Demo) for license information.
