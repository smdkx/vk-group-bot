/* by Sergey Ushakov 2025 | https://github.com/smdkx */

//Подключение модулей и библиотек
require('dotenv').config()
const { VK } = require('vk-io')
const {
	DELAY_BETWEEN_POSTS,
	RESTART_DELAY,
	ERROR_RETRY_DELAY
} = require('./config');

// Проверка переменных окружения
const requiredEnv = ['TOKEN_USER'];
for (const env of requiredEnv) {
	if (!process.env[env]) {
		console.error(`Ошибка: отсутствует переменная окружения ${env}`);
		process.exit(1);
	}
}

//Токен пользователя
const vk = new VK({
	token: process.env.TOKEN_USER
});

const postData = {
    message: [
        'Text'
    ],
    attachments: ['photoXXX_XXX']
};

const groupsData = [
    { id: '-1', name: 'Test' }
];

// Утилита для создания задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Основная функция для публикации постов
async function createPost() {
    let currentIndex = 0;

    while (currentIndex < groupsData.length) {
        const group = groupsData[currentIndex];
        try {
            // Публикация поста
            await vk.api.wall.post({
                owner_id: group.id,
                message: postData.message[0],
                attachments: postData.attachments
            });

            console.log(`>_ Опубликовано в сообществе «${group.name}» (vk.com/public${group.id.replace('-', '')})`);
            currentIndex++;
            await delay(DELAY_BETWEEN_POSTS);

        } catch (error) {
            console.error(`>_ Ошибка публикации в «${group.name}»:`, error.message);
            await delay(ERROR_RETRY_DELAY);
            continue; // Пропускаем ошибку и продолжаем с текущей группой
        }
    }

    console.log('>_ Все посты опубликованы!');
    console.log('>_ Ожидание 10 минут перед перезапуском...');
    await delay(RESTART_DELAY);
    console.log('>_ Перезапуск публикации...');
    createPost();
}

// Запуск скрипта
async function run() {
    try {
        console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
        await createPost();
    } catch (error) {
        console.error('>_ Critical Error:', error);
        await delay(ERROR_RETRY_DELAY);
        run();
    }
}

run().catch(console.log);