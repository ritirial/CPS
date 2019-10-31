let $ = require('jquery')
let fs = require('fs')
require('bootstrap')

var mainPath = './reposit';
var currPath = './reposit';

if (fs.existsSync('R:/CPS/BUFFALO/IMAGES')) {
  console.log('has requested path');
  mainPath = 'R:/CPS/BUFFALO/IMAGES';
  currPath = 'R:/CPS/BUFFALO/IMAGES';
} else {
  console.log('using local path');
}

var importStringYear = '';
var importStringDay = '';

var uploadFiles = [];

function readPath() {
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
        $('#directory_items').append(itemString);
      }
    }
    setLinks();
  });
}

function goPathFromLink(newPath) {
  currPath = newPath;
  readPath();
}

function goPath(newPath) {
  currPath = currPath + '/' + newPath;
  readPath();
}

//set navbar links
function setLinks() {
  $('#addressLinks').html('<li class="breadcrumb-item">R:</li><li class="breadcrumb-item">CPS</li><li class="breadcrumb-item">BUFFALO</li>');
  folders = currPath.split('/');
  i = 3;
  if (i > folders.length) { //main directory is current address
    $('#addressLinks').append('<li class="breadcrumb-item active">IMAGES</li>');
  } else { //inside a sub-folder
    $('#addressLinks').append('<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\'./reposit\')">IMAGES</a></li>'); //add main address
    for (i = 2; i < folders.length; i++) { //add sub-folders
      crumb = '';
      crumbPath = '.';
      if (i == folders.length - 1) { //last item, no interactivity
        crumb = '<li class="breadcrumb-item active">'+folders[i]+'</li>';
      } else { //mid item, add interactivity
        for (j = 1; j <= i; j++) { //re-assemble path
          crumbPath = crumbPath + '/' + folders[j];
        }
        crumb = '<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\''+crumbPath+'\')">'+folders[i]+'</a></li>';
      }
      $('#addressLinks').append(crumb);
    }
  }
}

function setUpload(place) {
  var importString = '';

  //location
  if (place == 'Buffalo') {
    importString = '51';
  }

  now = new Date();
  start = new Date(now.getFullYear(), 0, 0);

  //year
  importString = importString + now.getFullYear().toString().substring(2);
  importStringYear = importString;

  diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  oneDay = 1000 * 60 * 60 * 24;

  day = '00' + Math.floor(diff / oneDay);
  day = day.substr(day.length-3);

  //day
  importString = importString + day;
  importStringDay = importString;

  $('#importDate').html(importString);
}

function startUploadAction() {
  startUploadSubmit();
}

//submit file to new directories
function startUploadSubmit() {
  //get files
  var uploadFiles = $('#filesInput')[0].files;;

  //clear submit list
  var inputFiles = [];

  var sampleIndex = $('input[name=sampleRadio]:checked').val();
  for (i = 0; i < uploadFiles.length; i++) {
    if (i == sampleIndex) {
      inputFiles.unshift(uploadFiles[i]);
    } else {
      inputFiles.push(uploadFiles[i]);      
    }
  }

  //make year dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringYear)) {
    fs.mkdir(mainPath+'/'+importStringYear, (err) => {
      console.log('error',err);
    })
  }

  var sampleNumber = "000" + $('#importSample').val();
  var sampleNumber = sampleNumber.substr(sampleNumber.length-4);
  var importStringSample = importStringDay + sampleNumber;

  //upload pictures to buffalo-year folder
  for (i = 0; i < inputFiles.length; i++) {
    var sourceName = inputFiles[i].name;

    var count = "_" + Number(i+1);
    //count = count.substr(count.length-3);

    var newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];

    copyFile(inputFiles[i].path, mainPath+'/'+importStringYear+'/'+newName);
  }

  var importStringBussiness = $('#importLine').val();

  //make day dir in bussiness line if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay)) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay, (err) => {
      console.log('error',err);
    })
  }  

  //make sample dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample)) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample, (err) => {
      console.log('error',err);
    });
  }

  //make photos dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo', (err) => {
      console.log('error',err);
    });
  }
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo', (err) => {
      console.log('error',err);
    });
  }

  //upload pictures to bussiness line sub-folders
  for (i = 0; i < inputFiles.length; i++) {
    var count = "0" + Number(i+1);
    count = count.substr(count.length-2);

    var sourceName = inputFiles[i].name;

    if (i == 0) {
      var newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];
      copyFile(inputFiles[i].path, mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+newName);
    } else {
      var newName = 'img'+importStringSample+count+'_Labeling.'+sourceName.split('.')[1];
      copyFile(inputFiles[i].path, mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+newName);
    }
  }

  $('#exampleModal').modal('hide');
}

//open modal and clear inputs
function clearInputs() {
  $('#importSample').val('');
  $('#importLine').val('EL');
  $('#filesInput').val('');
  $('#filesTable').html('');
}

//remote call the input
function pressFiles() {
  $('#filesInput').trigger('click');
}

//has detected new files in the 
$('#filesInput').change(function() {
  var tableString = '';

  var inputFiles = $('#filesInput')[0].files;

  if (inputFiles.length > 0) {
    tableString = '<thead><tr><td class="center">Selected file</td><td class="center">Sample</td></tr></thead><tbody>';
  
    for(i = 0; i < inputFiles.length; i++) {
      tableString += '<tr><td>'+inputFiles[i].name+'</td><td class="center"><div class="form-check-inline"><label class="form-check-label"><input type="radio" class="form-check-input" name="sampleRadio" value="'+i+'"></label></div></td></tr>';
    }

    tableString += '</tbody>';
  }
    
  $('#filesTable').html(tableString);
});

//copy data from origin path to target path
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

//initial call to load the main view
readPath();

//prepare upload form with buffalo data
setUpload('Buffalo');
