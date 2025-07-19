const axios = require("axios");
const cheerio = require("cheerio");

const fontMap = {
  " ": " ",
  a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑", i: "𝚒", j: "𝚓",
  k: "𝚔", l: "𝚕", m: "𝚖", n: "𝚗", o: "𝚘", p: "𝚙", q: "𝚚", r: "𝚛", s: "𝚜", t: "𝚝",
  u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡", y: "𝚢", z: "𝚣",
  A: "𝙰", B: "𝙱", C: "𝙲", D: "𝙳", E: "𝙴", F: "𝙵", G: "𝙶", H: "𝙷", I: "𝙸", J: "𝙹",
  K: "𝙺", L: "𝙻", M: "𝙼", N: "𝙽", O: "𝙾", P: "𝙿", Q: "𝚀", R: "𝚁", S: "𝚂", T: "𝚃",
  U: "𝚄", V: "𝚅", W: "𝚆", X: "𝚇", Y: "𝚈", Z: "𝚉",
};

function transformText(input) {
  return input.split("").map(c => fontMap[c] || c).join("");
}

module.exports = {
  config: {
    name: "cricket",
    version: "1.0",
    author: "Yeasin",
    aliases: ["livecricket", "cricketscore"],
    countDown: 5,
    role: 0,
    shortDescription: "Fetch live cricket scores",
    longDescription: "Fetches live cricket scores from ESPN Cricinfo.",
    category: "utility",
    guide: "{pn}",
  },

  onStart: async function ({ message, api, event }) {
    const url = "https://www.espncricinfo.com/live-cricket-score";

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const matchElement = $(".ds-flex.ds-flex-col.ds-mt-2.ds-mb-2").first();
      if (!matchElement || matchElement.length === 0) throw new Error("No match found");

      const team1 = matchElement.find(".ci-team-score").first();
      const team2 = matchElement.find(".ci-team-score").last();

      const team1Name = team1.find("p").text().trim() || "Team 1";
      const team2Name = team2.find("p").text().trim() || "Team 2";

      const team1ScoreRaw = team1.find("strong").text().trim().split("/");
      const team2ScoreRaw = team2.find("strong").text().trim().split("/");

      const team1Runs = parseInt(team1ScoreRaw[0]) || 0;
      const team1Wickets = team1ScoreRaw[1] || "0";

      const team2Runs = parseInt(team2ScoreRaw[0]) || 0;
      const team2Wickets = team2ScoreRaw[1] || "0";

      const matchInfo = matchElement.find("span").last().text().trim();
      const matchDetails = matchInfo.match(/\((\d+\.?\d*) ov(?:, T:(\d+))?\)/);
      const overs = matchDetails ? matchDetails[1] : "N/A";
      const target = matchDetails ? matchDetails[2] : "N/A";

      const winningTeam =
        team1Runs > team2Runs ? team1Name : team2Runs > team1Runs ? team2Name : null;
      const runDifference = Math.abs(team1Runs - team2Runs);
      const resultMessage = winningTeam
        ? `${winningTeam} is leading by ${runDifference} runs`
        : "Match is currently tied or ongoing.";

      const messageBody = `
🏏 𝗟𝗶𝘃𝗲 𝗖𝗿𝗶𝗰𝗸𝗲𝘁 𝗦𝗰𝗼𝗿𝗲 🏏

${team1Name}
🔹 Score: ${team1Runs}/${team1Wickets}

${team2Name}
🔹 Score: ${team2Runs}/${team2Wickets}

🕒 Overs: ${overs} ${target !== "N/A" ? `| 🎯 Target: ${target}` : ""}
🏆 ${resultMessage}
      `.trim();

      await api.sendMessage(transformText(messageBody), event.threadID, event.messageID);
    } catch (error) {
      console.error("Error fetching cricket score:", error.message);
      return api.sendMessage(
        "❌ Could not fetch live score. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
