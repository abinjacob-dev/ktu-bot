import createBot from "./createBot";
import notifyUserCron from "./cron/notifyUserCron";
import Bull = require("bull");
const notifyUserQueue = new Bull("notify-user-queue");

// Create the bot and initialize the database
const { bot, db } = createBot();

// Launch the bot
const launchBot = async () => {
  // Launch in long polling mode if in development
  if (process.env.ENV_TYPE === "DEVELOPMENT") {
    bot.launch();
    if (bot)
      bot.telegram.getMe().then((res) => {
        console.log(
          `Bot started in polling mode. Available at https://t.me/${res.username}`
        );
        notifyUserCron(db, bot);
      });
  }
  // Launch in webhook mode if in production
  else {
    bot.launch({
      webhook: {
        domain: process.env.WEBHOOK_DOMAIN!,
        port: Number(process.env.WEBHOOK_PORT),
      },
    });
    if (bot)
      bot.telegram.getMe().then((res) => {
        console.log(
          `Bot started in webhook mode. Available at https://t.me/${res.username}`
        );
        notifyUserCron(db, bot);
      });
  }
};

// Graceful stop
process.once("SIGINT", async () => {
  bot.stop("SIGINT");
  await notifyUserQueue.obliterate({ force: true });
});
process.once("SIGTERM", async () => {
  bot.stop("SIGTERM");
  await notifyUserQueue.obliterate({ force: true });
});

launchBot();
