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