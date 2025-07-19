module.exports.config = {
  name: "call",
  version: "1.0.3",
  role: 2,
  author: "Yeasin", //don't change my credit
  description: "Call bomber, only for Bangladeshi numbers",
  category: "Tool",
  usages: "/call 01xxxxxxxxx",
  cooldowns: 15,
  guide: { axios: "" }
};

module.exports.onStart = async ({ api, event, args }) => {
  const axios = require("axios");
  const number = args[0];

  if (!number || !/^01[0-9]{9}$/.test(number)) {
    return api.sendMessage(
      "🚫 𝙴𝙽𝚃𝙴𝚁 𝙰 𝚅𝙰𝙻𝙸𝙳 𝙱𝙰𝙽𝙶𝙻𝙰𝙳𝙴𝚂𝙷𝙸 𝙽𝚄𝙼𝙱𝙴𝚁\n𝙴𝚇𝙰𝙼𝙿𝙻𝙴: /𝙲𝙰𝙻𝙻 01XXXXXXXXX 🎀",
      event.threadID,
      event.messageID
    );
  }

  api.sendMessage(`🕛 𝙷𝙾𝙻𝙳 𝙾𝙽... 𝙲𝙰𝙻𝙻 𝙸𝙽 𝙿𝚁𝙾𝙲𝙴𝚂𝚂 🎀✨`, event.threadID, async (err, info) => {
    if (err) return;

    const maxRetries = 3;
    let attempt = 0;

    async function tryCall() {
      try {
        attempt++;
        await axios.get(`https://tbblab.shop/callbomber.php?mobile=${number}`);

        setTimeout(() => {
          try {
            api.unsendMessage(info.messageID);
          } catch (e) {}
        }, 90000);

        return api.sendMessage(
          `✅ 𝙲𝙰𝙻𝙻 𝚂𝙴𝙽𝚃 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 🎀✨`,
          event.threadID,
          event.messageID
        );
      } catch (error) {
        if (error.response && error.response.status === 503) {
          if (attempt < maxRetries) {
            setTimeout(tryCall, 3000);
          } else {
            return api.sendMessage(
              "⚠ 𝚂𝙴𝚁𝚅𝙴𝚁 𝙸𝚂 𝙱𝚄𝚂𝚈. 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 𝙻𝙰𝚃𝙴𝚁.",
              event.threadID,
              event.messageID
            );
          }
        } else {
          return api.sendMessage(
            "❌ 𝚂𝙾𝙼𝙴𝚃𝙷𝙸𝙽𝙶 𝚆𝙴𝙽𝚃 𝚆𝚁𝙾𝙽𝙶. 𝙿𝙻𝙴𝙰𝚂𝙴 𝚃𝚁𝚈 𝙰𝙶𝙰𝙸𝙽 𝙻𝙰𝚃𝙴𝚁.",
            event.threadID,
            event.messageID
          );
        }
      }
    }

    tryCall();
  });
};
