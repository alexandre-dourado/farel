// apps-script/Code.gs
// This acts as a dumb relay to store match state in a Google Sheet.
// Sheet structure: Column A = matchId, Column B = state (JSON string)

const SHEET_NAME = "Matches";

function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    sheet.appendRow(["matchId", "state"]);
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
  
  sheet.appendRow([matchId, JSON.stringify(initialState)]);
  
  return { success: true, matchId: matchId };
}

function joinMatch(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  var newState = payload.state;
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(newState));
      return { success: true, matchId: matchId, state: newState };
    }
  }
  
  return { success: false, error: "Match not found" };
}

function submitAction(payload) {
  var sheet = getSheet();
  var matchId = payload.matchId;
  var newState = payload.newState;
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(newState));
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
