const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')

let win  

function createWindow() { 
   win = new BrowserWindow({width: 1024, height: 680,webPreferences: {
        nodeIntegration: true
    }}) 
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'index.html'), 
      protocol: 'file:', 
      slashes: true 
   })) 
}  

app.on('ready', createWindow)