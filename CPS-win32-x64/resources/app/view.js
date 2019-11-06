window.$ = window.jQuery = require('jquery'); // not sure if you need this at all
window.Bootstrap = require('bootstrap');

//let $ = require('jquery')

let fs = require('fs');
const os = require('os');
const storage = require('electron-json-storage');
const { dialog } = require('electron').remote

//require('bootstrap')

//get user defined directory
var mainPath = '.';
var currPath = '.';

var newRootPath = "";

var importStringYear = '';
var importStringDay = '';

var uploadFiles = [];

//initialize file input change detection
$('#pathInput').change(function() {
  filePath = $('#pathInput')[0].files[0].path;
  console.log('selected root', filePath);
  $('#newRootPathLabel').html('New root directory: <b>'+filePath+'</b>');
});

//initialize file input change detection
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

$('#importLab').change(function() {
  var newLab = $('#importLab').val();
  storage.set('storeLab', {lab: newLab}, (error) => {
  });
  setUploadFolder();
});


function getRoot() {
  /*
  storage.clear(function(error) {
    if (error) throw error;
  });
  */
  storage.get('storePath', (error, data) => {
    if (!data.path) {
      storage.set('storePath', {path: os.homedir()+'/CPS/IMAGES'}, (error) => {
        storage.get('storePath', (error, data) => {
          //no root specified, make a new one
          var tmpPath = os.homedir();
          //make first default folder
          if (!fs.existsSync(tmpPath+'/CPS')) {
            fs.mkdir(tmpPath+'/CPS', (err) => {
              if (err) {
                console.log('default CPS error', err);
              }
            });
          }
          tmpPath = tmpPath+'/CPS';
          //make second default folder
          if (!fs.existsSync(tmpPath+'/IMAGES')) {
            fs.mkdir(tmpPath+'/IMAGES', (err) => {
              if (err) {
                console.log('default IMAGES error', err);
              }
            });
          }
          tmpPath = tmpPath+'/IMAGES';
          //make bussiness lines folders
          if (!fs.existsSync(tmpPath+'/EL')) {
            fs.mkdir(tmpPath+'/EL', (err) => {
              if (err) {
                console.log('default EL error', err);
              }
            });
          }
          if (!fs.existsSync(tmpPath+'/HBHF')) {
            fs.mkdir(tmpPath+'/HBHF', (err) => {
              if (err) {
                console.log('default HBHF error', err);
              }
            });
          }
          if (!fs.existsSync(tmpPath+'/HL')) {
            fs.mkdir(tmpPath+'/HL', (err) => {
              if (err) {
                console.log('default HL error', err);
              }
            });
          }
          if (!fs.existsSync(tmpPath+'/STF')) {
            fs.mkdir(tmpPath+'/STF', (err) => {
              if (err) {
                console.log('default STF error', err);
              }
            });
          }
          if (!fs.existsSync(tmpPath+'/TY')) {
            fs.mkdir(tmpPath+'/TY', (err) => {
              if (err) {
                console.log('default TY error', err);
              }
            });
          }
          //set new path as main
          mainPath = tmpPath;
          currPath = '.';
          console.log('new root', data);
          //initial call to load the main view
          readPath();
          //prepare upload form with buffalo data
          setUpload();
        });
      });
    } else {
      console.log('stored root', data.path);
      mainPath = data.path;
      currPath = '.';
      //initial call to load the main view
      readPath();
      //prepare upload form with buffalo data
      setUpload();
    }
  });
}

function readPath() {
  var fullPath = mainPath+'/'+currPath;
  console.log('fullPath', fullPath);
  var dir = fs.readdirSync(fullPath);
  $('#directory_items').html('');
  for (i = 0; i < dir.length; i++) {
    let path = dir[i];
    if (path != '.DS_Store') {
      let itemString = '';
      if (path.includes('.png') || path.includes('.jpg')) {
        filePicture = fullPath + '/' + path;
        itemString =
          '<div class="list__item">'+
            '<img src="'+filePicture+'" class="item__picture">'+
            '<p class="item__name">'+path+'</p>'+
          '</div>';
      } else {
        itemString =
          '<div onclick="goPath(\''+path+'\')" class="list__item folder">'+
            '<img src="folder.png" class="item__picture">'+
            '<p class="item__name">'+path+'</p>'+
          '</div>';
      }
      $('#directory_items').append(itemString);
    }
  }
  setLinks();
}

//called on breadcrumbs link click
function goPathFromLink(newPath) {
  currPath = newPath;
  readPath();
}

//called on folder click
function goPath(newPath) {
  if (currPath == '.') {
    currPath = newPath;  
  } else {
    currPath = currPath+'/'+newPath;
  }
  readPath();
}

//set breadcrumbs links
function setLinks() {
  $('#addressLinks').html('');
  i = 0;
  if (currPath == '.') { //on main directory
    $('#addressLinks').append('<li class="breadcrumb-item active">'+mainPath+'</li>');
  } else { //on sub-folder
    $('#addressLinks').append('<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\'.\')">'+mainPath+'</a></li>'); //add main address
    var folders = currPath.split('/');
    for (i = 0; i < folders.length; i++) { //add sub-folders
      crumb = '';
      crumbPath = '.';
      if (i == folders.length - 1) { //last item, no interactivity
        crumb = '<li class="breadcrumb-item active">'+folders[i]+'</li>';
      } else { //mid item, add interactivity
        for (j = 0; j <= i; j++) { //re-assemble path
          crumbPath = crumbPath + '/' + folders[j];
        }
        crumbPath = crumbPath.replace('./', '');
        crumb = '<li class="breadcrumb-item"><a href="#" onclick="goPathFromLink(\''+crumbPath+'\')">'+folders[i]+'</a></li>';
      }
      $('#addressLinks').append(crumb);
    }
  }
}

function setUpload() {
  storage.get('storeLab', (error, data) => {
    if (!data.lab) {
      storage.set('storeLab', {lab: '51'}, (error) => {
        storage.get('storeLab', (error, data2) => {
          $('#importLab').val(data2.lab);
          setUploadFolder();
        });
      });
    } else {
      $('#importLab').val(data.lab);
      setUploadFolder();
    }
  });
}

function setUploadFolder() {

  var importString = '';

  var place = $('#importLab').val();

  importString = place;

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

  $('#importDate').val(importString);
}

function startUploadAction() {
  if ($('#importDate').val().length == 7) {
    $('#folderError').html('');
    startUploadSubmit();
  } else {
    $('#folderError').html('<small>The day folder must have a 7 digits name</small>');
  }
}

//submit file to new directories
function startUploadSubmit() {

  //recalculate sample
  var tmpFolder = $('#importDate').val();
  importStringYear = tmpFolder.substring(0, 4);
  importStringDay = tmpFolder;

  //get files
  var uploadFiles = $('#filesInput')[0].files;;

  //clear submit list
  var inputFiles = [];

  var sampleIndex = $('input[name=sampleRadio]:checked').val();
  if (sampleIndex) {
    console.log('sample', sampleIndex);
    for (i = 0; i < uploadFiles.length; i++) {
      if (i == sampleIndex) {
        inputFiles.unshift(uploadFiles[i]);
      } else {
        inputFiles.push(uploadFiles[i]);      
      }
    }
  } else {
    console.log('no sample');
    for (i = 0; i < uploadFiles.length; i++) {
      inputFiles.push(uploadFiles[i]);      
    }
  }

  //make year dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringYear)) {
    fs.mkdir(mainPath+'/'+importStringYear, (err) => {
      console.log('error',err);
    });
  }

  var sampleNumber = "000" + $('#importSample').val();
  var sampleNumber = sampleNumber.substr(sampleNumber.length-4);
  var importStringSample = importStringDay + sampleNumber;

  //upload pictures to lab-year folder
  for (i = 0; i < inputFiles.length; i++) {
    j = i;
    var sourceName = inputFiles[i].name;

    var count = "_" + Number(i+1);
    //count = count.substr(count.length-3);

    var newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];
    var name1 = 'img'+importStringSample+count+'.jpg';
    var name2 = 'img'+importStringSample+count+'.png';
    var newFileName = mainPath+'/'+importStringYear+'/'+newName;
    var newFileName1 = mainPath+'/'+importStringYear+'/'+name1;
    var newFileName2 = mainPath+'/'+importStringYear+'/'+name2;

    while (fs.existsSync(newFileName1) || fs.existsSync(newFileName2)) {
      j++;
      count = "_" + Number(j+1);
      //count = count.substr(count.length-3);
      newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];
      name1 = 'img'+importStringSample+count+'.jpg';
      name2 = 'img'+importStringSample+count+'.png';
      newFileName = mainPath+'/'+importStringYear+'/'+newName;
      newFileName1 = mainPath+'/'+importStringYear+'/'+name1;
      newFileName2 = mainPath+'/'+importStringYear+'/'+name2;
    }

    copyFile(inputFiles[i].path, newFileName);
  }

  var importStringBussiness = $('#importLine').val();

  //make day dir in bussiness line if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay)) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay, (err) => {
      if (err) {
        console.log('error',err);
      }
    })
  }  

  //make sample dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample)) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample, (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }

  //make photos dir if not exists
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo', (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo', (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Additional_Doc')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Additional_Doc', (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Failure_Photo')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Failure_Photo', (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }
  if (!fs.existsSync(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Result_Table_Doc')) {
    fs.mkdir(mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Result_Table_Doc', (err) => {
      if (err) {
        console.log('error',err);
      }
    });
  }

  //upload pictures to bussiness line sub-folders
  for (i = 0; i < inputFiles.length; i++) {
    var existingCount = 0;
    j = i;
    var count = "0" + Number(i+1);
    count = count.substr(count.length-2);

    var sourceName = inputFiles[i].name;

    if (sampleIndex && i == 0) {
      var newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];
      var name1 = 'img'+importStringSample+count+'.png';
      var name2 = 'img'+importStringSample+count+'.jpg';
      var newFileName = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+newName;
      var fileName1 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+name1;
      var fileName2 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+name2;
      while (fs.existsSync(fileName1) || fs.existsSync(fileName2)) {
        j++;
        count = "0" + Number(j+1);
        count = count.substr(count.length-2);
        newName = 'img'+importStringSample+count+'.'+sourceName.split('.')[1];
        name1 = 'img'+importStringSample+count+'.png';
        name2 = 'img'+importStringSample+count+'.jpg';
        newFileName = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+newName;
        fileName1 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+name1;
        fileName2 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Sample_Photo/'+name2;
      }
      copyFile(inputFiles[i].path, newFileName);
    } else {
      if (i == 0) { //upload woth no sample, start as 2 (initial index in exhibit)
        j = 2;
        count = "0" + j;
        count = count.substr(count.length-2);
      }
      var newName = 'img'+importStringSample+count+'_Labeling.'+sourceName.split('.')[1];
      var name1 = 'img'+importStringSample+count+'_Labeling.png';
      var name2 = 'img'+importStringSample+count+'_Labeling.jpg';
      var newFileName = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+newName;
      var fileName1 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+name1;
      var fileName2 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+name2;
      while (fs.existsSync(fileName1) || fs.existsSync(fileName2)) {
        j++;
        count = "0" + Number(j+1);
        count = count.substr(count.length-2);
        newName = 'img'+importStringSample+count+'_Labeling.'+sourceName.split('.')[1];
        name1 = 'img'+importStringSample+count+'_Labeling.png';
        name2 = 'img'+importStringSample+count+'_Labeling.jpg';
        newFileName = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+newName;
        fileName1 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+name1;
        fileName2 = mainPath+'/'+importStringBussiness+'/'+importStringDay+'/'+importStringSample+'/Exhibit_Photo/'+name2;
      }
      copyFile(inputFiles[i].path, newFileName);
    }
  }

  $('#exampleModal').modal('hide');
  currPath = '.';
  readPath();
}

//open modal and clear inputs
function clearInputs() {
  $('#importSample').val('');
  $('#importLine').val('EL');
  $('#filesInput').val('');
  $('#filesTable').html('');
  $('#folderError').html('');
  setUpload();
}

function clearRootInputs() {
  $('#rootPathLabel').html(mainPath);
  $('#filesInput').val('');
  newRootPath = "";
  $('#newRootPathLabel').html('');
}

function changeMainDirectory() {
  newRootPath = dialog.showOpenDialogSync({
    properties: ['openDirectory']
  });
  console.log('new path', newRootPath);
  $('#newRootPathLabel').html('New root directory: <b>'+newRootPath+'</b>');

  //$('#pathInput').trigger('click');  
}

//remote call the input
function pressFiles() {
  $('#filesInput').trigger('click');
}

function confirmNewRoot() {
  console.log('changing root', newRootPath);
  if (newRootPath != "") {
    var filePath = newRootPath;

    //make bussiness lines folders
    if (!fs.existsSync(filePath+'/EL')) {
      fs.mkdir(filePath+'/EL', (error) => {
        if (error) {
          console.log('updated EL error', error);
        }
      });
    }
    if (!fs.existsSync(filePath+'/HBHF')) {
      fs.mkdir(filePath+'/HBHF', (error) => {
        if (error) {
          console.log('updated HBHF error', error);
        }
      });
    }
    if (!fs.existsSync(filePath+'/HL')) {
      fs.mkdir(filePath+'/HL', (error) => {
        if (error) {
          console.log('updated HL error', error);
        }
      });
    }
    if (!fs.existsSync(filePath+'/STF')) {
      fs.mkdir(filePath+'/STF', (error) => {
        if (error) {
          console.log('updated STF error', error);
        }
      });
    }
    if (!fs.existsSync(filePath+'/TY')) {
      fs.mkdir(filePath+'/TY', (error) => {
        if (error) {
          console.log('updated TY error', error);
        }
      });
    }

    //make lab-year folder
    if (!fs.existsSync(filePath+'/'+importStringYear)) {
      fs.mkdir(filePath+'/'+importStringYear, (error) => {
        if (error) {
          console.log('updated TY error', error);
        }
      });
    }

    //set new path as main
    mainPath = filePath;
    currPath = '.';
    storage.set('storePath', {path: mainPath}, (error) => {
        if (error) {
          console.log('updated storage error', error);
        }
    });

    //initial call to load the main view
    readPath();
    //prepare upload form with buffalo data
    setUpload();

    $('#pathConfirmModal').modal('hide');
  } else {
    $('#newRootPathLabel').html('<b class="text-danger">No directory has been selected as the new root</b>');
  }
}

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

getRoot();  
