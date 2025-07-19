const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    author: "Yeasin Bhai",
    category: "love",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      if (!senderData || !senderData.name) {
        return api.sendMessage("❌ Could not fetch your profile info.", event.threadID, event.messageID);
      }
      const senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find((user) => user.id == event.senderID);
      const myGender = myData?.gender?.toLowerCase();

      if (!myGender || !["male", "female"].includes(myGender)) {
        return api.sendMessage("⚠ Could not determine your gender.", event.threadID, event.messageID);
      }

      const targetGender = myGender === "male" ? "female" : "male";
      const matchCandidates = users.filter(
        (user) => user.id !== event.senderID && user.gender?.toLowerCase() === targetGender
      );

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ No suitable match found in the group.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const matchName = selectedMatch.name;

      // Create canvas
      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Load random background
      const backgrounds = [
        "https://i.imgur.com/OntEBiq.png",
        "https://i.imgur.com/IYCoZgc.jpeg",
        "https://i.imgur.com/753i3RF.jpeg"
      ];
      const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      const background = await loadImage(bgURL);

      // Load profile pictures
      const getAvatar = async (uid) => {
        try {
          return await loadImage(`https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        } catch (err) {
          console.log("⚠ Could not load avatar for UID", uid, "- Using fallback.");
          return await loadImage("https://i.imgur.com/QrAz3XU.png");
        }
      };

      const senderAvatar = await getAvatar(event.senderID);
      const matchAvatar = await getAvatar(selectedMatch.id);

      // Draw background and avatars
      ctx.drawImage(background, 0, 0, width, height);
      ctx.drawImage(senderAvatar, 385, 40, 170, 170);
      ctx.drawImage(matchAvatar, width - 213, 190, 180, 170);

      // Save canvas as image
      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `🥰 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 𝗣𝗮𝗶𝗿𝗶𝗻𝗴!
・${senderName} 🎀
・${matchName} 🎀
💌 𝗪𝗶𝘀𝗵 𝘆𝗼𝘂 𝘁𝘄𝗼 𝗵𝘂𝗻𝗱𝗿𝗲𝗱 𝘆𝗲𝗮𝗿𝘀 𝗼𝗳 𝗵𝗮𝗽𝗽𝗶𝗻𝗲𝘀𝘀 ❤

𝗟𝗼𝘃𝗲 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}% 💙`;

        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(outputPath),
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error("❌ Pairing error:", error);
      return api.sendMessage("❌ An error occurred while trying to find a match.\n" + error.message, event.threadID, event.messageID);
    }
  },
};
