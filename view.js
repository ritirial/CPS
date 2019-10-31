let $ = require('jquery')
let fs = require('fs')
require('bootstrap')

currPath = './reposit'

importStringYear = ''
importStringDay = ''

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

  //location
  if (place == 'Buffalo') {
    importString = '51'
  }

  now = new Date()
  start = new Date(now.getFullYear(), 0, 0)

  //year
  importString = importString + now.getFullYear().toString().substring(2)
  importStringYear = importString

  diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
  oneDay = 1000 * 60 * 60 * 24
  day = Math.floor(diff / oneDay)

  if (day < 10) {
    day = '00' + day
  } else if (day < 100) {
    day = '0' + day
  }

  //day
  importString = importString + day
  importStringDay = importString

  $('#importDate').html(importString)
}

//submit file to new directories
function startUpload() {
  //get files
  inputFiles = $('#filesInput')[0].files

  //make year dir if not exists
  if (!fs.existsSync('./reposit/'+importStringYear)) {
    fs.mkdir('./reposit/'+importStringYear)
  }

  //make day dir if not exists
  if (!fs.existsSync('./reposit/'+importStringYear+'/'+importStringDay)) {
    fs.mkdir('./reposit/'+importStringYear+'/'+importStringDay)
  }

  var importStringSample = importStringDay + $('#importSample').val()

  //make sample dir if not exists
  if (!fs.existsSync('./reposit/'+importStringYear+'/'+importStringDay+'/'+importStringSample)) {
    fs.mkdir('./reposit/'+importStringYear+'/'+importStringDay+'/'+importStringSample)
  }

  for (i = 0; i < inputFiles.length; i++) {
    sourceName = inputFiles[0].name

    var count = "00" + Number(i+1);
    count = count.substr(count.length-3);

    newName = 'img'+importStringSample+count+'_Labeling.'+sourceName.split('.')[1]

    copyFile(inputFiles[i].path, './reposit/'+importStringYear+'/'+importStringDay+'/'+importStringSample+'/'+newName)
  }

  $('#exampleModal').modal('hide')
  $('#filesInput').val('')
}

//remote call the input
function pressFiles() {
  $('#filesInput').trigger('click')
}

//show selected files in a list
$('#filesInput').change(function() {

});

function copyFile(source, target) {
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  return new Promise(function(resolve, reject) {
    rd.on('error', reject);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  }).catch(function(error) {
    rd.destroy();
    wr.end();
    throw error;
  });
}

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