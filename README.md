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
| **Camera + Screen Share** | ✅ | ⚠️ ² | ✅ | ⚠️ ³ | ✅ |
| **Media Player** | ✅ | ✅ | ✅ | ✅ | ✅ |

> **⚠️ Notes:**
> - ¹ **Multi Camera** on iOS requires iPhone XR or later, with iOS 13.0 or above.
> - ² **Screen Sharing** on iOS requires additional setup for Broadcast Upload Extension. See [Agora iOS Screen Sharing Documentation](https://docs-legacy.agora.io/en/Video/screensharing_ios?platform=iOS).
> - ³ **Screen Sharing on macOS**: If you can see the screen window icons and thumbnails but get a black screen after clicking "Start", the permission was not properly granted. To fix: Stop Xcode → System Settings → Privacy & Security → Screen Sharing → Remove `Agora-Rtc-Extension-Demo-desktop` → Click (+) to re-add from `<your_project_path>/build/mac/proj/Debug/Agora-Rtc-Extension-Demo-desktop` → Re-run Xcode → Enter main scene → Click Screen permission button → If Xcode log shows success and no system dialog appears, permission is granted.

### Quick Start

1. Clone this repository
2. Clone the [Agora RTC Extension](https://github.com/xiayangqun/agora-rtc-extension-for-cocos-creator) plugin into the `extensions` directory and checkout the `main` branch:
   ```bash
   cd extensions
   git clone https://github.com/xiayangqun/agora-rtc-extension-for-cocos-creator.git
   cd agora-rtc-extension-for-cocos-creator
   git checkout main
   ```
3. Build the Agora RTC Extension plugin:
   ```bash
   cd extensions/agora-rtc-extension-for-cocos-creator
   npm install
   npm run build
   ```
4. Build the native permissions plugin:
   ```bash
   cd extensions/agora-demo-native-permissions
   npm install
   npm run build
   ```
5. Open the project in Cocos Creator, go to **Extensions** panel, click **Refresh**, and **activate both plugins**
6. Edit `assets/resources/appid.json` to configure your Agora App ID and Token:
   ```json
   {
     "appId": "YOUR_APP_ID",
     "token": "YOUR_TOKEN"
   }
   ```
   Get your App ID and Token from the [Agora Console](https://console.agora.io/)
7. Run the `main` scene
8. Click the permission buttons to grant device access
9. Select a demo scenario and click "Go" to navigate

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
| **摄像头 + 屏幕共享 (Camera + Screen Share)** | ✅ | ⚠️ ² | ✅ | ⚠️ ³ | ✅ |
| **媒体播放器 (Media Player)** | ✅ | ✅ | ✅ | ✅ | ✅ |

> **⚠️ 说明：**
> - ¹ **多摄像头** 在 iOS 上需要 iPhone XR 或更高机型，且系统版本需 iOS 13.0 或以上。
> - ² **屏幕共享** 在 iOS 上需要额外配置 Broadcast Upload Extension。详见 [Agora iOS 屏幕共享文档](https://docs-legacy.agora.io/en/Video/screensharing_ios?platform=iOS)。
> - ³ **macOS 屏幕共享**：如果已获取屏幕窗口图标和缩略图，但点击"开始"后显示黑屏，说明权限未正确授予。解决方法：停止 Xcode → 系统设置 → 隐私与安全性 → 屏幕共享 → 删除 `Agora-Rtc-Extension-Demo-desktop` → 点击 (+) 重新添加，路径为 `<你的项目路径>/build/mac/proj/Debug/Agora-Rtc-Extension-Demo-desktop` → 重新运行 Xcode → 进入 main 场景 → 点击 Screen 授权按钮 → 若 Xcode 日志显示成功且无系统弹窗，则权限已授予。

### 快速开始

1. 克隆此仓库
2. 克隆 [Agora RTC Extension](https://github.com/xiayangqun/agora-rtc-extension-for-cocos-creator) 插件到项目的 `extensions` 目录下，并检出 `main` 分支：
   ```bash
   cd extensions
   git clone https://github.com/xiayangqun/agora-rtc-extension-for-cocos-creator.git
   cd agora-rtc-extension-for-cocos-creator
   git checkout main
   ```
3. 构建 Agora RTC Extension 插件：
   ```bash
   cd extensions/agora-rtc-extension-for-cocos-creator
   npm install
   npm run build
   ```
4. 构建原生权限插件：
   ```bash
   cd extensions/agora-demo-native-permissions
   npm install
   npm run build
   ```
5. 使用 Cocos Creator 打开项目，进入**扩展**面板，点击**刷新**，**激活两个插件**
6. 修改 `assets/resources/appid.json` 配置你的 Agora App ID 和 Token：
   ```json
   {
     "appId": "YOUR_APP_ID",
     "token": "YOUR_TOKEN"
   }
   ```
   从 [Agora Console](https://console.shengwang.cn/) 获取你的 App ID 和 Token
7. 运行 `main` 场景
8. 点击权限按钮授予设备访问权限
9. 选择一个演示场景，点击 "Go" 跳转

---

## License

This project is for demonstration purposes. See the [Agora RTC Extension](https://github.com/xiayangqun/Agora-Rtc-Extension-Demo) for license information.
