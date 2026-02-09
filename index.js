const {Client, Events, GatewayIntentBits, Collection } = require('discord.js')
const dotenv = require('dotenv')
//importação dos "commands"
const fs = require("node:fs")
const path = require("node:path")

dotenv.config()

const {TOKEN, CLIENT_ID, GUILD_ID} = process.env

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

//importação dos "commands"
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith (".js"))

client.commands = new Collection()

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ("data" in command && "execute" in command){
        client.commands.set(command.data.name, command)
    }else{
        console.log(`error in ${filePath}`)
    }
}

client.once(Events.ClientReady, c => {
    console.log(`Ready! logged in as ${c.user.tag}`)
})

process.on('SIGINT', () => {
    console.log('Bot desligando...')
    client.destroy()
    process.exit(0)
})

client.login(TOKEN)

client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isChatInputCommand()) return
    console.log(interaction)
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) {
        console.error("comando não encontrado")
        return
    }
    try {
        await command.execute(interaction)
    }catch (error) {
        console.error(error)
        await interaction.reply("erro...")
    }
})