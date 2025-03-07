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

    const api = vk.api.wall.post;
    const delayTimer = 25000; //25 секунд
    let currentNumber = 0;
	let isReset = false; //restart

    async function launchGroup() {
		try {
			if (currentNumber >= groupID.length) {
				console.log('>_ DONE!')
				if (isReset) {
					await delay(5000);
					console.log('>_ Wait 10 minutes before restarting')
					setTimeout(() => {
						console.log('>_ Refresh! Started..')
						run()
					}, 600000) //10 минут = 600000
                }
				return;
			}
			
			await delay(delayTimer);

            const currentID = groupID[currentNumber];
            const currentName = groupName[currentNumber];

            await api({
                owner_id: groupId,
                message: currentText,
                attachments: attach
            });

			console.log(`>_ Опубликовано в сообществе «${currentName}» (vk.com/public${currentID})`.replace("-", ""));

            currentNumber++;

            launchGroup();

        } catch (error) {
            console.error('>_ Publication error: ', error);
            await delay(5000);
            run();
        }
    }

    launchGroup();
	console.log(api);
}

run().catch(console.log);

//Logi
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);