// apps-script/Code.gs
// This acts as a dumb relay to store match state in a Google Sheet.
// Sheet structure: Column A = matchId, Column B = state (JSON string), Column C = lastUpdated

const SHEET_NAME = "Matches";

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Farel Admin')
      .addItem('Abrir Painel', 'showAdminSidebar')
      .addItem('Executar Setup Inicial', 'setupConfig')
      .addToUi();
}

function showAdminSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('AdminSidebar')
      .setTitle('Farel - Game Admin')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function setupConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  var headers = [["Match ID", "State JSON", "Last Updated"]];
  var range = sheet.getRange(1, 1, 1, 3);
  range.setValues(headers);
  range.setFontWeight("bold");
  range.setBackground("#4F46E5"); 
  range.setFontColor("#FFFFFF");
  
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 400);
  sheet.setColumnWidth(3, 150);
  
  SpreadsheetApp.getUi().alert("Setup Concluído! Planilha pronta.");
}

function getActiveMatches() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if(!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var matches = [];
  for (var i = 1; i < data.length; i++) {
    matches.push({
      id: data[i][0],
      updated: data[i][2]
    });
  }
  return matches;
}

function clearAllMatches() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if(!sheet) return false;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  }
  return true;
}

function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    sheet.appendRow(["matchId", "state", "lastUpdated"]);
  }
  return sheet;
}

function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var payload = request.payload;
    
    var response = { success: false, error: "Unknown action" };
    
    if (action === "CREATE_MATCH") {
      response = createMatch(payload);
    } else if (action === "JOIN_MATCH") {
      response = joinMatch(payload);
    } else if (action === "SUBMIT_ACTION") {
      response = submitAction(payload);
    } else if (action === "POLL_STATE") {
      response = pollState(payload);
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createMatch(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  var initialState = payload.state;
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([matchId, JSON.stringify(initialState), timestamp]);
  
  return { success: true, matchId: matchId };
}

function joinMatch(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  var newState = payload.state;
  var timestamp = new Date().toISOString();
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(newState));
      sheet.getRange(i + 1, 3).setValue(timestamp);
      return { success: true, matchId: matchId, state: newState };
    }
  }
  
  return { success: false, error: "Match not found" };
}

function submitAction(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  var newState = payload.newState;
  var timestamp = new Date().toISOString();
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(newState));
      sheet.getRange(i + 1, 3).setValue(timestamp);
      return { success: true };
    }
  }
  
  return { success: false, error: "Match not found" };
}

function pollState(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      var stateStr = data[i][1];
      return { success: true, state: JSON.parse(stateStr) };
    }
  }
  
  return { success: false, error: "Match not found" };
}
