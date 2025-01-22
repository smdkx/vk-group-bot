/* by Sergey Ushakov 2025 | https://github.com/smdkx */

//Подключение модулей и библиотек
require('dotenv').config()
const { VK, Keyboard } = require('vk-io')
const { HearManager } = require('@vk-io/hear')
const { MongoClient } = require('mongodb');
const winston = require('winston');

//Токен сообщества
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

//Process
let childProcess = require('child_process');

//Logger
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
	  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
	  new winston.transports.File({ filename: 'logs/combined.log' })
	]
});

//Список ошибок
const listMessage = {
	access: 'У тебя нет прав на выполнение данной команды.',
	banned: 'Доступ к использованию данной функции был ограничен.',
	data: 'Возникла ошибка на сервере. Введи команду /home для обновления информации.',
	input: 'Такой команды не существует. Введи /help для просмотра доступных команд.',
	admin: 'Пользователь является администратором, действие недоступно.',
	number: 'ID пользователя должен быть числовым.',
	found: 'Такого пользователя не существует.'
}

//Хвалебный текст
const praiseText = [
	'Хвалю тебя так же сильно, как владельцы Xiaomi нахваливают свой телефон.',
	'Если бы похвалу выдавали чипсами с крабом, то в мире больше никто не ел бы крабовые чипсы, кроме тебя.',
	'Я уже похвалил всю похвалу, но для тебя у меня всегда припасено немножечко. Ты ум-нич-ка.',
	'Твой код настолько чист, что даже алгоритмы Google приходят за советом.',
	'Плюсы и минусы есть у батареек, а твоя работа — восхитительна!',
	'Тебе попался 45-й текст для бота, который написал реальный человек. И он очень тебя понимает и передаёт поддержку и хвальбу!',
	'Я реально плохо сплю из-за факта, что где-то не похвалено. Ты молодец! Вот теперь похвалено, теперь хорошо.',
	'Во-первых, я тебя хвалю. А во-вторых, если ты думаешь, что у тебя сложная работа, — вспомни, что есть работа над отношениями.',
	'Твоё умение находить решения так впечатляет, что даже самые сложные таски кажутся простыми, когда ты за них берёшься.',
	'Даже когда дела накапливаются как снежный ком, ты можешь слепить из всего этого самого милого снеговика!', //10
	'Когда ты берёшься за работу, даже самые заковыристые задачи становятся понятными как азбука. Ты превращаешь сложное в простое!',
	'Я могу забыть дома наушники, зонтик или карточку, но вот похвалить тебя за твою классную работу — никогда!',
	'Разбей задачи на подзадачи, а потом на микрозадачи и нанозадачи. И вот уже нет никаких задач, всё растворилось в экзистенциальной дыре, а ты тут сидишь и смотришь в экран. Хвалю, кстати.',
	'Я могу похвалить тебя как дальняя родственница, с которой вы никогда не виделись, но она почему-то помнит странные подробности из твоего детства.',
	'Ох, день такой вот… ну не очень прям. Ещё задачи эти на тебя с экрана глядят… и как-то похвалы хочется. Дыши, если узнаёшь себя. Ну а пока дышишь, я тебе скажу, что круче тебя нет никого (это точно).',
	'Молодец! Ты всегда делаешь всё, что можешь! А когда ничего не делаешь, то ничего и не можешь.',
	'Твои идеи светятся ярче, чем глаза проджекта, который пишет в чат фразу «чтобы что».',
	'Когда ты пишешь код, даже интернет замирает в ожидании, чтобы узнать, как правильно работать.',
	'Вот бы все поддерживали так же, как они находят ошибки, правда? Но тебя не сломить! Ты — камень в буре, несгибаемый и непоколебимый.',
	'Твоя работа так впечатляет, что скоро тебя добавят в список достопримечательностей города.',
	'Ты заслуживаешь похвалы больше, чем тот, кто принёс на школьное чаепитие химозный рулетик (хотя мы с тобой понимаем, что это почти невозможно).', //20
	'Вот бы все хвалили так же, как правки вносят, да? Держись, пожалуйста, ты молодец, что не переворачиваешь стол вместе со всеми кружками.',
	'Ты настолько круто со всем справляешься, что даже временная сложность боится с тобой встретиться.',
	'Пой так, будто никто не слышит, танцуй так, будто никто не видит, работай так… как обычно — ты лучше всех, не придраться!',
	'В такой день вылезти из кровати — уже подвиг, а ты ещё что-то даже работаешь там, делаешь… я в шоке просто!',
	'Твой код настолько понятен, что даже компьютеры читают его для удовольствия.',
	'print("Ты лучший!")',
	'Привет, как думаешь, что победит? Желание закрыть таску идеально или панический страх сделать неидеально? Я думаю, что в итоге победишь ты, потому что ты умничка.',
	'Ты как солнечный лучик в пасмурный день — даже когда усталость накатывает, твоя улыбка освещает всё вокруг.',
	'Так, сегодня ты трудишься просто не покладая рук. Теперь срочно нужно поесть вкусни и подобрать себе к ужину изысканные VK Клипы.',
	'Ты как солнечный лучик в пасмурный день — даже когда усталость накатывает, твоя улыбка освещает всё вокруг.',
	'Честно скажу: преодолеть вот этот злосчастный соблазн полистать рилсы во время работы или зависнуть в мем-каналах — невероятно сложно. Но у тебя получается. Ты для меня пример.', //30
	'Сколько перерывов на кофе сегодня было? Ты заслуживаешь вдвое больше, потому что работаешь классно и со всем справляешься!',
	'В шестнадцатеричной системе ты работаешь на 64 из 64!',
	'Я не знаю, нужно ли это тебе сейчас, но тебе точно не нужно мириться с людьми, которые тебя не хвалят, говорят с тобой так, будто бы тебе достаточно похвалы, обращаются с тобой так, как будто уже 100 раз хвалили, недостаточно хвалебно относятся к тебе. Это неправильное поведение. Они могли бы за что-то похвалить тебя, могли бы поднять тебе настроение комплиментами. Люди, которые по-настоящему заботятся о тебе, делали бы так, как я.',
	'Ты просто лучик среди тучек. Молодец!',
	'Даже когда ты говоришь «пу-пу-пу», это звучит как призыв к действию и очень мотивирует всю команду!',
	'Твои проекты настолько успешны, что GitHub уже подумывает заблочить твой аккаунт за чрезмерную продуктивность!',
	'Ну реально, на тебе же всё держится! И ты держись, пожалуйста, а то всё упадёт!',
	'Живи в своё удовольствие, но не забывай про тех, кто рядом (с) Джейсон Стетхем\nТы молодец (с) Хвалёша',
	'Странно, что летом в сутках 48 часов, а зимой — всего 2. Но ты всё равно очень хорошо справляешься со всем даже в таких условиях.',
	'Каждый раз, когда ты говоришь: «Давайте попробуем так» — мы знаем, что нас ждёт очередное классное решение.', //40
	'Кончик языка совершает путь в три шажка вниз по нёбу, чтобы на третьем толкнуться о зубы. Ум-нич-ка.',
	'Нет, твоя работа — не кринж. Ты вообще никогда не делаешь кринж. Ты делаешь только базу.',
	'Твоя способность думать наперёд — это свет фары в тумане для всей нашей команды. Благодаря тебе мы всегда знаем, куда двигаться.',
	'Ё-маё, да что творится-то такое?! Тут нехваленный человек сидит. Срочно исправляем ситуацию. Ты МО-ЛО-ДЕЦ!',
	'Всё, что сегодня получилось, получилось хорошо настолько, насколько это возможно. Ты молодец!',
	'Каждый твой проект — как день рождения: всегда приносит радость и ощущение, что всё обязательно получится.',
	'Давай, последний рывочек! Уже столько задачек было закрыто — ты точно сможешь и эту осилить. Хвалю тебя жёстко, ты молодец!',
	'Фух, ну и работёнки сегодня, да? Я вижу, как ты стараешься, главное — это себя беречь. Ты же помнишь, что если не получается снимать стресс, то лучше его не надевать?',
	'Представь: два тигра чилят в природном бассейне. Один другому положил большущую тигриную лапу на голову и говорит: «Ты котя». А второй (с лапой на голове) отвечает ему: «Я котя». Так вот, это мы.',
	'Без хвалений опять сидишь? Ужас какой! Хвалю тебя очень сильно — так же сильно, как ты любишь сырки с варёной сгущёнкой.', //50
	'Я удивляюсь, как у тебя получается работать под давлением, ты словно кухонный блендер: чем больше давишь, тем лучше результат.'
]

//Обновление юзера
async function updateUserData(userId) {
	logger.info(`User ${userId} update data`);
	await collection.insertOne({
		vk_id: userId, //vk_id
		admin: 0, //adminka
		banned: 0 //ban
	})
}

//Переменная для отправки сообщений (HearManager)
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
	context.state.command = 'home';

	return Promise.all([
		await context.send('👋 Привет! Выбери одну из интересующих команд.'),

		next()
	]);
});

//========= Started =========
hearCommand('home', async (context) => {
	logger.info(`User ${context.senderId} update the info`);
	const user = await collection.findOne({ vk_id: context.senderId })

	if(!user) {
		updateUserData(context.senderId)
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
			label: 'Панель «Разное»',
			payload: {
				command: 'other_panel'
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
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await context.send('Рекомендуем быстрый и надежный VPN с бесплатным пробным периодом — FORT VPN: @fort_vpn_bot')
});

hearCommand('help', async (context) => {
	logger.info(`User ${context.senderId} use command /help`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await context.send(`Доступные команды:

/home — главная страница (upd. данных)
/vpn — информация о VPN
/id — узнать свой ID профиля ВКонтакте
/captcha — получить капчу (fake)
/bolgarka — получить картинку «Распили меня болгаркой»
/dengi — получить картинку «За деньги да»
/praise — похвалить себя 
/start_bot — запустить бота и создать запись (нужны права админа)
/start_piar — запустить рассылку (нужны права админа)
/info — информация о боте (debug)
/time — текущее время сервера
/admin_status — узнать текущий статус админа
/admin_help — команды администратора
/admin_request — запросить права администратора
	
Внимание! В случае обновления бота или возникновения проблемы работы с ним следует нажать на кнопку «Обновить информацию» (аналог команды /home). Бот получит актуальную информацию с сервера.

В иных случаях стоит нажать на кнопку «Служебная информация» —> «Debug info» и предоставить данные разработчику — @gray.`)
});

//========= Control Panel =========
hearCommand('control_panel', async (context) => {
	logger.info(`User ${context.senderId} go to Control Panel`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

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
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user) {
		if(user.admin === 1) return await context.send('Текущий статус админа: имеется.');
		else return await context.send('Текущий статус админа: отсутствует.');
	}
});

hearCommand('admin_request', async (context) => {
	logger.info(`User ${context.senderId} use command /admin_request`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const user_ids = await vk.api.users.get({
		user_ids: context.senderId
	});

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	if(user.admin === 1) {
		return await context.send('Админка уже имеется, нет нужды запрашивать ее повторно.');
	}
	else {
		let rand = Math.floor(Math.random() * 100) + 1; //Рандом id сообщения от 1 до 100
		await vk.api.messages.send({
			user_id: 214477552, //кому придет сообщение от сообщества
			random_id: rand, //присвоение рандомного идентификатора сообщению
			message: `Пользователь ${user_ids[0].first_name} ${user_ids[0].last_name} (@id${context.senderId}) запросил админку.`
		});
		await context.send('Админка была запрошена.');
	}
});

hearCommand('start_bot', async (context) => {
	logger.info(`User ${context.senderId} use command /start_bot`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	if(user.admin === 1)
	{
		context.send('Временно недоступно')
		context.send('Генерация выполнена, запись в сообществе создана.');
		childProcess.fork('./group_bot.js');
	}
	else return await context.send(listMessage.access);
});

hearCommand('start_piar', async (context) => {
	logger.info(`User ${context.senderId} use command /start_piar`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	if(user.admin === 1)
	{
		//context.send('Временно недоступно')
		context.send('Запущена рассылка, это займет некоторое время.');
		childProcess.fork('./piar_bot.js');
	}
	else return await context.send(listMessage.access);
});

//========= Panel Other =========
hearCommand('other_panel', async (context) => {
	logger.info(`User ${context.senderId} go to the Other Panel`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

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
			label: 'Похвалить себя',
			payload: {
				command: 'praise'
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
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

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

hearCommand('id', async (context) => {
	logger.info(`User ${context.senderId} use command /id`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await context.send(`Твой ID ВКонтакте - ${context.senderId}`)
});

hearCommand('captcha', async (context) => {
	logger.info(`User ${context.senderId} use command /captcha`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await Promise.all([
		await context.send('Отправляю капчу..'),

		await context.sendPhotos({
			value: 'https://www.checkmarket.com/wp-content/uploads/2019/12/survey-captcha-example.png' //фото капчи
		})
	]);
});
``
hearCommand('bolgarka', async (context) => {
	logger.info(`User ${context.senderId} use command /bolgarka`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await Promise.all([
		await context.send('Отправляю картинку..'),

		await context.sendPhotos({
			value: 'https://sun9-75.userapi.com/impg/FT6fkms9eUpRDAPVPyT9MC3P7WGsUSQujNM1Ag/Lfyfv10cEAI.jpg?size=1080x1070&quality=95&sign=92f1a3e9fcbfdd728d17f453ad5b6341&type=album' //фото кота с болгаркой
		})
	]);
});

hearCommand('dengi', async (context) => {
	logger.info(`User ${context.senderId} use command /dengi`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await Promise.all([
		await context.send('Отправляю картинку..'),

		await context.sendPhotos({
			value: 'https://sun9-3.userapi.com/impg/l44_mwiqa5VQRrsXlpniOWKmNaDAuI1AzIIP-w/poMwUkrGGds.jpg?size=1280x1280&quality=96&sign=cb0dfca52a710e6f88fe374e5cbd0640&type=album' //фото кота за деньги да
		})
	]);
});

//========= Debug Panel =========
hearCommand('debug_panel', async (context) => {
	logger.info(`User ${context.senderId} go to Debug Panel`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

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
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await context.send('Текущее время на сервере: ' + String(new Date()));
});

hearCommand('info', async (context) => {
	logger.info(`User ${context.senderId} use command /info`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	await context.send(`Debug info:\n\nПользователь: ${context.senderId}\nВерсия бота: ${process.env.VERSION_BOT}\nВерсия API: ${process.env.VERSION_API}\nСтатус DB: Connected successfully to server`)
});

//========= Admins Commands =========
hearCommand('admin_help', async (context) => {
	logger.info(`User ${context.senderId} use command /admin_help`);
	const user = await collection.findOne({ vk_id: context.senderId })
	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);

	if(user) {
		if(user.admin === 1)
		{
			context.send(`Доступные команды для администраторов:\n\n/status — узнать статус пользователя\n/ban — забанить пользователя\n/unban — разбанить пользователя\n/delete — удалить пользователя из базы данных\n/makeadmin — назначить администратором\n/resetadmin — аннулировать права администратора`);
		}
		else return await context.send(listMessage.access);
	}
});

hearManager.hear(/^(?:\/status)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /status`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /status [ID пользователя]') 
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		const status_user = await collection.findOne({ vk_id: parseInt(param1) })
		//await context.send(status_user)
		await context.send('Временно недоступно.')
	}
	else return await context.send(listMessage.access);
});

hearManager.hear(/^(?:\/ban)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /ban`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /ban [ID пользователя]')
		if(!param_user === user) return await context.send('Невозможно заблокировать самого себя.')
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		if(param_user.banned === 1) return await context.send('Пользователь уже заблокирован.')
		if(param_user.admin === 1) return await context.send(listMessage.admin)
		await collection.updateOne({vk_id: parseInt(param1)}, {$set: {banned: 1}})
		await context.send(`Пользователь @id${param1} был заблокирован.`)
	}
	else return await context.send(listMessage.access);
});

hearManager.hear(/^(?:\/unban)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /unban`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /unban [ID пользователя]') 
		if(!param_user === user) return await context.send('Невозможно разбанить самого себя.')
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		if(param_user.banned === 0) return await context.send('Пользователь не заблокирован.')
		if(param_user.admin === 1) return await context.send(listMessage.admin)
		await collection.updateOne({vk_id: parseInt(param1)}, {$set: {banned: 0}})
		await context.send(`Пользователь @id${param1} был разбанен.`)
	}
	else return await context.send(listMessage.access);
});

hearManager.hear(/^(?:\/makeadmin)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /makeadmin`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /makeadmin [ID пользователя]') 
		if(!param_user === user) return await context.send('Невозможно выдать права администратора самому себе.')
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		if(param_user.admin === 1) return await context.send(listMessage.admin)
		await collection.updateOne({vk_id: parseInt(param1)}, {$set: {admin: 1}})
		await context.send(`Пользователю @id${param1} были выданы права администратора.`)
	}
	else return await context.send(listMessage.access);
});

hearManager.hear(/^(?:\/resetadmin)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /resetadmin`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /resetadmin [ID пользователя]') 
		if(!param_user === user) return await context.send('Невозможно аннулировать права администратора самому себе.')
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		if(param_user.admin === 0) return await context.send('Пользователь не является администратором.')
		await collection.updateOne({vk_id: parseInt(param1)}, {$set: {admin: 0}})
		await context.send(`Пользователю @id${param1} были аннулированы права администратора.`)
	}
	else return await context.send(listMessage.access);
});

hearManager.hear(/^(?:\/delete)(?:\s+(.+)|$)/i, async (context) => {
	logger.info(`User ${context.senderId} use command /delete`);
	const user = await collection.findOne({ vk_id: context.senderId })
	const [param1] = context.text.split(' ').slice(1)
	const param_user = await collection.findOne({ vk_id: parseInt(param1) })

	if(user) {
		if(user.banned === 1) return await context.send(listMessage.banned)
	}
	else return await context.send(listMessage.data);
	
	if(user.admin === 1)
	{
		if(!param1) return await context.send('Введи: /delete [ID пользователя]') 
		if(!param_user === user) return await context.send('Невозможно удалить самого себя.')
		if(!Number(param1)) return await context.send(listMessage.number)
		if(!param_user) return await context.send(listMessage.found)
		if(param_user.admin === 1) return await context.send(listMessage.admin)
		await collection.deleteOne({vk_id: parseInt(param1)})
		await context.send(`Пользователь @id${param1} был удален из базы данных.`)
	}
	else return await context.send(listMessage.access);
});

//========= DEBUG COMMAND =========
hearCommand('debug_admin1', async (context) => {
	logger.info(`User ${context.senderId} use command /debug_admin1`);
	await collection.updateOne({vk_id: context.senderId}, {$set: {admin: 1}})
	context.send('Админка была выдана.')
});

hearCommand('debug_admin0', async (context) => {
	logger.info(`User ${context.senderId} use command /debug_admin0`);
	await collection.updateOne({ vk_id: context.senderId }, { $set: { admin: 0 } } )
	context.send('Админка аннулирована.')
});
//=========

hearManager.onFallback(async (context) => {
	logger.info(`User ${context.senderId} write ${context.text}`);
	await context.send(listMessage.input);
});

//Logi
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);