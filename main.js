const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')

const { ipcMain } = require('electron')

let win  

function createWindow() { 
   win = new BrowserWindow({width: 1024, height: 680}) 
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'index.html'), 
      protocol: 'file:', 
      slashes: true 
   })) 
}  

ipcMain.on('ondragstart', (event, filePath) => {
  event.sender.startDrag({
    file: filePath,
    icon: '/path/to/icon.png'
  })
})

app.on('ready', createWindow)