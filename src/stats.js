const PORT = 3000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;

async function playerScraper(playerURL) {
  const playerDetails = {};
  await axios(playerURL).then((playerResponse) => {
    const player_html_data = playerResponse.data;
    const $ = cheerio.load(player_html_data);
    
    const selectedPlayerElem =
      "#stats_basic_plus_nhl:nth-child(1) > tbody > tr"
    const selectedPlayerPositionElem =
      "#meta > div:nth-child(2) > p:nth-child(2)"
    const playerKeys = [
      "Pos",
      "GP",
      "G",
      "A",
      "PTS",
      "PlusMinus",
      "PIM",
      "EVG",
      "PPG",
      "SHG",
      "GWG",
      "EVA",
      "PPA",
      "SHA",
      "S",
      "SPer",
      "TSA",
      "TOI",
      "ATOI",
      "FOW",
      "FOL",
      "FOPer",
      "BLK",
      "HIT",
      "TK",
      "GV",
      "Awards",
    ];

    const goalieKeys = [
      "Pos",
      "GP",
      "GS",
      "W",
      "L",
      "OTL",
      "GA",
      "SA",
      "SV",
      "SVPer",
      "GAA",
      "SO",
      "MIN",
      "QS",
      "QSPer",
      "RBS",
      "GAPer",
      "GSAA",
      "AdjGAA",
      "GPS",
      "G",
      "A",
      "PTS",
      "PIM",
      "Awards",
    ];
    
    let playerKeyIndex = 0;
    let position = "";
    
    $(selectedPlayerElem).last()
    .children()
    .each((playerId, playerElem) => {
      if (playerId == 0) {
        const startIndex = $(selectedPlayerPositionElem).text().indexOf(" ") + 1;
        position = $(selectedPlayerPositionElem).text().substring(startIndex, startIndex + 1);
        playerDetails[playerKeys[playerKeyIndex]] = position
        playerKeyIndex++;
      }
      if (playerId > 3) {
        const playerValue = $(playerElem).text();
        if (position == "G") {
          playerDetails[goalieKeys[playerKeyIndex]] = playerValue;
        }
        else {
          playerDetails[playerKeys[playerKeyIndex]] = playerValue;
        }
        playerKeyIndex++;
      }
    });
  });
  return playerDetails;
}

async function rosterScraper(team) {
  const teamURL = "https://www.hockey-reference.com/teams/" + team + "/index.html";
  const rosterArray = [];
  const playerID = 1;
  const summaryID = 10;
  await axios(teamURL).then((teamResponse) => {
    const team_html_data = teamResponse.data;
    const $ = cheerio.load(team_html_data);
    
    const selectedRosterElem =
      "#roster:nth-child(1) > tbody > tr";
    const rosterKeys = [
      "No",
      "Player",
      "Stats",
      "Flag",
      "Pos",
      "Age",
      "Ht",
      "Wt",
      "Shoots",
      "Summary",
    ];
    
    $(selectedRosterElem).each((rosterParentIndex, rosterParentElem) => {
      let rosterKeyIndex = 0;
      let skipPlayer = false;
      const rosterDetails = {};
      if (rosterParentIndex <= 40) {
        $(rosterParentElem)
          .children()
          .each((rosterChildId, rosterChildElem) => {
            if (rosterChildId < 8 || rosterChildId == summaryID) {
              const rosterValue = $(rosterChildElem).text();
              rosterDetails[rosterKeys[rosterKeyIndex]] = rosterValue;
              rosterKeyIndex++;

              if (rosterChildId == playerID) {
                $(rosterChildElem).find('a').each(function (index, element) {
                  const playerURL = "https://www.hockey-reference.com" + $(element).attr('href');
                  rosterDetails[rosterKeys[rosterKeyIndex]] = playerURL;
                  rosterKeyIndex++;
                });
              }

              if (rosterChildId == summaryID && (
                rosterValue == "0 G, 0 A, 0 P" || rosterValue == "1 G, 0 A, 1 P" || rosterValue == "0 G, 1 A, 1 P" || 
                rosterValue == "1 G, 1 A, 2 P" || rosterValue == "2 G, 0 A, 2 P" || rosterValue == "0 G, 2 A, 2 P" || 
                rosterValue == "0 G, 2 A, 2 P" || rosterValue == "0 G, 2 A, 2 P" || rosterValue == "0 G, 2 A, 2 P" || 
                rosterValue.startsWith("1-0-0,")|| rosterValue.startsWith("0-1-0,")|| rosterValue.startsWith("0-0-1,")||
                rosterValue.startsWith("2-0-0,")|| rosterValue.startsWith("0-2-0,")|| rosterValue.startsWith("0-0-2,")||
                rosterValue.startsWith("1-1-0,")|| rosterValue.startsWith("0-1-1,")|| rosterValue.startsWith("1-0-1,")||
                rosterValue.startsWith("3-0-0,")|| rosterValue.startsWith("0-3-0,")|| rosterValue.startsWith("0-0-3,")||
                rosterValue.startsWith("2-1-0,")|| rosterValue.startsWith("2-0-1,")|| rosterValue.startsWith("1-2-0,")||
                rosterValue.startsWith("1-0-2,")|| rosterValue.startsWith("0-2-1,")|| rosterValue.startsWith("0-1-2,")||
                rosterValue.startsWith("1-1-1,")|| rosterValue == ""
                )) {
                skipPlayer = true;
              } 
            }
          });
        if (!skipPlayer) {
          rosterArray.push(rosterDetails);
        }
      }
    });
  });
  return rosterArray;
}

/*app.get("/api/team", async (req, res) => {
  try {
    const team = await rosterScraper();
    return res.status(200).json({
      result: team,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});*/

/*app.get("/api/player", async (req, res) => {
  try {
    const team = await playerScraper("https://www.hockey-reference.com/players/m/matthau01.html");
    return res.status(200).json({
      result: team,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});*/

app.listen(PORT, () =>
  console.log(`The server is active and running on port ${PORT}`)
);

async function filldb() {
  const NHLTeams = [
    "ANA", "ARI", "BOS", "BUF", "CGY", "CAR", "CHI", "COL",
    "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL",
    "NSH", "NJD", "NYI", "NYR", "OTT", "PHI", "PIT", "SJS",
    "SEA", "STL", "TBL", "TOR", "VAN", "VEG", "WSH", "WPG"
  ];
  var document = [];

  for (const team of NHLTeams) {
    document = [];
    const roster = await rosterScraper(team);
    for (const player of roster) {
      const stats = await playerScraper(player.Stats);
      document.push({
        player, 
        stats,
      });
    }
    add(team, document);
  }
}

function add(team, doc) {
  var url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("NHL");
    dbo.collection(team).deleteMany({});
    dbo.collection(team).insertMany(doc, function(err, res) {
      if (err) throw err;
      console.log(team + " inserted.")
      db.close();
    });
  });
}

filldb();
