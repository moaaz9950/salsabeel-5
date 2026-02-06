const { app, BrowserWindow, ipcMain, dialog, protocol, session } = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

let mainWindow;

/* ===============================
   App Basic Settings
================================ */
app.setName("Salsabeel");
app.setAppUserModelId("com.salsabeel.app");

app.commandLine.appendSwitch("enable-features", "AllowGeolocationOnInsecureOrigins");
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
// Enable audio autoplay without user gesture
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

/* ===============================
   Helpers
================================ */
function getDistPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app.asar", "dist")
    : path.join(app.getAppPath(), "dist");
}

function getIndexHtml() {
  return path.join(getDistPath(), "index.html");
}

/* ===============================
   Protocols & CORS
================================ */
app.whenReady().then(() => {
  protocol.registerFileProtocol("local", (request, callback) => {
    try {
      const url = request.url.replace("local://", "");
      const filePath = path.join(getDistPath(), url);
      callback({ path: filePath });
    } catch (err) {
      console.error("Protocol error:", err);
      callback({ error: -6 });
    }
  });

  // Register custom protocol for audio files
  protocol.registerFileProtocol('athan-audio', (request, callback) => {
    try {
      const url = request.url.replace('athan-audio://', '');
      const audioPath = path.join(app.getAppPath(), 'public', 'athan-audio', url);
      callback({ path: audioPath });
    } catch (err) {
      console.error('Audio protocol error:', err);
      callback({ error: -6 });
    }
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Access-Control-Allow-Origin": ["*"],
        "Access-Control-Allow-Methods": ["GET, POST, PUT, DELETE, OPTIONS"],
        "Access-Control-Allow-Headers": ["*"],
      },
    });
  });
});

/* ===============================
   Permissions
================================ */
app.on("web-contents-created", (_, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ["geolocation", "notifications", "media", "autoplay"];
    console.log(`Permission requested: ${permission}, allowed: ${allowed.includes(permission)}`);
    callback(allowed.includes(permission));
  });

  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});

/* ===============================
   Create Window
================================ */
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Salsabeel - سلسبيل",
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#f8f4e9",
    icon: path.join(__dirname, "../public/icon.png"),
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      autoplayPolicy: 'no-user-gesture-required',
      webviewTag: false,
      // Enable media features
      enableBlinkFeatures: 'AutoplayIgnoreWebAudio,AutoplayIgnoresWebAudio',
    },
  });

  // Enable hardware acceleration for better audio performance
  mainWindow.setBackgroundColor('#f8f4e9');

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  /* ===============================
     Load App
  ================================ */
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = getIndexHtml();

    if (!fs.existsSync(indexPath)) {
      dialog.showErrorBox(
        "Application Error",
        `index.html not found:\n${indexPath}`
      );
      app.quit();
      return;
    }

    mainWindow.loadFile(indexPath);

    // Enable for debugging
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.removeMenu();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

/* ===============================
   App Events
================================ */
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/* ===============================
   Auto Updater
================================ */
autoUpdater.on("update-available", async (info) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["تحميل التحديث", "لاحقاً"],
    title: "تحديث متوفر",
    message: `نسخة جديدة متاحة (${info.version})`,
  });

  if (result.response === 0) {
    autoUpdater.downloadUpdate();
  }
});

autoUpdater.on("update-downloaded", async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["إعادة التشغيل الآن", "لاحقاً"],
    title: "تحديث جاهز",
    message: "تم تحميل التحديث، هل تريد إعادة التشغيل؟",
  });

  if (result.response === 0) {
    autoUpdater.quitAndInstall();
  }
});

autoUpdater.on("error", (err) => {
  console.error("Updater error:", err);
});

/* ===============================
   IPC
================================ */
ipcMain.handle("get_app_info", () => ({
  version: app.getVersion(),
  name: app.getName(),
  isPackaged: app.isPackaged,
  platform: process.platform,
}));

ipcMain.handle("get-hadith-path", () => {
  return path.join(getDistPath(), "assets");
});

// Handle prayer notifications IPC
ipcMain.handle('prayer-notification-test', async (event, prayerName, prayerTime) => {
  try {
    // Create notification in main process (more reliable)
    if (mainWindow) {
      const notification = {
        title: '🕌 موعد الصلاة',
        body: `حان الآن وقت صلاة ${prayerName} (${prayerTime})`
      };
      
      // Show notification
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: notification.title,
        message: notification.body,
        buttons: ['OK', 'Stop Athan'],
        defaultId: 0,
        cancelId: 1
      });
      
      return { clicked: result.response === 1 };
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
  return null;
});

/* ===============================
   Safety
================================ */
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  dialog.showErrorBox("Unexpected Error", err.message);
});