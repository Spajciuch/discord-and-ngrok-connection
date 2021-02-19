import * as dotenv from "dotenv"
import * as ngrok from "ngrok"
import * as Discord from "discord.js"

const fetch = require("node-fetch")

const client = new Discord.Client()

dotenv.config()

client.on("ready", () => {
    console.log(`[discord.js] Discord client logged in`)

    fetch('http://127.0.0.1:4040/api/tunnels')
        .then((res: { json: () => any }) => res.json())
        .then((json: any) => {
            const ngrokURL = json.tunnels[0].public_url

            console.log(`[ngrok] Public URL: ${ngrokURL}`)

            client.emit("editMessage", ngrokURL)
        })

})

client.on("editMessage", url => {
    const guild = client.guilds.cache.get("673282113977712670")
    const channel = guild.channels.cache.get("755080059282391270") as Discord.TextChannel

    channel.messages.fetch("812463677453369386").then(message => {
        message.edit(url)
    })
})

async function ngrokStatus(data: string) {
    console.log(`[ngrok] Status: ${data}`)
}

function ngrokLog(data: string) {
    // console.log(`[ngrok] ${data}`)
}

ngrok.connect({ addr: 25565, proto: "tcp", onStatusChange: status => ngrokStatus(status), onLogEvent: data => ngrokLog(data) })

process.on("SIGTERM", () => {
    ngrok.kill()
})

process.on("exit", () => {
    ngrok.kill()
})

client.login(process.env.TOKEN)