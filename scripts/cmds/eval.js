const { removeHomeDir, log } = global.utils;

module.exports = {
  config: {
    name: "eval",
    version: "1.8",
    author: "Modified by Yeasin",
    countDown: 5,
    role: 2,
    description: {
      vi: "Test code nhanh",
      en: "Test code quickly"
    },
    category: "owner",
    guide: {
      vi: "{pn} <code>\n{pn} reset <uid>\n{pn} reset all",
      en: "{pn} <code>\n{pn} reset <uid>\n{pn} reset all"
    }
  },

  langs: {
    vi: {
      error: "❌ Đã có lỗi xảy ra:"
    },
    en: {
      error: "❌ An error occurred:"
    }
  },

  onStart: async function ({ api, args, message, event, usersData, getLang }) {
    const ownerUID = "61552257412748";
    if (event.senderID != ownerUID) {
      return message.reply("❌ Only the bot owner can use this command.");
    }

    // === RESET SYSTEM ===
    if (args[0] === "reset") {
      if (!args[1]) return message.reply("❌ Provide UID or 'all'");

      if (args[1] === "all") {
        const allUsers = await usersData.getAll();
        let count = 0;
        for (const user of allUsers) {
          await usersData.set(user.userID, { money: 0 });
          count++;
        }
        return message.reply(`✅ Successfully reset money for ${count} users.`);
      }

      const targetUID = args[1];
      const data = await usersData.get(targetUID);
      if (!data) return message.reply("❌ User not found.");
      await usersData.set(targetUID, { money: 0 });
      return message.reply(`✅ Reset money for UID ${targetUID}.`);
    }

    // === MAIN EVAL ===
    function output(msg) {
      if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
        msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      }
      else if (typeof msg == "object")
        msg = JSON.stringify(msg, null, 2);
      else if (typeof msg == "undefined")
        msg = "undefined";

      message.reply(msg);
    }

    function out(msg) {
      output(msg);
    }

    function mapToObj(map) {
      const obj = {};
      map.forEach(function (v, k) {
        obj[k] = v;
      });
      return obj;
    }

    const code = args.join(" ");
    const cmd = `(async () => {
      try {
        ${code}
      } catch (err) {
        log.err("eval command", err);
        message.send("${getLang("error")}\\n" + 
          (err.stack ? removeHomeDir(err.stack) : removeHomeDir(JSON.stringify(err, null, 2) || ""))
        );
      }
    })()`;

    eval(cmd);
  }
};
