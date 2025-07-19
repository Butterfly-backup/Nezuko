const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "1.0",
    author: "Loid Butter & Fix by Yeasin",
    countDown: 8,
    role: 2,
    shortDescription: "Accept/delete friend requests",
    longDescription: "Accept or delete pending friend requests using Facebook GraphQL API",
    category: "utility",
  },

  onReply: async function ({ message, Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    clearTimeout(Reply.unsendTimeout);

    if (!["add", "del"].includes(action)) {
      return api.sendMessage("Please reply using format: add/del <number or 'all'>", event.threadID, event.messageID);
    }

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: action === "add"
        ? "FriendingCometFriendRequestConfirmMutation"
        : "FriendingCometFriendRequestDeleteMutation",
      doc_id: action === "add" ? "3147613905362928" : "4108254489275063",
      variables: {} // We'll assign per request
    };

    // Handle all case
    let targetIDs = args[1] === "all"
      ? listRequest.map((_, i) => i + 1)
      : args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));

    const success = [];
    const failed = [];

    for (const stt of targetIDs) {
      const user = listRequest[stt - 1];
      if (!user) {
        failed.push(`STT ${stt} not found`);
        continue;
      }

      const vars = {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString(),
          friend_requester_id: user.node.id
        },
        scale: 3,
        refresh_num: 0
      };

      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", {
          ...form,
          variables: JSON.stringify(vars)
        });

        const json = JSON.parse(res);
        if (json.errors) {
          failed.push(user.node.name);
        } else {
          success.push(user.node.name);
        }
      } catch (err) {
        failed.push(user.node.name);
      }
    }

    let msg = "";
    if (success.length > 0) {
      msg += `✅ ${action === 'add' ? 'Accepted' : 'Deleted'} ${success.length} friend request(s):\n${success.join("\n")}`;
    }
    if (failed.length > 0) {
      msg += `\n\n⚠️ Failed for ${failed.length} user(s):\n${failed.join("\n")}`;
    }
    if (!msg) {
      msg = "❌ No valid requests were processed.";
    }

    api.sendMessage(msg, event.threadID, event.messageID);
    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const data = JSON.parse(res);

      const listRequest = data.data.viewer.friending_possibilities.edges;

      if (!listRequest || listRequest.length === 0) {
        return api.sendMessage("😕 No pending friend requests found.", event.threadID, event.messageID);
      }

      let msg = "📥 Pending Friend Requests:\n";
      listRequest.forEach((user, index) => {
        msg += `\n${index + 1}. Name: ${user.node.name}`
             + `\n🔗 URL: ${user.node.url.replace("www.facebook", "fb")}`
             + `\n🕒 Time: ${moment(user.time * 1000).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      api.sendMessage(`${msg}\n\n📥 Reply with: add/del <number | all>`, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 20000 * 8) // 8 x 20s
        });
      }, event.messageID);
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Failed to fetch friend requests.", event.threadID, event.messageID);
    }
  }
};
