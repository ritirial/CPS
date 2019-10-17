let $ = require('jquery')
let fs = require('fs')
require('bootstrap')

currPath = './reposit'

function readPath() {
  console.log(currPath)
  fs.readdir(currPath, (err, dir) => {
    $('#directory_items').html('')
    for (i = 0; i < dir.length; i++) {
      let path = dir[i]
      if (path != '.DS_Store') {
        let itemString = ''
        if (path.includes('.png') || path.includes('.jpg')) {
          filePicture = currPath + '/' + path
          itemString =
            '<div class="list__item">'+
              '<img src="'+filePicture+'" class="item__picture">'+
              '<p class="item__name">'+path+'</p>'+
            '</div>'
        } else {
          itemString =
            '<div onclick="goPath(\''+path+'\')" class="list__item folder">'+
              '<img src="folder.png" class="item__picture">'+
              '<p class="item__name">'+path+'</p>'+
            '</div>'
        }
        $('#directory_items').append(itemString)
      }
    }
    setLinks()
  });
}

function goPathFromLink(newPath) {
  currPath = newPath
  readPath()
}

function goPath(newPath) {
  currPath = currPath + '/' + newPath
  readPath()
}

function setLinks() {
  $('#addressLinks').html(
    '<li class="breadcrumb-item">REPOSIT</li>'+
    '<li class="breadcrumb-item">BUFFALO</li>')
  folders = currPath.split('/')
  i = 3
  if (i > folders.length) { //main directory is current address
    $('#addressLinks').append('<li class="breadcrumb-item active">IMAGES</li>')
  } else { //inside a sub-folder
    $('#addressLinks').append('<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\'./reposit\')">IMAGES</a></li>') //add main address
    for (i = 2; i < folders.length; i++) { //add sub-folders
      crumb = ''
      crumbPath = '.'
      if (i == folders.length - 1) { //last item, no interactivity
        crumb = '<li class="breadcrumb-item active">'+folders[i]+'</li>'
      } else { //mid item, add interactivity
        for (j = 1; j <= i; j++) { //re-assemble path
          crumbPath = crumbPath + '/' + folders[j]
        }
        crumb = '<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\''+crumbPath+'\')">'+folders[i]+'</a></li>'
      }
      $('#addressLinks').append(crumb)
    }
  }
}

function setUpload(place) {
  importString = ''

  if (place == 'Buffalo') {
    importString = '51'
  }

  now = new Date()
  start = new Date(now.getFullYear(), 0, 0)

  importString = importString + now.getFullYear().toString().substring(2)

  diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
  oneDay = 1000 * 60 * 60 * 24
  day = Math.floor(diff / oneDay)

  if (day < 10) {
    day = '00' + day
  } else if (day < 100) {
    day = '0' + day
  }

  importString = importString + day

  console.log(importString)
  $('#importDate').html(importString)
}

function startUpload() {
  $('#exampleModal').modal('hide')
}

function pressFiles() {
  $('#filesInput').trigger('click')
}

$('#filesInput').change(function() {
    console.log(this.files);
});

readPath()

setUpload('Buffalo')

/*
$('#add-to-list').on('click', () => {
   let name = $('#Name').val()
   let email = $('#Email').val()

   fs.appendFile('contacts', name + ',' + email + '\n')

   addEntry(name, email)
})

function addEntry(name, email) {
   if(name && email) {
      sno++
      let updateString = '<tr><td>'+ sno + '</td><td>'+ name +'</td><td>' 
         + email +'</td></tr>'
      $('#contact-table').append(updateString)
   }
}

function loadAndDisplayContacts() {  
   
   //Check if file exists
   if(fs.existsSync(filename)) {
      let data = fs.readFileSync(filename, 'utf8').split('\n')
      
      data.forEach((contact, index) => {
         let [ name, email ] = contact.split(',')
         addEntry(name, email)
      })
   
   } else {
      console.log("File Doesn\'t Exist. Creating new file.")
      fs.writeFile(filename, '', (err) => {
         if(err)
            console.log(err)
      })
   }

   
}

loadAndDisplayContacts()*/