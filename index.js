const { Telegraf } = require('telegraf')
const fs = require('fs');
require('dotenv').config()

const bot = new Telegraf(process.env.TOKEN)
const dataObj = JSON.parse(fs.readFileSync("./users.json"));
let step = 1;
console.log("dataObj", dataObj);
bot.start((ctx) => {
    ctx.reply("1.Введіть будь ласка своє Ім'я");
});

bot.on("text", (ctx) => {
    console.log("step", step)
    if (step === 1) {
        step = 2;
        dataObj[ctx.update.message.from.id] = {
            name: ctx.update.message.text,
        };
        ctx.reply("2.Введіть місто, з якого приїхали");
        return;
    }
    if (step === 2) {
        step = 3;
        dataObj[ctx.update.message.from.id].location = ctx.update.message.text;
        fs.writeFileSync("./users.json", JSON.stringify(dataObj));
        ctx.reply("3.Завантажте відео");
        return;
    }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))