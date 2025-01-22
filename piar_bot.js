/* by Sergey Ushakov 2025 | https://github.com/smdkx */

//Подключение модулей и библиотек
require('dotenv').config()
const { VK } = require('vk-io')

//Токен пользователя
const vk = new VK({
	token: process.env.TOKEN_USER
});

const currentText = [
	'TEXT'
];

const attach = [
	'photoXXX_XXX'
]

const groupID = [
	'-XXXX'
]

const groupName = [
	'NAME'
]

const delay = (time) => {
	return new Promise((resolve, reject) => setTimeout(resolve, time))
}

async function run() {

	const api = vk.api.wall.post
	const delayTimer = 10000 //10 секунд

	async function launchGroup() {
		delay(delayTimer)
		.then(async () => {
		const currentNumber = 0
		await api({
			owner_id: groupID[0], 
			message: currentText,
			attachments: attach
		});
		console.log('>_ Опубликовано в сообществе «' + groupName[currentNumber] + '» (' + groupID[currentNumber] + ')')
		return delay(delayTimer)
	})
	.then(() => {
		console.log('>_ DONE! Wait 10 minutes before restarting')
		setTimeout(() => {
			console.log('>_ Refresh! Started..')
			run()
		}, 600000) //10 минут = 600000
	})}

	launchGroup()
	console.log(api);
}

run().catch(console.log);

//Logi
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);