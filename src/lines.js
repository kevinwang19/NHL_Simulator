/*const MongoClient = require('mongodb').MongoClient;

async function simulateSeason() {
    let allDates = [];
    var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    const client = await MongoClient.connect(url);
    const dbo = client.db("NHL_Schedule");

    dbo.listCollections().toArray(function(err, collections) {
        if(err) console.log(err);

        collections.forEach(eachCollectionDetails => {
            allDates.push(eachCollectionDetails.name);
        });

        allDates.sort();
        simulateDays(allDates);
        //console.log(allDates)

        client.close();
     });
     //console.log(allDates)
}

async function simulateDays(dates) {
    var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    const client = await MongoClient.connect(url);
    const dbo = client.db("NHL_Schedule");
    var allGames;
    
    for (const date of dates) {
        allGames = await dbo.collection(date).find({}).toArray();
        
        simulateGames(allGames);
    }

    client.close();
}

async function simulateGames(games) {
    var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    const client = await MongoClient.connect(url);
    const dbo = client.db("NHL_Lines");
    var awayTeam;
    var homeTeam;
    var awayFwdLine1, awayFwdLine2, awayFwdLine3, awayFwdLine4;
    var awayDefLine1, awayDefLine2, awayDefLine3;
    var awayGoalie1, awayGoalie2;
    var homeFwdLine1, homeFwdLine2, homeFwdLine2, homeFwdLine2;
    var homeDefLine1, homeDefLine2, homeDefLine3;
    var homeGoalie1, homeGoalie2;
    var goalsScored;
    let goalsScoredProbability = [0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,4];
    let awayFwdLineOnIce = 1, awayDefLineOnIce = 1;
    let homeFwdLineOnIce = 1, homeDefLineOnIce = 1;
    let fwdLineProbability = [1,1,1,1,2,2,2,3,3,4];
    let defLineProbability = [1,1,1,1,2,2,2,3,3];
    var awayGoalieStartingChance, homeGoalieStartingChance;
    var awayStartingGoalie, homeStartingGoalie;
    let awayOnIceOffensiveRating = 0, homeOnIceOffensiveRating = 0;
    let awayOnIceDefensiveRating = 0, homeOnIceDefensiveRating = 0;


    for (const game of games) {
        awayTeam = await dbo.collection(game.Away).find({}).toArray();
        homeTeam = await dbo.collection(game.Home).find({}).toArray();

        awayFwdLine1 = awayTeam[0].Forwards.slice(0, 3);
        awayFwdLine2 = awayTeam[0].Forwards.slice(3, 6);
        awayFwdLine3 = awayTeam[0].Forwards.slice(6, 9);
        awayFwdLine4 = awayTeam[0].Forwards.slice(9, 12);
        awayDefLine1 = awayTeam[0].Defensemen.slice(0, 2);
        awayDefLine2 = awayTeam[0].Defensemen.slice(2, 4);
        awayDefLine3 = awayTeam[0].Defensemen.slice(4, 6);
        awayGoalie1 = awayTeam[0].Goalies.slice(0, 1);
        awayGoalie2 = awayTeam[0].Goalies.slice(1, 2);

        homeFwdLine1 = homeTeam[0].Forwards.slice(0, 3);
        homeFwdLine2 = homeTeam[0].Forwards.slice(3, 6);
        homeFwdLine3 = homeTeam[0].Forwards.slice(6, 9);
        homeFwdLine4 = homeTeam[0].Forwards.slice(9, 12);
        homeDefLine1 = homeTeam[0].Defensemen.slice(0, 2);
        homeDefLine2 = homeTeam[0].Defensemen.slice(2, 4);
        homeDefLine3 = homeTeam[0].Defensemen.slice(4, 6);
        homeGoalie1 = homeTeam[0].Goalies.slice(0, 1);
        homeGoalie2 = homeTeam[0].Goalies.slice(1, 2);

        awayGoalieStartingChance = Number(awayGoalie1[0].GoalieRating)*1.25 / (Number(awayGoalie1[0].GoalieRating) + Number(awayGoalie2[0].GoalieRating));
        if (Math.random() <= awayGoalieStartingChance) { awayStartingGoalie = awayGoalie1; }
        else { awayStartingGoalie = awayGoalie2; }
        homeGoalieStartingChance = Number(homeGoalie1[0].GoalieRating)*1.25 / (Number(homeGoalie1[0].GoalieRating) + Number(homeGoalie2[0].GoalieRating));
        if (Math.random() <= homeGoalieStartingChance) { homeStartingGoalie = homeGoalie1; }
        else { homeStartingGoalie = homeGoalie2; }

        for (let period = 1; period <= 3; period ++) {
            goalsScored = goalsScoredProbability[Math.floor(Math.random()*goalsScoredProbability.length)];
            for (let goal = 1; goal <= goalsScored; goal ++) {
                awayFwdLineOnIce = fwdLineProbability[Math.floor(Math.random()*fwdLineProbability.length)];
                awayDefLineOnIce = defLineProbability[Math.floor(Math.random()*defLineProbability.length)];
                homeFwdLineOnIce = fwdLineProbability[Math.floor(Math.random()*fwdLineProbability.length)];
                homeDefLineOnIce = defLineProbability[Math.floor(Math.random()*defLineProbability.length)];
                awayOnIceOffensiveRating = 0;
                awayOnIceDefensiveRating = 0;
                homeOnIceOffensiveRating = 0;
                homeOnIceDefensiveRating = 0;

                switch (awayFwdLineOnIce) {
                    case 1:
                        awayOnIceOffensiveRating += Number(awayFwdLine1[0].OffensiveRating) + Number(awayFwdLine1[1].OffensiveRating) + Number(awayFwdLine1[2].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayFwdLine1[0].DefensiveRating) + Number(awayFwdLine1[1].DefensiveRating) + Number(awayFwdLine1[2].DefensiveRating);
                        break;
                    case 2:
                        awayOnIceOffensiveRating += Number(awayFwdLine2[0].OffensiveRating) + Number(awayFwdLine2[1].OffensiveRating) + Number(awayFwdLine2[2].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayFwdLine2[0].DefensiveRating) + Number(awayFwdLine2[1].DefensiveRating) + Number(awayFwdLine2[2].DefensiveRating);
                        break;
                    case 3:
                        awayOnIceOffensiveRating += Number(awayFwdLine3[0].OffensiveRating) + Number(awayFwdLine3[1].OffensiveRating) + Number(awayFwdLine3[2].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayFwdLine3[0].DefensiveRating) + Number(awayFwdLine3[1].DefensiveRating) + Number(awayFwdLine3[2].DefensiveRating);
                        break;
                    case 4:
                        awayOnIceOffensiveRating += Number(awayFwdLine4[0].OffensiveRating) + Number(awayFwdLine4[1].OffensiveRating) + Number(awayFwdLine4[2].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayFwdLine4[0].DefensiveRating) + Number(awayFwdLine4[1].DefensiveRating) + Number(awayFwdLine4[2].DefensiveRating);
                        break;
                    default:
                }

                switch (awayDefLineOnIce) {
                    case 1:
                        awayOnIceOffensiveRating += Number(awayDefLine1[0].OffensiveRating) + Number(awayDefLine1[1].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayDefLine1[0].DefensiveRating) + Number(awayDefLine1[1].DefensiveRating);
                        break;
                    case 2:
                        awayOnIceOffensiveRating += Number(awayDefLine2[0].OffensiveRating) + Number(awayDefLine2[1].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayDefLine2[0].DefensiveRating) + Number(awayDefLine2[1].DefensiveRating);
                        break;
                    case 3:
                        awayOnIceOffensiveRating += Number(awayDefLine3[0].OffensiveRating) + Number(awayDefLine3[1].OffensiveRating);
                        awayOnIceDefensiveRating += Number(awayDefLine3[0].DefensiveRating) + Number(awayDefLine3[1].DefensiveRating);
                        break;
                    default:
                }

                switch (homeFwdLineOnIce) {
                    case 1:
                        homeOnIceOffensiveRating += Number(homeFwdLine1[0].OffensiveRating) + Number(homeFwdLine1[1].OffensiveRating) + Number(homeFwdLine1[2].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeFwdLine1[0].DefensiveRating) + Number(homeFwdLine1[1].DefensiveRating) + Number(homeFwdLine1[2].DefensiveRating);
                        break;
                    case 2:
                        homeOnIceOffensiveRating += Number(homeFwdLine2[0].OffensiveRating) + Number(homeFwdLine2[1].OffensiveRating) + Number(homeFwdLine2[2].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeFwdLine2[0].DefensiveRating) + Number(homeFwdLine2[1].DefensiveRating) + Number(homeFwdLine2[2].DefensiveRating);
                        break;
                    case 3:
                        homeOnIceOffensiveRating += Number(homeFwdLine3[0].OffensiveRating) + Number(homeFwdLine3[1].OffensiveRating) + Number(homeFwdLine3[2].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeFwdLine3[0].DefensiveRating) + Number(homeFwdLine3[1].DefensiveRating) + Number(homeFwdLine3[2].DefensiveRating);
                        break;
                    case 4:
                        homeOnIceOffensiveRating += Number(homeFwdLine4[0].OffensiveRating) + Number(homeFwdLine4[1].OffensiveRating) + Number(homeFwdLine4[2].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeFwdLine4[0].DefensiveRating) + Number(homeFwdLine4[1].DefensiveRating) + Number(homeFwdLine4[2].DefensiveRating);
                        break;
                    default:
                }

                switch (homeDefLineOnIce) {
                    case 1:
                        homeOnIceOffensiveRating += Number(homeDefLine1[0].OffensiveRating) + Number(homeDefLine1[1].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeDefLine1[0].DefensiveRating) + Number(homeDefLine1[1].DefensiveRating);
                        break;
                    case 2:
                        homeOnIceOffensiveRating += Number(homeDefLine2[0].OffensiveRating) + Number(homeDefLine2[1].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeDefLine2[0].DefensiveRating) + Number(homeDefLine2[1].DefensiveRating);
                        break;
                    case 3:
                        homeOnIceOffensiveRating += Number(homeDefLine3[0].OffensiveRating) + Number(homeDefLine3[1].OffensiveRating);
                        homeOnIceDefensiveRating += Number(homeDefLine3[0].DefensiveRating) + Number(homeDefLine3[1].DefensiveRating);
                        break;
                    default:
                }

                awayOnIceDefensiveRating += Number(awayStartingGoalie[0].GoalieRating);
                homeOnIceDefensiveRating += Number(homeStartingGoalie[0].GoalieRating);

                console.log(game.Away)
                console.log(awayFwdLineOnIce)
                console.log(awayDefLineOnIce)
                console.log(awayOnIceOffensiveRating)
                console.log(awayOnIceDefensiveRating)
                console.log(game.Home)
                console.log(homeFwdLineOnIce)
                console.log(homeFwdLineOnIce)
                console.log(homeOnIceOffensiveRating)
                console.log(homeOnIceDefensiveRating)
                console.log("")

            }
        }
    }
    
    client.close();
}

simulateSeason()*/


const ratings = require("./ratings");
const MongoClient = require('mongodb').MongoClient;

let forwardsRatingsArray = [];
let defenseRatingsArray = [];
let goaliesRatingsArray = [];
let forwardsArray = [];
let defenseArray = [];
let goaliesArray = [];
let index = 0;
let totalRating = 0;
var temp = "";
var temp2 = "";

var lineDetails = {};
const positionKeys = [
    "Forwards",
    "Defensemen",
    "Goalies"
];
let positionKeyIndex = 0;

ratings.leagueRatings().then(function(result) {
    for (const team of result) {
        lineDetails = {};
        positionKeyIndex = 0;
        forwardsRatingsArray = [];
        defenseRatingsArray = [];
        goaliesRatingsArray = [];
        forwardsArray = [];
        defenseArray = [];
        goaliesArray = [];
        for (const player of team.Players) {
            if (player.Position == "C" || player.Position == "L" || player.Position == "R" || player.Position == "F" || player.Position == "W" || player.Position == "") {
                totalRating = Number(player.OffensiveRating*3) + Number(player.DefensiveRating);
                forwardsRatingsArray.push(totalRating);
                forwardsRatingsArray.sort(function(a, b){return b - a});
                index = forwardsRatingsArray.indexOf(totalRating);
                forwardsArray.splice(index, 0, player);
            }
            else if (player.Position == "D") {
                totalRating = Number(player.OffensiveRating) + Number(player.DefensiveRating);
                defenseRatingsArray.push(totalRating);
                defenseRatingsArray.sort(function(a, b){return b - a});
                index = defenseRatingsArray.indexOf(totalRating);
                defenseArray.splice(index, 0, player);
            }
            else if (player.Position == "G") {
                totalRating = Number(player.GoalieRating);
                goaliesRatingsArray.push(totalRating);
                goaliesRatingsArray.sort(function(a, b){return b - a});
                index = goaliesRatingsArray.indexOf(totalRating);
                goaliesArray.splice(index, 0, player);
            }
        }

        if (forwardsArray.length < 12) {
            for (let i = forwardsArray.length, j = 0; i < 12; i ++, j ++) {
                forwardsArray.push(forwardsArray[j]);
            }
        }
        if (defenseArray.length < 6) {
            for (let i = defenseArray.length, j = 0; i < 6; i ++, j ++) {
                defenseArray.push(defenseArray[j]);
            }
        }

        for (let i = 0; i < forwardsArray.length; i ++) {
            if ((i + 2)%3 == 0 && forwardsArray[i].Position != "C" && forwardsArray[i].Position != "F") {
                if ((forwardsArray[i - 1].Position == "C" || forwardsArray[i - 1].Position == "F") && i + 1 < forwardsArray.length && 
                forwardsArray[i + 1].Position != "C" && forwardsArray[i + 1].Position != "F") {
                    temp = forwardsArray[i];
                    forwardsArray[i] = forwardsArray[i - 1];
                    forwardsArray[i - 1] = temp;
                }
                else if (forwardsArray[i - 1].Position != "C" && forwardsArray[i - 1].Position != "F" && i + 1 < forwardsArray.length && 
                (forwardsArray[i + 1].Position == "C" || forwardsArray[i + 1].Position == "F")) {
                    temp = forwardsArray[i];
                    forwardsArray[i] = forwardsArray[i + 1];
                    forwardsArray[i + 1] = temp;
                }
                else if ((forwardsArray[i - 1].Position == "C" || forwardsArray[i - 1].Position == "F") && i + 1 < forwardsArray.length && 
                (forwardsArray[i + 1].Position == "C" || forwardsArray[i + 1].Position == "F")) {
                    temp = forwardsArray[i];
                    if (Number(forwardsArray[i - 1].DefensiveRating) > Number(forwardsArray[i + 1].DefensiveRating)) {
                        forwardsArray[i] = forwardsArray[i - 1];
                        forwardsArray[i - 1] = temp;
                    }
                    else {
                        forwardsArray[i] = forwardsArray[i + 1];
                        forwardsArray[i + 1] = temp;
                    }
                }
                else if (forwardsArray[i - 1].Position != "C" && forwardsArray[i - 1].Position != "F" && i + 1 < forwardsArray.length && 
                forwardsArray[i + 1].Position != "C" && forwardsArray[i + 1].Position != "F") {
                    if (i - 2 >= 0 && (forwardsArray[i - 2].Position == "C" || forwardsArray[i - 2].Position == "F")) {
                        temp = forwardsArray[i];
                        temp2 = forwardsArray[i - 1];
                        
                        forwardsArray[i] = forwardsArray[i - 2];
                        forwardsArray[i - 1] = temp;
                        forwardsArray[i - 2] = temp2
                    }
                    else if (i + 2 < forwardsArray.length && (forwardsArray[i + 2].Position == "C" || forwardsArray[i + 2].Position == "F")) {
                        temp = forwardsArray[i];
                        temp2 = forwardsArray[i + 1];
                        
                        forwardsArray[i] = forwardsArray[i + 2];
                        forwardsArray[i + 1] = temp;
                        forwardsArray[i + 2] = temp2
                    }
                    else if (i + 3 < forwardsArray.length && (forwardsArray[i + 3].Position == "C" || forwardsArray[i + 3].Position == "F")) {
                        temp = forwardsArray[i];
                        temp2 = forwardsArray[i + 1];
                        
                        forwardsArray[i] = forwardsArray[i + 3];
                        forwardsArray[i + 1] = temp;
                        forwardsArray[i + 3] = temp2
                    }
                    else if (i + 4 < forwardsArray.length && (forwardsArray[i + 4].Position == "C" || forwardsArray[i + 4].Position == "F")) {
                        temp = forwardsArray[i];
                        temp2 = forwardsArray[i + 1];
                        
                        forwardsArray[i] = forwardsArray[i + 4];
                        forwardsArray[i + 1] = temp;
                        forwardsArray[i + 4] = temp2
                    }
                }
            }
            else if ((i + 2)%3 == 0 && (forwardsArray[i].Position == "C" || forwardsArray[i].Position == "F")) {
                if ((forwardsArray[i - 1].Position == "C" || forwardsArray[i - 1].Position == "F") && i + 1 < forwardsArray.length && 
                forwardsArray[i + 1].Position != "C" && forwardsArray[i + 1].Position != "F") {
                    temp = forwardsArray[i];
                    if (Number(forwardsArray[i - 1].DefensiveRating) > Number(forwardsArray[i].DefensiveRating)) {
                        forwardsArray[i] = forwardsArray[i - 1];
                        forwardsArray[i - 1] = temp;
                    }
                }
                else if (forwardsArray[i - 1].Position != "C" && forwardsArray[i - 1].Position != "F" && i + 1 < forwardsArray.length && 
                (forwardsArray[i + 1].Position == "C" || forwardsArray[i + 1].Position == "F")) {
                    temp = forwardsArray[i];
                    if (Number(forwardsArray[i + 1].DefensiveRating) > Number(forwardsArray[i].DefensiveRating)) {
                        forwardsArray[i] = forwardsArray[i + 1];
                        forwardsArray[i + 1] = temp;
                    }
                }
                else if ((forwardsArray[i - 1].Position == "C" || forwardsArray[i - 1].Position == "F") && i + 1 < forwardsArray.length && 
                (forwardsArray[i + 1].Position == "C" || forwardsArray[i + 1].Position == "F")) {
                    temp = forwardsArray[i];
                    if (Number(forwardsArray[i - 1].DefensiveRating) > Number(forwardsArray[i].DefensiveRating) && 
                    Number(forwardsArray[i - 1].DefensiveRating) > Number(forwardsArray[i + 1].DefensiveRating)) {
                        forwardsArray[i] = forwardsArray[i - 1];
                        forwardsArray[i - 1] = temp;
                    }
                    else if (Number(forwardsArray[i + 1].DefensiveRating) > Number(forwardsArray[i].DefensiveRating) && 
                    Number(forwardsArray[i + 1].DefensiveRating) > Number(forwardsArray[i - 1].DefensiveRating)) {
                        forwardsArray[i] = forwardsArray[i + 1];
                        forwardsArray[i + 1] = temp;
                    }
                }
            }
        }

        for (let i = 0; i < forwardsArray.length; i ++) {
            if ((i + 3)%3 == 0 && i + 2 < forwardsArray.length && ((forwardsArray[i].Shoots == "R/-" && forwardsArray[i + 2].Shoots == "L/-") || (forwardsArray[i].Position == "R" && forwardsArray[i + 2].Position == "L"))) {
                temp = forwardsArray[i];
                forwardsArray[i] = forwardsArray[i + 2];
                forwardsArray[i + 2] = temp;
            }
        }

        for (let i = 0; i < defenseArray.length; i ++) {
            if (i%2 == 0 && defenseArray[i].Shoots == "R/-" && i + 1 < defenseArray.length && defenseArray[i + 1].Shoots == "L/-") {
                temp = defenseArray[i];                    
                defenseArray[i] = defenseArray[i + 1];
                defenseArray[i + 1] = temp;
            }
            else if (i%2 == 0 && defenseArray[i].Shoots == "L/-" && i + 1 < defenseArray.length && defenseArray[i + 1].Shoots == "L/-") {
                if (i + 2 < defenseArray.length && defenseArray[i + 2].Shoots == "R/-" && ((Number(defenseArray[i + 1].OffensiveRating) + Number(defenseArray[i + 1].DefensiveRating)) -
                (Number(defenseArray[i + 2].OffensiveRating) + Number(defenseArray[i + 2].DefensiveRating))) < 100) {
                    temp = defenseArray[i + 1];
                    defenseArray[i + 1] = defenseArray[i + 2];
                    defenseArray[i + 2] = temp;
                }
                else if (i + 3 < defenseArray.length && defenseArray[i + 3].Shoots == "R/-" && ((Number(defenseArray[i + 1].OffensiveRating) + Number(defenseArray[i + 1].DefensiveRating)) -
                (Number(defenseArray[i + 3].OffensiveRating) + Number(defenseArray[i + 3].DefensiveRating))) < 100) {
                    temp = defenseArray[i + 1];
                    temp2 = defenseArray[i + 2];
                    defenseArray[i + 1] = defenseArray[i + 3];
                    defenseArray[i + 2] = temp;
                    defenseArray[i + 3] = temp2;
                }
            }
            else if (i%2 == 0 && defenseArray[i].Shoots == "R/-" && i + 1 < defenseArray.length && defenseArray[i + 1].Shoots == "R/-") {
                if (i + 2 < defenseArray.length && defenseArray[i + 2].Shoots == "L/-" && ((Number(defenseArray[i + 1].OffensiveRating) + Number(defenseArray[i + 1].DefensiveRating)) -
                (Number(defenseArray[i + 2].OffensiveRating) + Number(defenseArray[i + 2].DefensiveRating))) < 100) {
                    temp = defenseArray[i];
                    temp2 = defenseArray[i + 1];
                    defenseArray[i] = defenseArray[i + 2];
                    defenseArray[i + 1] = temp;
                    defenseArray[i + 2] = temp2;
                }
                else if (i + 3 < defenseArray.length && defenseArray[i + 3].Shoots == "L/-" && ((Number(defenseArray[i + 1].OffensiveRating) + Number(defenseArray[i + 1].DefensiveRating)) -
                (Number(defenseArray[i + 3].OffensiveRating) + Number(defenseArray[i + 3].DefensiveRating))) < 100) {
                    temp = defenseArray[i];
                    temp2 = defenseArray[i + 1];
                    defenseArray[i] = defenseArray[i + 3];
                    defenseArray[i + 1] = temp;
                    defenseArray[i + 3] = temp2;
                }
            }
        }

        lineDetails[positionKeys[positionKeyIndex]] = forwardsArray;
        positionKeyIndex ++;
        lineDetails[positionKeys[positionKeyIndex]] = defenseArray;
        positionKeyIndex ++;
        lineDetails[positionKeys[positionKeyIndex]] = goaliesArray;

        insertLines(team.Team, [lineDetails]);
    }
})

function insertLines(team, doc) {
    var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("NHL_Lines");
    dbo.collection(team).deleteMany({});
    dbo.collection(team).insertMany(doc, function(err, res) {
      if (err) throw err;
      console.log(team + " inserted.")
      db.close();
    });
  });
}