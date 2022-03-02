const { Telegraf } = require('telegraf')
const fs = require('fs');
const axios = require('axios');

require('dotenv').config()

const bot = new Telegraf(process.env.TOKEN)
const dataObj = JSON.parse(fs.readFileSync("./users.json"));
let step = 1;
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
});

bot.on("video_note", (ctx) => {
    if (step !== 3) {
        return;
    }

    const fileId = ctx.update.message.video_note.file_id;
    ctx.telegram.getFileLink(fileId).then(url => {
        axios({url: url.href, responseType: 'stream'}).then(response => {
            return new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(`./videos/${ctx.update.message.from.id}.mp4`))
                    .on('finish', () => {
                        ctx.reply("Відео завантажене. Дякую, Ваші дані додані!");
                    })
                    .on('error', e => console.log(`Пом ${e}`))
            });
        })
    })
});


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))