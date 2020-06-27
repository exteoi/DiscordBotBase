var excelFolderId = "13VElyU1xxxz20Ubh9xxxxxxxxxxxxxxx";
var destFolderId  = "1YclJucmxxxNlq1-Ysxxxxxxxxxxxxxxx;
var source_folder = DriveApp.getFolderById(excelFolderId);
var dest_folder   = DriveApp.getFolderById(destFolderId);
var scoreSheetArray = ["POPS&アニメ", "niconico&ボーカロイド", "東方Project", "ゲーム＆バラエティ", "maimai", "オンゲキ＆CHUNITHM", "ReMASTER"];

function scoreUpdate(){
  var oldFileName = "DSPA_orig_old";
  var newFileName = "DSPA_orig_new";
  var excelUrl = "https://docs.google.com/spreadsheets/d/1ccr1yJiRtrR-gnmcvxxxxxxxxxxxxxxxxxxxxxx/export?format=xlsx";
  arrangeSheet(oldFileName, newFileName);
  createSheet(excelUrl, newFileName);
  var oldFileId = DriveApp.getFolderById(destFolderId).getFilesByName(oldFileName).next().getId();
  var newFileId = DriveApp.getFolderById(destFolderId).getFilesByName(newFileName).next().getId();
  sortSheetData(oldFileId, newFileId);
  var scoreData = compareSheetData(oldFileId, newFileId);
  postScoreUpdate(scoreData);
}

function arrangeSheet(oldFileName, newFileName){
  if(DriveApp.getFolderById(destFolderId).getFilesByName(oldFileName).hasNext()){
    DriveApp.getFolderById(destFolderId).getFilesByName(oldFileName).next().setTrashed(true);
  }
  if(DriveApp.getFolderById(destFolderId).getFilesByName(newFileName).hasNext()){
    DriveApp.getFolderById(destFolderId).getFilesByName(newFileName).next().setName(oldFileName);
  }
}

function createSheet(excelUrl, sheetName){
  source_folder.createFile(getExcelBlob(excelUrl));
  var excel_files = source_folder.getFiles();
  if(excel_files.hasNext()) {
    var file = excel_files.next();
    convertToSpreadsheet(file, dest_folder, sheetName);
    file.setTrashed(true);
  }
}

function getExcelBlob(url) {
  var blob = UrlFetchApp.fetch(url).getBlob();
  return blob;
}

function convertToSpreadsheet(file, folder, sheetName) {
  options = {
    title: sheetName,
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [{id: folder.getId()}]
  };
  Drive.Files.insert(options, file.getBlob());
}

function sortSheetData(oldId, newId){
  var oldSS = SpreadsheetApp.openById(oldId);
  var newSS = SpreadsheetApp.openById(newId);
  for(var i = 0; i < scoreSheetArray.length; i++){
    var oldSheet = oldSS.getSheetByName(scoreSheetArray[i]);
    var newSheet = newSS.getSheetByName(scoreSheetArray[i]);
    oldSheet.sort(7);
    newSheet.sort(7);
  }
}

function compareSheetData(oldId, newId){
  var dataArray = [];
  var oldSS = SpreadsheetApp.openById(oldId);
  var newSS = SpreadsheetApp.openById(newId);
  for(var i = 0; i < scoreSheetArray.length; i++){
    var oldSheet = oldSS.getSheetByName(scoreSheetArray[i]);
    var newSheet = newSS.getSheetByName(scoreSheetArray[i]);
    var oldValues = oldSheet.getRange("A:P").getValues();
    var newValues = newSheet.getRange("A:P").getValues();
    var offset = 0;
    for(var j = 0;j < oldValues.length;j++){
      if(newValues[j+offset] === undefined) break;
      if(newValues[j+offset][6] == "" || newValues[j+offset][6] == "name") continue;
      var oldSongName = oldValues[j][6];
      var newSongName = newValues[j+offset][6];
      var oldTeScore = oldValues[j][4]
      var oldTaScore = oldValues[j][5]
      var newTeScore = newValues[j+offset][4];
      var newTaScore = newValues[j+offset][5];
      if(oldTeScore == ""){oldTeScore = 0;}
      if(oldTaScore == ""){oldTaScore = 0;}
      if(newTeScore == ""){newTeScore = 0;}
      if(newTaScore == ""){newTaScore = 0;}
      if(newValues[j][15] == ""){
        newValues[j][15] = newValues[j][14];
      }
      if(oldValues[j][15] == ""){
        oldValues[j][15] = oldValues[j][14];
      }
      var newScoreMax = newValues[j+offset][15];
      var oldScoreMax = oldValues[j][15];
      if(oldSongName != newSongName){
        dataArray.push([newSongName, newScoreMax, 0, 0, newTeScore, newTaScore]);
        offset++;
        j--;
        continue;
      }
      if(oldTeScore != newTeScore || oldTaScore != newTaScore){
        dataArray.push([newSongName, newScoreMax, oldTeScore, oldTaScore, newTeScore, newTaScore]);
      }
    }
  }
  return dataArray;
}

function postScoreUpdate(data){
  var nonce = Math.floor(Math.random()*100000000);
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password+nonce)
               .reduce(function(str,chr){
                 chr = (chr < 0 ? chr + 256 : chr).toString(16);
                 return str + (chr.length==1?'0':'') + chr;
               },'');
  var array = [];
  for(var i = 0; i < data.length; i++){
    var te = "";
    var ta = "";
    if(data[i][4] > data[i][5]){
      te = ":trophy: ";
      ta = "<:blank:722859508204044390> ";
    }else if(data[i][4] < data[i][5]){
      te = "<:blank:722859508204044390> ";
      ta = ":trophy: ";
    }else{
      te = ":trophy: ";
      ta = ":trophy: ";
    }
    var nowtediff = (data[i][4] - data[i][1] == 0)?":star:":data[i][4] - data[i][1];
    te += "て： __" + data[i][4] + "__ (" + nowtediff + ")";
    if(data[i][2] != data[i][4]){ te += "　←　" + data[i][2] + " (" + (data[i][2] - data[i][1]) + ")";}
    var nowtadiff = (data[i][5] - data[i][1] == 0)?":star:":data[i][5] - data[i][1];
    ta += "た： __" + data[i][5] + "__ (" + nowtadiff + ")";
    if(data[i][3] != data[i][5]){ ta += "　←　" + data[i][3] + " (" + (data[i][3] - data[i][1]) + ")";}
    array.push({
      "name": data[i][0] + " (" + data[i][1] + ")",
      "value": te + "\n" + ta + "\n",
      "inline": "False"
    });
  }
  if(array.length > 0){
    var emb = {
      "description": ":fire:「[でらっくスコア大戦](https://1drv.ms/x/xxxxxxxxxxxxxxxxxxxxxxxxx)」更新情報 :fire:",
      "fields": array,
      color: 7506394
    };
    var json = {
      'type':'announce',
      'hash':hash, 
      'nonce':nonce,
      'debug':'false',
      'content': JSON.stringify(emb)
    };
    sendGlitch(GLITCH_URL, json);
  }
}
