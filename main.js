const{app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');


const packagePath = path.join(__dirname, 'data', 'packageTemplate.json');
const bookingPath = path.join(__dirname, 'data', 'bookings.json');
let mainWindow;
let bookingWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences:{
          nodeIntegration: true,
          contextIsolation: false,
        },
    });
    mainWindow.loadFile(`renderer/index.html`);
}

function createBookingWindow(country){
    bookingWindow = new BrowserWindow({
        width : 900,
        height : 700,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    bookingWindow.loadFile('renderer/booking.html');
    bookingWindow.webContents.on('did-finish-load', () =>{
        bookingWindow.webContents.send('country-selected', country);
    });
}

app.whenReady().then(() =>{
  createMainWindow()
});


//read from packageTemplate.json
ipcMain.handle('display-packages', async () => {
    if(fs.existsSync(packagePath)){
        return JSON.parse(fs.readFileSync(packagePath));
    }
    else return [];
});


//read from bookings.json
ipcMain.handle('display-bookings', async () =>{
    if(fs.existsSync(bookingPath)){
        return JSON.parse(fs.readFileSync(bookingPath));
    }
    else return [];
});


//open booking window
ipcMain.on("open-booking-window", (event, country) => {
     createBookingWindow(country);
});

