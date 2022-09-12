const PORT = 3000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;

async function scheduleScraper() {
    const year = "2022"
    const scheduleURL = "https://www.hockey-reference.com/leagues/NHL_" + year + "_games.html";
    const scheduleArray = [];
    await axios(scheduleURL).then((scheduleResponse) => {
      const schedule_html_data = scheduleResponse.data;
      const $ = cheerio.load(schedule_html_data);
      
      const selectedScheduleElem =
        "#games > tbody > tr";
      const scheduleKeys = [
        "Date",
        "Away",
        "Home",
      ];
      
      $(selectedScheduleElem).each((scheduleParentIndex, scheduleParentElem) => {
        let scheduleKeyIndex = 0;
        const scheduleDetails = {};
        $(scheduleParentElem)
            .children()
            .each((scheduleChildId, scheduleChildElem) => {
                if (scheduleChildId < 4 && scheduleChildId != 2) {
                    var scheduleValue = $(scheduleChildElem).text();

                    if (scheduleValue.startsWith("Anaheim"))            { scheduleValue = "ANA" }
                    else if (scheduleValue.startsWith("Arizona"))       { scheduleValue = "ARI" }
                    else if (scheduleValue.startsWith("Boston"))        { scheduleValue = "BOS" }
                    else if (scheduleValue.startsWith("Buffalo"))       { scheduleValue = "BUF" }
                    else if (scheduleValue.startsWith("Calgary"))       { scheduleValue = "CGY" }
                    else if (scheduleValue.startsWith("Carolina"))      { scheduleValue = "CAR" }
                    else if (scheduleValue.startsWith("Chicago"))       { scheduleValue = "CHI" }
                    else if (scheduleValue.startsWith("Colorado"))      { scheduleValue = "COL" }
                    else if (scheduleValue.startsWith("Columbus"))      { scheduleValue = "CBJ" }
                    else if (scheduleValue.startsWith("Dallas"))        { scheduleValue = "DAL" }
                    else if (scheduleValue.startsWith("Detroit"))       { scheduleValue = "DET" }
                    else if (scheduleValue.startsWith("Edmonton"))      { scheduleValue = "EDM" }
                    else if (scheduleValue.startsWith("Florida"))       { scheduleValue = "FLA" }
                    else if (scheduleValue.startsWith("Los Angeles"))   { scheduleValue = "LAK" }
                    else if (scheduleValue.startsWith("Minnesota"))     { scheduleValue = "MIN" }
                    else if (scheduleValue.startsWith("Montreal"))      { scheduleValue = "MTL" }
                    else if (scheduleValue.startsWith("Nashville"))     { scheduleValue = "NSH" }
                    else if (scheduleValue.startsWith("New Jersey"))    { scheduleValue = "NJD" }
                    else if (scheduleValue.startsWith("New York I"))    { scheduleValue = "NYI" }
                    else if (scheduleValue.startsWith("New York R"))    { scheduleValue = "NYR" }
                    else if (scheduleValue.startsWith("Ottawa"))        { scheduleValue = "OTT" }
                    else if (scheduleValue.startsWith("Philadelphia"))  { scheduleValue = "PHI" }
                    else if (scheduleValue.startsWith("Pittsburgh"))    { scheduleValue = "PIT" }
                    else if (scheduleValue.startsWith("San Jose"))      { scheduleValue = "SJS" }
                    else if (scheduleValue.startsWith("Seattle"))       { scheduleValue = "SEA" }
                    else if (scheduleValue.startsWith("St. Louis"))     { scheduleValue = "STL" }
                    else if (scheduleValue.startsWith("Tampa Bay"))     { scheduleValue = "TBL" }
                    else if (scheduleValue.startsWith("Toronto"))       { scheduleValue = "TOR" }
                    else if (scheduleValue.startsWith("Vancouver"))     { scheduleValue = "VAN" }
                    else if (scheduleValue.startsWith("Vegas"))         { scheduleValue = "VEG" }
                    else if (scheduleValue.startsWith("Washington"))    { scheduleValue = "WPG" }
                    else if (scheduleValue.startsWith("Winnipeg"))      { scheduleValue = "WSH" }

                    scheduleDetails[scheduleKeys[scheduleKeyIndex]] = scheduleValue;
                    scheduleKeyIndex++;
                }
            });
            scheduleArray.push(scheduleDetails);
        });
    });
    
    return scheduleArray;
}
async function insertSchedule() {

    const schedule = await scheduleScraper();
    const dateArray = [];
    const dateKeys = [
        "Date",
        "Games",
    ];
    var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    const client = await MongoClient.connect(url);
    const dbo = client.db("NHL_Schedule");
    var previousDate = "";
    let dateStartIndex = 0;

    for (let i = 0; i < schedule.length; i ++) {
        if (i == 0) {
            previousDate = schedule[i].Date;
        }
        
        if (schedule[i].Date != previousDate) {
            dateArray.push(schedule.slice(dateStartIndex, i));
        }
        
        if (i > 0 && schedule[i - 1].Date != schedule[i].Date) {
            dateStartIndex = i;
        }

        if (i == schedule.length - 1) {
            dateArray.push(schedule.slice(dateStartIndex, i + 1));
        }

        previousDate = schedule[i].Date;
    }

    /*for (const date of dateArray) {
        var day = String(date[0].Date)
        dbo.createCollection(day);
    }

    for (const date of dateArray) {
        var day = String(date[0].Date)
        dbo.collection(day).insertMany(date);
    }
    
    console.log("Schedule inserted.")*/
}

insertSchedule()