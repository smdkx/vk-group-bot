/* by Sergey Ushakov 2024 | https://github.com/smdkx */

//Подключение модулей и библиотек
require('dotenv').config()
const { VK, Keyboard } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const { MongoClient } = require('mongodb');

//Токен сообщества
const vk = new VK({
    token: process.env.TOKEN_GROUP
})

// MongoDB Settings
const url = process.env.MONGODB;
const client = new MongoClient(url);

client.connect()
const dbName = 'bot'
const db = client.db(dbName)
const collection = db.collection('users')

//Список ошибок
const listMessage = {
	access: 'У тебя нет прав на выполнение данной команды.',
	banned: 'Доступ к использованию данной функции был ограничен.',
	data: 'Возникла ошибка на сервере. Введи команду /home для обновления информации.',
	input: 'Такой команды не существует. Введи /help для просмотра доступных команд.'
}

//Переменная для отправки сообщений (HearManager)
const message = new HearManager()

vk.updates.on('message_new', (context, next) => {
	const { messagePayload } = context;

	context.state.command = messagePayload && messagePayload.command
		? messagePayload.command
		: null;

	return next();
});

vk.updates.on('message_new', message.middleware);

//Оболочка команд
const hearCommand = (name, conditions, handle) => {
	if (typeof handle !== 'function') {
		handle = conditions;
		conditions = [`/${name}`];
	}

	if (!Array.isArray(conditions)) {
		conditions = [conditions];
	}

	message.hear(
		[
			(text, { state }) => (
				state.command === name
			),
			...conditions
		],
		handle
	);
};

//Главная кнопочная форма
message.hear(/Начать|Start/i, (context, next) => {
	context.state.command = 'home';

	return Promise.all([
		context.send('Привет! Выбери одну из интересующих команд.'),

		next()
	]);
});

hearCommand('home', async (context) => {

	//Запись юзера в DataBase
	const user = await collection.findOne({ vk_id: context.senderId })
	if(!user) {
		await collection.insertOne({
			vk_id: context.senderId,
			admin: 0,
			banned: 0
		})
	}
	else if(user.banned === 1) return context.send(listMessage.banned)
	
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
		.applicationButton({
			label: 'SKT Go',
			appId: 7469712,
			//ownerId: -214477552,
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
			label: 'Панель «Разное»',
			payload: {
				command: 'other_panel'
			},
			color: Keyboard.PRIMARY_COLOR
		})
		.row()
		.textButton({
			label: 'Панель управления',
			payload: {
				command: 'bot_panel'
			},
			color: Keyboard.NEGATIVE_COLOR
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

hearCommand('other_panel', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await context.send({
		message: 'Панель «Разное».',
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
			label: 'Распили меня болгаркой',
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

hearCommand('bot_panel', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

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
				command: 'admin'
			},
			color: Keyboard.SECONDARY_COLOR
		})
		.textButton({
			label: 'Запросить админку',
			payload: {
				command: 'adminka'
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
	});
});

hearCommand('debug_panel', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

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

hearCommand('info', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await context.send(`Debug info:

Пользователь: ${context.senderId}
Версия бота: ${process.env.VERSION_BOT}
Версия API: ${process.env.VERSION_API}
Статус DB: Connected successfully to server`)
});
	

hearCommand('help', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	context.send(`Доступные команды:

/home — главная страница (upd. данных)
/id — узнать свой ID профиля ВКонтакте
/captcha — получить капчу (fake)
/bolgarka — получить картинку «Распили меня болгаркой»
/dengi — получить картинка «За деньги да»
/start_bot — запустить бота и создать запись (нужны права админа)
/info — информация о боте (debug)
/time — текущее время сервера
/adminka — запросить админку
/admin — узнать текущий статус админа
	
Внимание! В случае обновления бота или возникновения проблемы работы с ним следует нажать на кнопку «Обновить информацию» (аналог команды /home). Бот получит актуальную информацию с сервера.

В иных случаях стоит нажать на кнопку «Служебная информация» -> «Debug info» и предоставить данные разработчику.`)
});

hearCommand('id', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	context.send(`Твой ID ВКонтакте - ${context.senderId}`)
});

hearCommand('captcha', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await Promise.all([
		context.send('Отправляю капчу..'),

		context.sendPhotos({
			value: 'https://www.checkmarket.com/wp-content/uploads/2019/12/survey-captcha-example.png' //фото капчи
		})
	]);
});
``
hearCommand('bolgarka', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await Promise.all([
		context.send('Отправляю картинку..'),

		context.sendPhotos({
			value: 'https://sun9-75.userapi.com/impg/FT6fkms9eUpRDAPVPyT9MC3P7WGsUSQujNM1Ag/Lfyfv10cEAI.jpg?size=1080x1070&quality=95&sign=92f1a3e9fcbfdd728d17f453ad5b6341&type=album' //фото кота с болгаркой
		})
	]);
});

hearCommand('dengi', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await Promise.all([
		context.send('Отправляю картинку..'),

		context.sendPhotos({
			value: 'https://sun9-3.userapi.com/impg/l44_mwiqa5VQRrsXlpniOWKmNaDAuI1AzIIP-w/poMwUkrGGds.jpg?size=1280x1280&quality=96&sign=cb0dfca52a710e6f88fe374e5cbd0640&type=album' //фото кота за деньги да
		})
	]);
});

hearCommand('start_bot', async (context) => {
	let childProcess = require('child_process');

	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	if(user) {
		if(user.admin === 1)
		{
			context.send('Генерация выполнена, запись в сообществе создана.');
			childProcess.fork('/home/e/exojwqr1/exojwqr1.beget.tech/public_html/group_bot.js');
			//childProcess.fork('./group_bot.js');
		}
		else return context.send(listMessage.access);
	}
});

hearCommand('time', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	await context.send('Текущее время на сервере: ' + String(new Date()));
});

hearCommand('admin', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);
	
	if(user) {
		if(user.admin === 1) return context.send('Текущий статус админа: имеется.');
		else return context.send('Текущий статус админа: отсутствует.');
	}
});

hearCommand('adminka', async (context) => {
	const user = await collection.findOne({ vk_id: context.senderId })
	const user_ids = await vk.api.users.get({
		user_ids: context.senderId
	});

	if(user) {
		if(user.banned === 1) return context.send(listMessage.banned)
	}
	else return context.send(listMessage.data);

	if(user.admin === 1) {
		return context.send('Админка уже имеется, нет нужды запрашивать ее повторно.');
	}
	else {
		let rand = Math.floor(Math.random() * 100) + 1; //Рандом id сообщения от 1 до 100
		await vk.api.messages.send({
			user_id: 214477552, //кому придет сообщение от сообщества
			random_id: rand, //присвоение рандомного идентификатора сообщению
			message: `Пользователь ${user_ids[0].first_name} ${user_ids[0].last_name} (@id${context.senderId}) запросил админку.`
		});
		context.send('Админка была запрошена.');
	}
});

//=========DEBUG=========
hearCommand('debug_admin1', async (context) => {
	await collection.updateOne({vk_id: context.senderId}, {$set: {admin: 1}})
	context.send('Админка была выдана')
});

hearCommand('debug_admin0', async (context) => {
	await collection.updateOne({ vk_id: context.senderId }, { $set: { admin: 0 } } )
	context.send('Админка аннулирована')
});
//==================

message.onFallback(async (context) => {
	await context.send(listMessage.input);
});

//Logi
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);