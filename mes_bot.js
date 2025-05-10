/* by Sergey Ushakov 2025 | https://github.com/smdkx */

// Подключение модулей и библиотек
require('dotenv').config()
const { VK, Keyboard } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const { MongoClient } = require('mongodb');
const winston = require('winston');
const axios = require('axios');
const {
	ADMIN_VK
} = require('./config');

// Компоненты
const praiseText = require('./src/components/praiseText');
const memesCollection = require('./src/components/memesCollection');

// Проверка переменных окружения
const requiredEnv = ['TOKEN_GROUP', 'MONGODB'];
for (const env of requiredEnv) {
	if (!process.env[env]) {
		console.error(`Ошибка: отсутствует переменная окружения ${env}`);
		process.exit(1);
	}
}

// Проверка URL
const isValidUrl = async (url) => {
	try {
		const response = await axios.head(url, { timeout: 3000 });
		return response.status === 200;
	} catch {
		return false;
	}
};

// Токен сообщества
const vk = new VK({
	token: process.env.TOKEN_GROUP
})

// MongoDB Settings
const url = process.env.MONGODB;
const client = new MongoClient(url);

client.connect()
const dbName = 'vk_bot'
const db = client.db(dbName)
const collection = db.collection('users')

async function checkMongoDBStatus() {
	try {
		await client.db().command({ ping: 1 });
		return 'Connected';
	} catch (error) {
		logger.error(`MongoDB connection error: ${error}`);
		return `Disconnected: ${error.message}`;
	}
}

// Process
let childProcess = require('child_process');

// Logger
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'logs/combined.log' })
	]
});

// Список ошибок
const listMessage = {
	access: 'У тебя нет прав на выполнение данной команды.',
	banned: 'Доступ к использованию данной функции был ограничен.',
	data: 'Возникла ошибка на сервере. Введи команду /home для обновления информации.',
	input: 'Такой команды не существует. Введи /help для просмотра доступных команд.',
	admin: 'Пользователь является администратором, действие недоступно.',
	number: 'ID пользователя должен быть числовым.',
	found: 'Такого пользователя не существует.'
}

// Обновление юзера
async function updateUserData(vkId) {
	try {
		await collection.insertOne({
			vk_id: vkId,
			admin: 0,
			banned: 0
		});
		return true;
	} catch (error) {
		logger.error(`updateUserData error for user ${vkId}: ${error}`);
		return false;
	}
}

async function checkUser(context) {
	let vkId = context.senderId;

	const user = await collection.findOne({ vk_id: vkId });
	if (!user) {
		if (!(await updateUserData(vkId))) {
			await context.send(listMessage.data);
			return false;
		}
		context.user = await collection.findOne({ vk_id: vkId });
	} else {
		context.user = user;
	}

	if (!context.user) {
		await context.send(listMessage.data);
		return false;
	}

	if (context.user.banned === 1) {
		await context.send(listMessage.banned);
		return false;
	}
	return true;
}

// Переменная для отправки сообщений (HearManager)
const hearManager = new HearManager()

vk.updates.on('message_new', (context, next) => {
	const { messagePayload } = context;

	context.state.command = messagePayload && messagePayload.command
		? messagePayload.command
		: null;

	return next();
});

vk.updates.on('message_new', hearManager.middleware);

const hearCommand = (name, conditions, handle) => {
	if (typeof handle !== 'function') {
		handle = conditions;
		conditions = [`/${name}`];
	}

	if (!Array.isArray(conditions)) {
		conditions = [conditions];
	}

	hearManager.hear(
		[
			(text, { state }) => (
				state.command === name
			),
			...conditions
		],
		handle
	);
};

hearManager.hear(/Начать|Start/i, async (context, next) => {
	logger.info(`User ${context.senderId} started the bot`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	context.state.command = 'home';

	return Promise.all([
		await context.send('👋 Привет! Выбери одну из интересующих команд.'),

		next()
	]);
});

// ========= Started =========
hearCommand('home', async (context) => {
	logger.info(`User ${context.senderId} update the info`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send({
		message: 'Информация обновлена, данные с сервера получены.',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Обновить информацию',
				payload: {
					command: 'home'
				},
				color: Keyboard.POSITIVE_COLOR
			})
			.row()
			.urlButton({
				label: 'FORT VPN',
				url: 'https://t.me/fort_vpn_bot'
			})
			.applicationButton({
				label: 'SKT Go',
				appId: 7469712,
				ownerId: -214477552,
				//hash: ''
			})
			.row()
			.textButton({
				label: 'Информация по боту',
				payload: {
					command: 'help'
				},
				color: Keyboard.PRIMARY_COLOR
			})
			.textButton({
				label: 'Панель управления',
				payload: {
					command: 'control_panel'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
			.row()
			.textButton({
				label: 'Сервисы',
				payload: {
					command: 'services'
				},
				color: Keyboard.PRIMARY_COLOR
			})
			.textButton({
				label: 'Служебная информация',
				payload: {
					command: 'debug_panel'
				},
				color: Keyboard.PRIMARY_COLOR
			})
	});
});

hearCommand('vpn', async (context) => {
	logger.info(`User ${context.senderId} use command /vpn`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send('Рекомендуем быстрый и надежный VPN с бесплатным пробным периодом — FORT VPN: @fort_vpn_bot')
});

hearCommand('help', async (context) => {
	logger.info(`User ${context.senderId} use command /help`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send(
		`Доступные команды:\n\n` +
		`/home — главная страница (upd. данных)\n` +
		`/vpn — информация о VPN\n` +
		`/id — узнать свой ID профиля Telegram\n` +
		`/captcha — получить капчу (fake)` +
		`/bolgarka — получить картинку «Распили меня болгаркой»\n` +
		`/dengi — получить картинку «За деньги да»\n` +
		`/praise — похвалить себя \n` +
		`/memes — получить рандомный мем\n` +
		'/start_bot — запустить бота и создать запись (нужны права админа)\n' +
		'/start_piar — запустить рассылку (нужны права админа)\n' +
		`/info — информация о боте (debug)\n` +
		`/time — текущее время сервера\n` +
		`/admin_status — узнать текущий статус админа\n` +
		`/admin_help — команды администратора\n` +
		`/admin_request — запросить права администратора\n\n` +
		`/report — отправь сообщение администратору\n\n` +
		`Внимание! В случае обновления бота или возникновения проблемы работы с ним следует нажать на кнопку «Обновить информацию» (аналог команды /home). Бот получит актуальную информацию с сервера.\n\n` +
		`В иных случаях стоит нажать на кнопку «Служебная информация» —> «Debug info» и предоставить данные разработчику через команду /report.`
	);
});

// ========= Control Panel =========
hearCommand('control_panel', async (context) => {
	logger.info(`User ${context.senderId} go to Control Panel`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send({
		message: 'Панель управления.',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Вернуться на главную',
				payload: {
					command: 'home'
				},
				color: Keyboard.PRIMARY_COLOR
			})
			.row()
			.textButton({
				label: 'Узнать статус админа',
				payload: {
					command: 'admin_status'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.textButton({
				label: 'Запросить админку',
				payload: {
					command: 'admin_request'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.row()
			.textButton({
				label: 'Сгенерировать запись',
				payload: {
					command: 'start_bot'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
			.textButton({
				label: 'Запустить рассылку',
				payload: {
					command: 'start_piar'
				},
				color: Keyboard.NEGATIVE_COLOR
			})
	});
});

hearCommand('admin_status', async (context) => {
	logger.info(`User ${context.senderId} use command /admin_status`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send(`Текущий статус админа: ${context.user.admin === 1 ? 'имеется' : 'отсутствует'}.`)
});

hearCommand('admin_request', async (context) => {
	logger.info(`User ${context.senderId} use command /admin_request`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const user_ids = await vk.api.users.get({
		user_ids: context.senderId
	});

	if (context.user.admin === 1) {
		return await context.send('Админка уже имеется, нет нужды запрашивать ее повторно.');
	}
	try {
		await vk.api.messages.send({
			user_id: ADMIN_VK,
			message: `Пользователь ${user_ids[0].first_name} ${user_ids[0].last_name} (@id${context.senderId}) запросил админку.`,
			random_id: Math.floor(Math.random() * 100000)
		});
		await context.send('Админка была запрошена.');
	} catch (error) {
		logger.error(`Failed to send admin_request message: ${error}`);
		await context.send(`Не удалось отправить запрос`);
	}
});

hearManager.hear(/^(?:\/report)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /report`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const user_ids = await vk.api.users.get({
		user_ids: context.senderId
	});

	const message = context.text.split(' ').slice(1).join(' ');

	if (!message) return await context.send('Введи: /report [сообщение]')
	if (message.length > 1000) {
		return await context.send('Сообщение слишком длинное. Максимум 1000 символов.');
	}

	try {
		await vk.api.messages.send({
			user_id: ADMIN_VK,
			message: `Сообщение от ${user_ids[0].first_name} ${user_ids[0].last_name} (@id${context.senderId}): ${message}`,
			random_id: Math.floor(Math.random() * 100000)
		});
		await context.send('Ваше сообщение было успешно отправлено администратору');
	} catch (error) {
		logger.error(`Failed to send report message: ${error}`);
		await context.send(`Произошла ошибка при отправке сообщения. Попробуйте позже.`);
	}
});

hearCommand('start_bot', async (context) => {
	logger.info(`User ${context.senderId} use command /start_bot`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		context.send('Временно недоступно')
		//context.send('Генерация выполнена, запись в сообществе создана.');
		//childProcess.fork('./group_bot.js');
	} else {
		await context.send(listMessage.access);
	}
});

hearCommand('start_piar', async (context) => {
	logger.info(`User ${context.senderId} use command /start_piar`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		context.send('Временно недоступно')
		//context.send('Запущена рассылка, это займет некоторое время.');
		//childProcess.fork('./piar_bot.js');
	} else {
		await context.send(listMessage.access);
	}
});

// ========= Services =========
hearCommand('services', async (context) => {
	logger.info(`User ${context.senderId} go to Services`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send({
		message: 'Сервисы.',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Вернуться на главную',
				payload: {
					command: 'home'
				},
				color: Keyboard.PRIMARY_COLOR
			})
			.row()
			.textButton({
				label: 'Похвалить себя',
				payload: {
					command: 'praise'
				},
				color: Keyboard.POSITIVE_COLOR
			})
			.textButton({
				label: 'Получить дозу мемов',
				payload: {
					command: 'memes_request'
				},
				color: Keyboard.POSITIVE_COLOR
			})
			.row()
			.textButton({
				label: 'Узнать свой ID профиля',
				payload: {
					command: 'id'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.textButton({
				label: 'Получить капчу (fake)',
				payload: {
					command: 'captcha'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.row()
			.textButton({
				label: 'Распили болгаркой',
				payload: {
					command: 'bolgarka'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.textButton({
				label: 'За деньги да',
				payload: {
					command: 'dengi'
				},
				color: Keyboard.SECONDARY_COLOR
			})
	});
});

hearCommand('praise', async (context) => {
	logger.info(`User ${context.senderId} use command /praise`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const generateText = praiseText[Math.floor(Math.random() * praiseText.length)];

	await context.send({
		message: generateText,
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Похвалить ещё',
				payload: {
					command: 'praise'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.inline()
	});
});

hearCommand('memes_request', async (context) => {
	logger.info(`User ${context.senderId} use command /memes_request`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send({
		message: 'Хочешь получить случайный мем? Кликай на кнопку ниже! Общее количество мемов: более 200 шт. Присутствует шанс их повторения.',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Получить новый мем',
				payload: {
					command: 'memes'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.inline()
	});
});

hearCommand('memes', async (context) => {
	logger.info(`User ${context.senderId} use command /memes`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const validMemes = [];
	for (const url of memesCollection) {
		if (await isValidUrl(url)) {
			validMemes.push(url);
		}
	}

	// Проверяем, есть ли валидные мемы
	if (validMemes.length === 0) {
		await context.send('К сожалению, нет доступных мемов!');
		return;
	}

	// Выбираем случайный мем из валидных
	const generateMemes = validMemes[Math.floor(Math.random() * validMemes.length)];

	await context.sendPhotos({ value: generateMemes });

	await context.send({
		message: 'Хочешь еще дозу мемов?',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Получить новый мем',
				payload: {
					command: 'memes'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.inline()
	});
});

hearCommand('id', async (context) => {
	logger.info(`User ${context.senderId} use command /id`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send(`Твой ID ВКонтакте - ${context.senderId}`)
});

hearCommand('captcha', async (context) => {
	logger.info(`User ${context.senderId} use command /captcha`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await Promise.all([
		await context.send('Отправляю капчу..'),

		await context.sendPhotos({
			value: 'https://www.checkmarket.com/wp-content/uploads/2019/12/survey-captcha-example.png' //фото капчи
		})
	]);
});

hearCommand('bolgarka', async (context) => {
	logger.info(`User ${context.senderId} use command /bolgarka`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await Promise.all([
		await context.send('Отправляю картинку..'),

		await context.sendPhotos({
			value: 'https://sun9-75.userapi.com/impg/FT6fkms9eUpRDAPVPyT9MC3P7WGsUSQujNM1Ag/Lfyfv10cEAI.jpg?size=1080x1070&quality=95&sign=92f1a3e9fcbfdd728d17f453ad5b6341&type=album' //фото кота с болгаркой
		})
	]);
});

hearCommand('dengi', async (context) => {
	logger.info(`User ${context.senderId} use command /dengi`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await Promise.all([
		await context.send('Отправляю картинку..'),

		await context.sendPhotos({
			value: 'https://sun9-3.userapi.com/impg/l44_mwiqa5VQRrsXlpniOWKmNaDAuI1AzIIP-w/poMwUkrGGds.jpg?size=1280x1280&quality=96&sign=cb0dfca52a710e6f88fe374e5cbd0640&type=album' //фото кота за деньги да
		})
	]);
});

// ========= Debug Panel =========
hearCommand('debug_panel', async (context) => {
	logger.info(`User ${context.senderId} go to Debug Panel`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send({
		message: 'Служебная информация.',
		keyboard: Keyboard.builder()
			.textButton({
				label: 'Вернуться на главную',
				payload: {
					command: 'home'
				},
				color: Keyboard.PRIMARY_COLOR
			})
			.row()
			.textButton({
				label: 'Серверное время',
				payload: {
					command: 'time'
				},
				color: Keyboard.SECONDARY_COLOR
			})
			.textButton({
				label: 'Debug info',
				payload: {
					command: 'info'
				},
				color: Keyboard.SECONDARY_COLOR
			})
	});
});

hearCommand('time', async (context) => {
	logger.info(`User ${context.senderId} use command /time`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	await context.send('Текущее время на сервере: ' + String(new Date()));
});

hearCommand('info', async (context) => {
	logger.info(`User ${context.senderId} use command /info`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const dbStatus = await checkMongoDBStatus();
	await context.send(
		`Debug info:\n\n` +
		`Пользователь: ${context.senderId}\n` +
		`Версия бота: ${process.env.VERSION_BOT}\n` +
		`Версия API: ${process.env.VERSION_API}\n` +
		`Статус DB: ${dbStatus}`
	);
});

// ========= Admins Commands =========
hearCommand('admin_help', async (context) => {
	logger.info(`User ${context.senderId} use command /admin_help`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		await context.send(
			`Доступные команды для администраторов:\n\n` +
			`/status — узнать информацию о пользователе\n` +
			`/ban — забанить пользователя\n` +
			`/unban — разбанить пользователя\n` +
			`/bans — список заблокированных пользователей\n` +
			`/admins — список администраторов\n` +
			`/users — список зарегистрированных пользователей\n` +
			`/makeadmin — назначить администратором\n` +
			`/resetadmin — аннулировать права администратора` +
			`/delete — удалить пользователя из базы данных\n` +
			`/ames — отправить сообщение от лица администратора\n`
		);
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/status)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /status`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const param1 = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /status [ID пользователя]')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		await context.send(
			`Информация о пользователе @id${param_user.vk_id}:\n` +
			`VK ID: ${param_user.vk_id}\n` +
			`Статус администратора: ${param_user.admin === 1 ? 'Имеется' : 'Отсутствует'}\n` +
			`Статус бана: ${param_user.banned === 1 ? 'Заблокирован' : 'Не заблокирован'}`
		);
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/ban)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /ban`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const params = context.text.split(' ').slice(1);
	const param1 = params[0];
	const reason = params.slice(1).join(' ');
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /ban [ID пользователя] [причина]')
		if (!reason) return await context.send('Укажи причину блокировки: /ban [ID пользователя] [причина]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно заблокировать самого себя.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		if (param_user.banned === 1) return await context.send('Пользователь уже заблокирован.')
		if (param_user.admin === 1) return await context.send(listMessage.admin)
		logger.info(`User ${context.senderId} banned @${param1} to reason: ${reason}`);
		await collection.updateOne({ vk_id: parseInt(param1) }, { $set: { banned: 1 } })
		await context.send(`Пользователь @id${param1} был заблокирован. Причина: ${reason}`);

		try {
			await vk.api.messages.send({
				user_id: parseInt(param1),
				message: `Доступ к использованию бота был ограничен. Причина: ${reason}`,
				random_id: Math.floor(Math.random() * 100000)
			});
		} catch (error) {
			logger.error(`Failed to send ban message to user ${param1}: ${error}`);
			await context.send(`Не удалось отправить сообщение о блокировке пользователю @id${param1}`);
		}
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/unban)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /unban`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const param1 = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /unban [ID пользователя]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно разбанить самого себя.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		if (param_user.banned === 0) return await context.send('Пользователь не заблокирован.')
		if (param_user.admin === 1) return await context.send(listMessage.admin)
		logger.info(`User ${context.senderId} unbanned @${param1}`);
		await collection.updateOne({ vk_id: parseInt(param1) }, { $set: { banned: 0 } })
		await context.send(`Пользователь @id${param1} был разбанен.`)

		try {
			await vk.api.messages.send({
				user_id: parseInt(param1),
				message: 'Доступ к использованию бота был возвращен.',
				random_id: Math.floor(Math.random() * 100000)
			});
		} catch (error) {
			logger.error(`Failed to send unban message to user ${param1}: ${error}`);
			await context.send(`Не удалось отправить сообщение пользователю @id${param1}`);
		}
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^\/bans$/i, async (context) => {
	logger.info(`User ${context.senderId} use command /bans`);
	const isAllowed = await checkUser(context);
	if (!isAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		const bannedUsers = await collection.find({ banned: 1 }).toArray();
		if (bannedUsers.length === 0) {
			return await context.send('Нет заблокированных пользователей.');
		}

		let userList;

		try {
			userList = bannedUsers
				.map(user => `@id${user.vk_id}`)
				.join('\n');
		} catch (error) {
			logger.error(`Failed to fetch user data for /bans: ${error}`);
			userList = bannedUsers
				.map(user => `@id${user.vk_id} [Данные недоступны]`)
				.join('\n');
		}
		await context.send(`Список заблокированных пользователей:\n\n${userList}`);
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^\/admins$/i, async (context) => {
	logger.info(`User ${context.senderId} use command /admins`);
	const isAllowed = await checkUser(context);
	if (!isAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		const adminUsers = await collection.find({ admin: 1 }).toArray();
		if (adminUsers.length === 0) {
			return await context.send('Администраторы отсутствуют.');
		}

		let userList;

		try {
			userList = adminUsers
				.map(user => `@id${user.vk_id}`)
				.join('\n');
		} catch (error) {
			logger.error(`Failed to fetch user data for /admins: ${error}`);
			userList = adminUsers
				.map(user => `@id${user.vk_id} [Данные недоступны]`)
				.join('\n');
		}

		await context.send(`Список администраторов:\n\n${userList}`);
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^\/users$/i, async (context) => {
	logger.info(`User ${context.senderId} use command /users`);
	const isAllowed = await checkUser(context);
	if (!isAllowed) {
		return;
	}

	if (context.user.admin === 1) {
		const allUsers = await collection.find({}).toArray();
		if (allUsers.length === 0) {
			return await context.send('Зарегистрированные пользователи отсутствуют.');
		}

		let userList;

		try {
			userList = allUsers
				.map(user => `@id${user.vk_id}`)
				.join('\n');
		} catch (error) {
			logger.error(`Failed to fetch user data for /users: ${error}`);
			userList = allUsers
				.map(user => `@id${user.vk_id} [Данные недоступны]`)
				.join('\n');
		}

		await context.send(`Список зарегистрированных пользователей:\n\n${userList}`);
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/makeadmin)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /makeadmin`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const param1 = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /makeadmin [ID пользователя]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно выдать права администратора самому себе.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		if (param_user.admin === 1) return await context.send(listMessage.admin)
		logger.info(`User ${context.senderId} makeadmin @${param1}`);
		await collection.updateOne({ vk_id: parseInt(param1) }, { $set: { admin: 1 } })
		await context.send(`Пользователю @id${param1} были выданы права администратора.`)

		try {
			await vk.api.messages.send({
				user_id: parseInt(param1),
				message: 'Вам были выданы права администратора.',
				random_id: Math.floor(Math.random() * 100000)
			});
		} catch (error) {
			logger.error(`Failed to send makeadmin message to user ${param1}: ${error}`);
			await context.send(`Не удалось отправить сообщение пользователю @id${param1} (возможно, закрыты личные сообщения)`);
		}
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/resetadmin)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /resetadmin`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const param1 = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /resetadmin [ID пользователя]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно аннулировать права администратора самому себе.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		if (param_user.admin === 0) return await context.send('Пользователь не является администратором.')
		logger.info(`User ${context.senderId} resetadmin @${param1}`);
		await collection.updateOne({ vk_id: parseInt(param1) }, { $set: { admin: 0 } })
		await context.send(`Пользователю @id${param1} были аннулированы права администратора.`)

		try {
			await vk.api.messages.send({
				user_id: parseInt(param1),
				message: 'Права администратора были аннулированы.',
				random_id: Math.floor(Math.random() * 100000)
			});
		} catch (error) {
			logger.error(`Failed to send resetadmin message to user ${param1}: ${error}`);
			await context.send(`Не удалось отправить сообщение пользователю @id${param1}`);
		}
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/delete)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /delete`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const param1 = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /delete [ID пользователя]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно удалить самого себя.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		if (param_user.admin === 1) return await context.send(listMessage.admin)
		logger.info(`User ${context.senderId} delete @${param1}`);
		await collection.deleteOne({ vk_id: parseInt(param1) })
		await context.send(`Пользователь @id${param1} был удален из базы данных.`)
	} else {
		await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/ames)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /ames`);
	const isUserAllowed = await checkUser(context);
	if (!isUserAllowed) {
		return;
	}

	const params = context.text.split(' ').slice(1);
	const param1 = params[0];
	const text = params.slice(1).join(' ');
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if (context.user.admin === 1) {
		if (!param1) return await context.send('Введи: /ames [ID пользователя] [сообщение]')
		if (!text) return await context.send('Укажи сообщение пользователю: /ames [ID пользователя] [сообщение]')
		if (param_user && param_user.vk_id === context.senderId) return await context.send('Невозможно написать самому себе.')
		if (!Number(param1)) return await context.send(listMessage.number)
		if (!param_user) return await context.send(listMessage.found)
		logger.info(`User ${context.senderId} send message @${param1}: ${text}`);
		await context.send(`Вы отправили пользователю @id${param1} сообщение: ${text}`);

		try {
			await vk.api.messages.send({
				user_id: parseInt(param1),
				message: `Администратор отправил вам сообщение: ${text}`,
				random_id: Math.floor(Math.random() * 100000)
			});
		} catch (error) {
			logger.error(`Failed to send message to user ${param1}: ${error}`);
			await context.send(`Не удалось отправить сообщение пользователю @id${param1} (возможно, закрыты личные сообщения)`);
		}
	} else {
		await context.send(listMessage.access);
	}
});

// ========= DEBUG COMMAND =========
hearCommand('debug_admin1', async (context) => {
	logger.info(`User ${context.senderId} use command /debug_admin1`);
	await collection.updateOne({ vk_id: context.senderId }, { $set: { admin: 1 } })
	context.send('Админка была выдана.')
});

hearCommand('debug_admin0', async (context) => {
	logger.info(`User ${context.senderId} use command /debug_admin0`);
	await collection.updateOne({ vk_id: context.senderId }, { $set: { admin: 0 } })
	context.send('Админка аннулирована.')
});
// ========= OTHERS =========

hearManager.onFallback(async (context) => {
	logger.info(`User ${context.senderId} write ${context.text}`);
	await context.send(listMessage.input);
});

// Logs
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);