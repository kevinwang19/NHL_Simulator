const PORT = 3000;
const MongoClient = require('mongodb').MongoClient;

async function leagueRatings() {
    const NHLTeams = [
      "ANA", "ARI", "BOS", "BUF", "CGY", "CAR", "CHI", "COL",
      "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL",
      "NSH", "NJD", "NYI", "NYR", "OTT", "PHI", "PIT", "SJS",
      "SEA", "STL", "TBL", "TOR", "VAN", "VEG", "WSH", "WPG"
    ];

    const teamKeys = [
        "Team",
        "Players",
    ];
    
    const playerKeys = [
        "Name",
        "Position",
        "Shoots",
        "OffensiveRating",
        "DefensiveRating",
        "GoalieRating",
    ];

    var result;
    var playerStats;
    
    let leagueArray = [];
    let statsArray = [];
    let teamDetails = {};
    let playersDetails = {};
    let teamKeyIndex = 0;
    let playerKeyIndex = 0;
    let offensiveRating = 0;
    let defensiveRating = 0;
    let goaltendingRating = 0;

    let url = "mongodb+srv://kevinwang19:Bl%40ckh%40wks19@clusterprojects.e8igvod.mongodb.net/test";
    const client = await MongoClient.connect(url);
    const dbo = client.db("NHL");
    
    for (const team of NHLTeams) {
        statsArray = [];
        teamDetails = {};
        teamKeyIndex = 0;
        teamDetails[teamKeys[teamKeyIndex]] = team;
        teamKeyIndex ++;
        result = await dbo.collection(team).find({}).toArray();
        
        for (const player of result) {
            playersDetails = {};
            playerKeyIndex = 0;
            playerStats = player.stats;
            offensiveRating = 0;
            defensiveRating = 0;
            goaltendingRating = 0;

            playersDetails[playerKeys[playerKeyIndex]] = player.player.Player;
            playerKeyIndex ++; 
            playersDetails[playerKeys[playerKeyIndex]] = player.stats.Pos;
            playerKeyIndex ++;
            playersDetails[playerKeys[playerKeyIndex]] = player.player.Shoots;
            playerKeyIndex ++;

            if (playerStats.Pos == "G") {
                goaltendingRating = Number(playerStats.W)*500/Number(playerStats.GP) -
                    Number(playerStats.L)*200/Number(playerStats.GP) + 
                    Number(playerStats.OTL)*100/Number(playerStats.GP) +
                    Number(playerStats.SVPer)*300 -
                    Number(playerStats.GAA)*100 + 
                    Number(playerStats.SO)*15 + 
                    Number(playerStats.QS)*5 -
                    Number(playerStats.RBS)*5 + 
                    Number(playerStats.GSAA)*3 + 1000

                    playersDetails[playerKeys[playerKeyIndex]] = "";
                    playerKeyIndex ++;
                    playersDetails[playerKeys[playerKeyIndex]] = "";
                    playerKeyIndex ++;
                    playersDetails[playerKeys[playerKeyIndex]] = goaltendingRating.toString();
            }
            else {
                offensiveRating = ((Number(playerStats.EVG)*1.3 + Number(playerStats.EVA))*2/Number(playerStats.GP) + 
                    (Number(playerStats.PPG)*1.3 + Number(playerStats.PPA))*4/Number(playerStats.GP) +
                    Number(playerStats.TSA)*2/Number(playerStats.TOI) +
                    Number(playerStats.PlusMinus)*0.5/Number(playerStats.GP) + 
                    Number(playerStats.GWG)*5/Number(playerStats.GP) + 7.5)*100

                    playersDetails[playerKeys[playerKeyIndex]] = offensiveRating.toString();
                    playerKeyIndex ++;

                if (playerStats.Pos == "L" || playerStats.Pos == "R" || playerStats.Pos == "W" || playerStats.Pos == "") {
                    defensiveRating = (Number(playerStats.BLK)*2/Number(playerStats.GP) +
                        (Number(playerStats.TK) - Number(playerStats.GV))/Number(playerStats.GP) -
                        Number(playerStats.PIM)*20/Number(playerStats.TOI) +
                        Number(playerStats.PlusMinus)*2/Number(playerStats.GP) + 
                        Number(playerStats.HIT)*0.1/Number(playerStats.GP) + 
                        (Number(playerStats.SHG) + Number(playerStats.SHA))*10/Number(playerStats.GP) + 6.5)*100

                        playersDetails[playerKeys[playerKeyIndex]] = defensiveRating.toString();
                        playerKeyIndex ++;
                        playersDetails[playerKeys[playerKeyIndex]] = "";
                }
                else if (playerStats.Pos == "D") {
                    defensiveRating = (Number(playerStats.BLK)*2/Number(playerStats.GP) +
                        (Number(playerStats.TK) - Number(playerStats.GV))/Number(playerStats.GP) -
                        Number(playerStats.PIM)*20/Number(playerStats.TOI) +
                        Number(playerStats.PlusMinus)*2/Number(playerStats.GP) + 
                        Number(playerStats.HIT)*0.1/Number(playerStats.GP) + 
                        (Number(playerStats.SHG) + Number(playerStats.SHA))*10/Number(playerStats.GP) + 7.5)*100

                        playersDetails[playerKeys[playerKeyIndex]] = defensiveRating.toString();
                        playerKeyIndex ++;
                        playersDetails[playerKeys[playerKeyIndex]] = "";
                }
                else {
                    defensiveRating = (Number(playerStats.BLK)*2/Number(playerStats.GP) +
                        (Number(playerStats.TK) - Number(playerStats.GV))/Number(playerStats.GP) -
                        Number(playerStats.PIM)*20/Number(playerStats.TOI) +
                        Number(playerStats.PlusMinus)*2/Number(playerStats.GP) + 
                        Number(playerStats.HIT)*0.1/Number(playerStats.GP) + 
                        (Number(playerStats.SHG) + Number(playerStats.SHA))*10/Number(playerStats.GP) + 
                        Number(playerStats.FOPer)/20 + 5.0)*100

                        playersDetails[playerKeys[playerKeyIndex]] = defensiveRating.toString();
                        playerKeyIndex ++;
                        playersDetails[playerKeys[playerKeyIndex]] = "";
                        }
            }
            statsArray.push(playersDetails)
        }

        teamDetails[teamKeys[teamKeyIndex]] = statsArray
        leagueArray.push(teamDetails)
    }

    client.close(); 
    return leagueArray       
}

leagueRatings().then(function(result) {
    //console.log(result[27]);
})

module.exports = {leagueRatings };