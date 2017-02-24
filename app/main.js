import path from 'path';
import { app, crashReporter, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import NSEventMonitor from 'nseventmonitor';

// Override appData path to avoid collisions with old client
// New userData path, i.e on macOS: ~/Library/Application Support/mullvad.vpn
const applicationSupportPath = app.getPath('appData');
const userDataPath = path.join(applicationSupportPath, 'mullvad.vpn');
app.setPath('userData', userDataPath);

const isDevelopment = (process.env.NODE_ENV === 'development');

let window = null;
let tray = null;
let macEventMonitor = new NSEventMonitor();

ipcMain.on('changeTrayIcon', (event, name) => {
  const iconPath = path.join(__dirname, './assets/images/tray-icon-' + name + '.png');
  const image = nativeImage.createFromPath(iconPath);
  if(image) {
    tray.setImage(image);
  }
});

// hide dock icon
app.dock.hide();

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  for(const name of extensions) {
    try {
      await installer.default(installer[name], forceDownload);
    } catch (e) {
      console.log(`Error installing ${name} extension: ${e.message}`);
    }
  }
};

const installDevTools = async () => {
  await installExtensions();

    // show devtools when ctrl clicked
  tray.on('click', function () {
    if(!window) { return; }

    if(window.isDevToolsOpened()) {
      // there is a rare bug when isDevToolsOpened() reports true
      // but dev tools window is not created yet.
      if(window.devToolsWebContents) {
        window.devToolsWebContents.focus();
      }
    } else {
      window.openDevTools({ mode: 'detach' });
    }
  });

  // add inspect element on right click menu
  window.webContents.on('context-menu', (e, props) => {
    Menu.buildFromTemplate([{
      label: 'Inspect element',
      click() {
        window.openDevTools({ mode: 'detach' });
        window.inspectElement(props.x, props.y);
      }
    }]).popup(window);
  });
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // position window vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height);

  return { x, y };
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 320, 
    height: 568 + 12, // 12 is the size of transparent area around arrow
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    transparent: true,
    show: false,
    webPreferences: {
      // prevents renderer process code from not running when window is hidden
      backgroundThrottling: false,

      // Enable experimental features
      blinkFeatures: ['CSSBackdropFilter'].join(',')
    }
  });

  window.loadURL('file://' + path.join(__dirname, 'index.html'));

  // hide the window when it loses focus
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });

  window.on('show', () => {
    tray.setHighlightMode('always');

    macEventMonitor.start(() => {
      window.hide();
    });
  });

  window.on('hide', () => {
    tray.setHighlightMode('never');

    macEventMonitor.stop();
  });

};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
};

ipcMain.on('show-window', () => {
  showWindow();
});

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'assets/images/tray-icon-default.png'));
  tray.on('right-click', toggleWindow);
  tray.on('double-click', toggleWindow);
  tray.on('click', toggleWindow);
};

crashReporter.start({
  productName: 'YourName',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  createTray();
  createWindow();

  if(isDevelopment) {
    installDevTools();
  }
});