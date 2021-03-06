// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
let ooto;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: ""
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  setTimeout(function(){
    setupModLoader();
  }, 1000);

}

function setupModLoader() {
  ooto = require('./OotModLoader')
  let event_reg = function (id) {
    ooto.api.registerEventHandler(id, function (event) {
      console.log(event)
      if (mainWindow !== null) {
        mainWindow.webContents.send(event.id, event);
      }
    });
  }
  event_reg("onBizHawkInstall");
  event_reg("GUI_StartFailed");
  event_reg("GUI_BadVersion");
  ipcMain.on('postEvent', (event, arg) => {
    console.log(arg);
    ooto.api.postEvent(arg);
  })
  if (ooto !== null) {
    setTimeout(function () {
      if (mainWindow !== null) {
        mainWindow.webContents.send("GUI_ConfigLoaded", ooto);
      }
    }, 1000);
  }
  setInterval(function () {
    if (ooto.console.length > 0) {
      if (mainWindow !== null) {
        mainWindow.webContents.send("onConsoleMessage", { id: "onConsoleMessage", msg: ooto.console.shift() })
      }
    }
  }, 100);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
