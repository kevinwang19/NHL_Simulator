import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



const MongoClient = require('mongodb').MongoClient;

var teams = [
    "ANA", "ARI", "BOS", "BUF", "CGY", "CAR", "CHI", "COL",
    "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL",
    "NSH", "NJD", "NYI", "NYR", "OTT", "PHI", "PIT", "SJS",
    "SEA", "STL", "TBL", "TOR", "VAN", "VEG", "WSH", "WPG"
];
var teamWins = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var teamLosses = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; 
var teamOvertimeLosses = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var records = {};

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

        client.close();
     });
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
    var awayOTLine1, awayOTLine2, awayOTLine3;
    var homeFwdLine1, homeFwdLine2, homeFwdLine2, homeFwdLine2;
    var homeDefLine1, homeDefLine2, homeDefLine3;
    var homeGoalie1, homeGoalie2;
    var homeOTLine1, homeOTLine2, homeOTLine3;
    var goalsScored;
    let goalsScoredProbability = [0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,4,4];
    let awayFwdLineOnIce = 1, awayDefLineOnIce = 1;
    let homeFwdLineOnIce = 1, homeDefLineOnIce = 1;
    let awayOTLineOnIce = 1, homeOTLineOnIce = 1;
    let fwdLineProbability = [1,1,1,1,2,2,2,3,3,4];
    let defLineProbability = [1,1,1,1,2,2,2,3,3];
    let OTLineProbability = [1,1,1,1,2,2,3];
    var awayGoalieStartingChance, homeGoalieStartingChance;
    var awayStartingGoalie, homeStartingGoalie;
    let awayOnIceOffensiveRating = 0, homeOnIceOffensiveRating = 0;
    let awayOnIceDefensiveRating = 0, homeOnIceDefensiveRating = 0;
    var awayOnIceRating, homeOnIceRating;
    var awayTeamScoredChance;
    let awayScore = 0, homeScore = 0;
    var totalRating, index, fwdRatingsRanked, fwdsRanked, defRatingsRanked, defsRanked; 
    var isOT, didRequireOT;

    for (const game of games) {
        fwdRatingsRanked = [], fwdsRanked = [], defRatingsRanked = [], defsRanked = [];
        didRequireOT = false;
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
        for (const forward of awayTeam[0].Forwards) {
            totalRating = Number(forward.OffensiveRating*3) + Number(forward.DefensiveRating);
            fwdRatingsRanked.push(totalRating);
            fwdRatingsRanked.sort(function(a, b){return b - a});
            index = fwdRatingsRanked.indexOf(totalRating);
            fwdsRanked.splice(index, 0, forward);
        }
        for (const defenseman of awayTeam[0].Defensemen) {
            totalRating = Number(defenseman.OffensiveRating*3) + Number(defenseman.DefensiveRating);
            defRatingsRanked.push(totalRating);
            defRatingsRanked.sort(function(a, b){return b - a});
            index = defRatingsRanked.indexOf(totalRating);
            defsRanked.splice(index, 0, defenseman);
        }
        awayOTLine1 = [], awayOTLine2 = [], awayOTLine3 = [];
        awayOTLine1 = fwdsRanked.slice(0, 2);
        awayOTLine1 += defsRanked.slice(0, 1);
        awayOTLine2 = fwdsRanked.slice(2, 4);
        awayOTLine2 += defsRanked.slice(1, 2);
        awayOTLine3 = fwdsRanked.slice(4, 6);
        awayOTLine3 += defsRanked.slice(2, 3);

        homeFwdLine1 = homeTeam[0].Forwards.slice(0, 3);
        homeFwdLine2 = homeTeam[0].Forwards.slice(3, 6);
        homeFwdLine3 = homeTeam[0].Forwards.slice(6, 9);
        homeFwdLine4 = homeTeam[0].Forwards.slice(9, 12);
        homeDefLine1 = homeTeam[0].Defensemen.slice(0, 2);
        homeDefLine2 = homeTeam[0].Defensemen.slice(2, 4);
        homeDefLine3 = homeTeam[0].Defensemen.slice(4, 6);
        homeGoalie1 = homeTeam[0].Goalies.slice(0, 1);
        homeGoalie2 = homeTeam[0].Goalies.slice(1, 2);
        for (const forward of homeTeam[0].Forwards) {
            totalRating = Number(forward.OffensiveRating*3) + Number(forward.DefensiveRating);
            fwdRatingsRanked.push(totalRating);
            fwdRatingsRanked.sort(function(a, b){return b - a});
            index = fwdRatingsRanked.indexOf(totalRating);
            fwdsRanked.splice(index, 0, forward);
        }
        for (const defenseman of homeTeam[0].Defensemen) {
            totalRating = Number(defenseman.OffensiveRating*3) + Number(defenseman.DefensiveRating);
            defRatingsRanked.push(totalRating);
            defRatingsRanked.sort(function(a, b){return b - a});
            index = defRatingsRanked.indexOf(totalRating);
            defsRanked.splice(index, 0, defenseman);
        }
        homeOTLine1 = [], homeOTLine2 = [], homeOTLine3 = [];
        homeOTLine1 = fwdsRanked.slice(0, 2);
        homeOTLine1 += defsRanked.slice(0, 1);
        homeOTLine2 = fwdsRanked.slice(2, 4);
        homeOTLine2 += defsRanked.slice(1, 2);
        homeOTLine3 = fwdsRanked.slice(4, 6);
        homeOTLine3 += defsRanked.slice(2, 3);

        awayGoalieStartingChance = Number(awayGoalie1[0].GoalieRating)*1.25 / (Number(awayGoalie1[0].GoalieRating) + Number(awayGoalie2[0].GoalieRating));
        if (Math.random() <= awayGoalieStartingChance) { awayStartingGoalie = awayGoalie1; }
        else { awayStartingGoalie = awayGoalie2; }
        homeGoalieStartingChance = Number(homeGoalie1[0].GoalieRating)*1.25 / (Number(homeGoalie1[0].GoalieRating) + Number(homeGoalie2[0].GoalieRating));
        if (Math.random() <= homeGoalieStartingChance) { homeStartingGoalie = homeGoalie1; }
        else { homeStartingGoalie = homeGoalie2; }

        awayScore = 0;
        homeScore = 0;
        isOT = false;

        for (let period = 1; period <= 3 || isOT == true; period ++) {
            if (isOT) { goalsScored = 1; }
            else { goalsScored = goalsScoredProbability[Math.floor(Math.random()*goalsScoredProbability.length)]; }
            
            for (let goal = 1; goal <= goalsScored || isOT == true; goal ++) {
                awayOnIceOffensiveRating = 0;
                awayOnIceDefensiveRating = 0;
                homeOnIceOffensiveRating = 0;
                homeOnIceDefensiveRating = 0;

                if (isOT) {
                    awayOTLineOnIce = OTLineProbability[Math.floor(Math.random()*OTLineProbability.length)];
                    homeOTLineOnIce = OTLineProbability[Math.floor(Math.random()*OTLineProbability.length)];

                    switch (awayOTLineOnIce) {
                        case 1:
                            awayOnIceOffensiveRating += Number(awayOTLine1[0].OffensiveRating) + Number(awayOTLine1[1].OffensiveRating) + Number(awayOTLine1[2].OffensiveRating);
                            awayOnIceDefensiveRating += Number(awayOTLine1[0].DefensiveRating) + Number(awayOTLine1[1].DefensiveRating) + Number(awayOTLine1[2].DefensiveRating);
                            break;
                        case 2:
                            awayOnIceOffensiveRating += Number(awayOTLine2[0].OffensiveRating) + Number(awayOTLine2[1].OffensiveRating) + Number(awayOTLine2[2].OffensiveRating);
                            awayOnIceDefensiveRating += Number(awayOTLine2[0].DefensiveRating) + Number(awayOTLine2[1].DefensiveRating) + Number(awayOTLine2[2].DefensiveRating);
                            break;
                        case 3:
                            awayOnIceOffensiveRating += Number(awayOTLine3[0].OffensiveRating) + Number(awayOTLine3[1].OffensiveRating) + Number(awayOTLine3[2].OffensiveRating);
                            awayOnIceDefensiveRating += Number(awayOTLine3[0].DefensiveRating) + Number(awayOTLine3[1].DefensiveRating) + Number(awayOTLine3[2].DefensiveRating);
                            break;
                        default:
                    }
                    switch (homeOTLineOnIce) {
                        case 1:
                            homeOnIceOffensiveRating += Number(homeOTLine1[0].OffensiveRating) + Number(homeOTLine1[1].OffensiveRating) + Number(homeOTLine1[2].OffensiveRating);
                            homeOnIceDefensiveRating += Number(homeOTLine1[0].DefensiveRating) + Number(homeOTLine1[1].DefensiveRating) + Number(homeOTLine1[2].DefensiveRating);
                            break;
                        case 2:
                            homeOnIceOffensiveRating += Number(homeOTLine2[0].OffensiveRating) + Number(homeOTLine2[1].OffensiveRating) + Number(homeOTLine2[2].OffensiveRating);
                            homeOnIceDefensiveRating += Number(homeOTLine2[0].DefensiveRating) + Number(homeOTLine2[1].DefensiveRating) + Number(homeOTLine2[2].DefensiveRating);
                            break;
                        case 3:
                            homeOnIceOffensiveRating += Number(homeOTLine3[0].OffensiveRating) + Number(homeOTLine3[1].OffensiveRating) + Number(homeOTLine3[2].OffensiveRating);
                            homeOnIceDefensiveRating += Number(homeOTLine3[0].DefensiveRating) + Number(homeOTLine3[1].DefensiveRating) + Number(homeOTLine3[2].DefensiveRating);
                            break;
                        default:
                    }
                }
                else {
                    awayFwdLineOnIce = fwdLineProbability[Math.floor(Math.random()*fwdLineProbability.length)];
                    awayDefLineOnIce = defLineProbability[Math.floor(Math.random()*defLineProbability.length)];
                    homeFwdLineOnIce = fwdLineProbability[Math.floor(Math.random()*fwdLineProbability.length)];
                    homeDefLineOnIce = defLineProbability[Math.floor(Math.random()*defLineProbability.length)];

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
                }

                awayOnIceDefensiveRating += Number(awayStartingGoalie[0].GoalieRating);
                homeOnIceDefensiveRating += Number(homeStartingGoalie[0].GoalieRating);

                awayOnIceRating = Number(awayOnIceOffensiveRating) + Number(awayOnIceDefensiveRating);
                homeOnIceRating = Number(homeOnIceOffensiveRating) + Number(homeOnIceDefensiveRating);
                awayTeamScoredChance = Number(awayOnIceRating)*1.5 / (Number(awayOnIceRating) + Number(homeOnIceRating));
                
                if (Math.random() <= awayTeamScoredChance) { awayScore ++ ; }
                else { homeScore ++; }

                /*console.log(game.Away)
                console.log(awayFwdLineOnIce)
                console.log(awayDefLineOnIce)
                console.log(awayOnIceOffensiveRating)
                console.log(awayOnIceDefensiveRating)
                console.log(game.Home)
                console.log(homeFwdLineOnIce)
                console.log(homeFwdLineOnIce)
                console.log(homeOnIceOffensiveRating)
                console.log(homeOnIceDefensiveRating)
                console.log("")*/

                if (isOT) {
                    isOT = false;
                }
            }
            if (period == 3 && awayScore == homeScore) {
                isOT = true;
                didRequireOT = true;
            }
        }

        for (let i = 0; i < teams.length; i ++) {
            if (teams[i] == game.Away) {
                if (awayScore > homeScore) {
                    records[teams[i]] = teamWins[i] ++;
                }
                else if (homeScore > awayScore && didRequireOT == false) {
                    records[teams[i]] = teamLosses[i] ++;
                }
                else {
                    records[teams[i]] = teamOvertimeLosses[i] ++;
                }
            }
            if (teams[i] == game.Home) {
                if (awayScore > homeScore && didRequireOT == false) {
                    records[teams[i]] = teamLosses[i] ++;
                }
                else if (homeScore > awayScore) {
                    records[teams[i]] = teamWins[i] ++;
                }
                else {
                    records[teams[i]] = teamOvertimeLosses[i] ++;
                }
            }
        }
        //console.log(game.Away + "vs" + game.Home + ": " + awayScore + "-" + homeScore)
    }
    console.log("")
    for (let i = 0; i < teams.length; i ++) {
        console.log(teams[i] + ": " + teamWins[i] + "-" + teamLosses[i] + "-" + teamOvertimeLosses[i])
    }
    client.close();
}

simulateSeason()
