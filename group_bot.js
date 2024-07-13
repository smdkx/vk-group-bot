/* by Sergey Ushakov 2024 | https://github.com/smdkx */

//Подключение модулей и библиотек
require('dotenv').config()
const { VK } = require('vk-io')

//Токен пользователя
const vk = new VK({
	token: process.env.TOKEN_USER
});

//Цитаты для бота
const currentText = [
	'Сегодня читал книжку про java, не успел',
	'Увы, победа не сегодня',
	'Завтра перезвоню',
	'Возможно завтра победим',
	'Отстаньте, пожалуйста',
	'Бочонок пытался, не удалось',
	'Я обязательно выживу..',
	'Классный бот',
	'[Голосовое сообщение]',
	'Жалко продуктов нет нормальных (в холодильнике)',
	'Сегодня изобрел велосипед',
	'Сегодня проснулся и нашел под кроватью микроконтроллер',
	'Недавно купил подписку VK Music',
	'Я вам ничего не должен',
	'Поставил свечку за микроконтроллер',
	'Играл в танки. Есть пробитие (больно)',
	'Громко слушал гачибас ночью',
	'Я не гей, но изучаю микроконтроллеры',
	'Кадиллак гачиремикс',
	'Откуда в клипе пососи номера пососи',
	'Поехали в ресторан русский немец и еврей',
	'Удалил пользователя admin',
	'Бочонок с пивом (повезло повезло)',
	'Эх, щас бы пельменей с мазиком',
	'Случилось ЧП (чайный пакетик), сегодня никуда не идем',
	'Закомментировал ошибку и все заработало',
	'Скоро новые клипы (нет)',
	'Не прошел собеседование',
	'Утро начинается не с кофе, а с документации на 400 страниц',
	'Попытался починить коммутатор, но сломал терминал',
	'Ну мам, сегодня не надо в школу',
	'Пурпурный брабус (синий)',
	'Забыл пароль от компьютера',
	'Ой, мама пришла',
	'Функция .dead не сработала, опять идти на завод',
	'Щас бы каникулы, а не вот это все',
	'Не продали энергетик',
	'Хлаоми топ за свои гривны',
	'Опять хлаоми в кредит взял',
	'Не покупайте эпол (яблоко), мама не одобрит',
	'Уронил сервак себе на ногу (ай)',
	'Попытался настроить гомутатор (киска)',
	'Опять обнова на 100 гигов',
	'Снова уронили лк, домашки не будет',
	'Когда фит с кристалом и моетом',
	'Заказал суши и объелся (умер)',
	'Я съел деда, самый сытный дед',
	'Выпала лега в бабл стас',
	'песня айс разными голосами.',
	'Сегодня купил белый монстер',
	'Маленький Диверсантик будет дежурить все лето (Саня сказал, что у нас не Ермак)',
	'ЕЕЕЕ кансел зет',
	'реквест рекон флу овер',
	'Дед опять ушел за кофе &#129397;',
	'Сальванидес альпанчо',
	'Овальски, обстановка.',
	'У Артема опять умер интернет (бабл квас лагает)',
	'Сторожок сторожит сторожку',
	'Удалил калзон и стал натуралом (почти)',
	'Код опять не работает :==D',
	'Пароль от фиви янг льда: qwerty2025',
	'Не смог создать папку',
	'Оп оп живем живем',
	'Все получат по е-баллу',
	'Опять попа после танков болит :(',
	'Я хотел ну или уже не хотел не помню крч',
	'Опять время в лобби накручиваю',
	'Мама шнур от компьютера забрала',
	'Сейчас бы замок в Геленджике',
	'Дед, пей таблетки, а то получишь по жопе',
	'Пиксель крутой',
	'Снова понизили социальный рейтинг.',
	'Клипы &#129305;&#129305;&#129305;',
	'Получил новый мерч, мама считает меня модным',
	'Стал системным администратором',
	'Накопил на теслу (слава богу не тринашка)',
	'Пересчитаем ваше очко',
	'Артем стал гулем (жижа)',
	'Левой чистоту, правой суету',
	'Суету навести захотелось.',
	'Купил еще один макбук (спасибо папаша)',
	'Трэп-хаус или трэп-хата',
	'Делаю вдох так пахнет диор',
	'Разработчик умер, найдите нового.',
	'Это клип за 10 лямов',
	'Произошел кибербуллинг.',
	'Страница недоступна, лк умер',
	'Вступаем в клан A4 Production',
	'Саша не шарит за клипы ВКонтакте, он позер',
	'Саша шарит за тикток, но он все равно позер',
	'Саша зашел фармить V4',
	'Шарю за клипы ВКонтакте',
	'Получил мерч от ВКонтакте',
	'Повысил социальный рейтинг',
	'Хлаоми опять лагает',
	'Главный хейтер хлаоми.',
	'Разработчик бота крутой (спс).',
	'За таблетками надо сходить',
	'Сегодня забыл выпить таблетки',
	'Сырок Б.Ю. Александров (aka Ростагрокомплекс)',
	'Оформил подписку на YouTube Premium (мажор)',
	'Это ламба, а это гелик',
	'Устроил в школе 1000-7',
	'Я не клоун, просто в цирк попал!',
	'Все хотят — я дам им шоу.',
	'Добрый день, я оператор Дмитрий.',
	'Ель проблема',
	'Я легенда как Цой, но такой молодой!',
	'Пацаны погнали за шаурмой',
	'Подавился чайным пакетиком',
	'Чупапи муняня!',
	'Могус бобус бробус бравл старс',
	'lipsi ha lipsi ha lipsi guv me many ha',
	'Ярик пошел за шавой в гараж',
	'Тринашечник завел тринашку',
	'Купил новый iPoh',
	'Нежинский опоздает.',
	'Чупапишь быстро не мунянишь близко',
	'Прошел собеседование, взяли на стажик!',
	'Чикибрякнулся',
	'У кого нет макбука, объяснитесь, как так вышло.',
	'Ярик превратился в шаурму',
	'Щас бы в Вену съездить (город)',
	'Молодой лёд слишком молодой.',
	'Ты че сынок !@#$%*? Да, пап.',
	'ذهبت للشاورما',  //пошел за шаурмой
	'Сашочек пирожочек сьел пирожок (пыльный такой)',
	'Анимешники устроили суету (сволочи)',
	'Я Navai, ты HammAli — мы друг друга !@#$%&*.',
	'Чуть не умер в шараге',
	'Уронил станок на заводе',
	'Устроился работать курьером',
	'Тяжелый рабочий день на заводе.',
	'Уронил backend (cry)',
	'Саша почини настройки',
	'Продал ПОКО ХЗ (ушла эпоха)',
	'Вышел новый айфон — дел по горло.',
	'А спонсор этого выпуска V4GL..',
	'Что зя тяги бархатные уфф',
	'Ушел в армию, вернусь завтра',
	'Код пишу на последней парте в СКТ на последней паре',
	'Еще один день фарма V4',
	'Ура доллар по сто рублей',
	'Никитосик папиросик зашел в ApEx',
	'Сегоня ночная смена в APEX, убедительная просьба не пропускать.',
	'Импотечный ноутбук Вовiвки лагает',
	'Ярик снова пропадает в лесу',
	'Steve Хуйс и Тим Cock',
	'Саша наконец купил iPhone, не в кредит!!!',
	'Программист HTML',
	'Я стал тыквачкой!',
	'Шойгу, Герасимов, где обновы для бота??',
	'Вступил в ЧВК Ам Ням',
	'В семье грибов скандал: отец поспорил с дочерью',
	'В вашем Убежище случилось что-то важное!',
	'История Украины скоро исчезнет, успейте посмотреть.',
	'Если закрыть глаза становится темно (с) Джейсон Стэтхем',
	'Одна ошибка и ты ошибся (с) Джейсон Стэтхем',
	'Тихий окейн знаешь? Это я его успокоил (с) Джейсон Стэтхем',
	'Гладкая доска и два соска — мама..',
	'С днем камешка в кроссовке!',
	'Заблокировал всю систему кроме Paint',
	'Наконец пофиксил старый баг',
	'Говно с дымом или дым с говном',
	'Мне пожалуйста биг тейсти, картошку фри и колу, оплата картой.',
	'Купил сегодня клубничный молочный коктейль',
	'Забыл про дедлайн и выгнали с работы',
	'Сашочек устроил пробитие всему серверу',
	'Челлендж с батей в танках',
	'Айс у меня есть айс',
	'Собираемся на концерт Мэйби Бэйби',
	'Сегодня поел шаурмы от Дмитрия в Гараж Кафе',
	'Чушпанчики следите за трендами',
	'Данное сообщение (материал) создано и (или) распространено иностранным средством массовой информации, выполняющим функции иностранного агента, и (или) российским юридическим лицом, выполняющим функции иностранного агента',
	'Тут могла бы быть ваша реклама',
	'Это правда, я проверил...',
	'Дорогой игрок, поздравляем! Вы уже наиграли более 1000 часов в CS2. Поэтому мы отправляем вам приглашение в армию, где вы можете улучшить свои навыки игры. Благодарим вас за принятие приглашения!',
	'Я не иноагент!',
	'Вот бы сегодня пару купаток связать...',
	'Танки, самолёты, вертолёт и корабль, тут всё есть, что тебе надо',
	'Партия недовольна, отнять миска риса и кошка-женщина',
	'Сегодня апнул сильвера',
	'Купил Apple Vision Pro, теперь не могу без них смотреть на этот нищий мир...',
	'Здравствуй, небо в облаках...',
	'Как говорил мой дед: я твой дед.',
	'Сегодня на завтрак было pivo',
	'Кикита променял APEX на VALORANT',
	'Распили меня болгаркой',
	'Купил новое издание Escape From Tarkov',
	'Зашел в TARBANK и заскамился',
	'xXx_Chinchilla2014_xXx сел на бутылку (это правда)'
];

const generateText = currentText[Math.floor(Math.random() * currentText.length)];

//Статус ответа
const currentStatus = [
	' ЖИВЧИК',
	' ОТКИСУНЧИК',
	' ATTACK HELICOPTER'
];

const generateStatus = currentStatus[Math.floor(Math.random() * currentStatus.length)];

//Коды смайлов
const currentSmiles = [
	'&#127752;',
	'&#128293;', 
	'&#127829;',
	'&#128077;',
	'&#129310;',
	'&#129305;',
	'&#128575;',
	'&#128127;',
	'&#128520;',
	'&#128148;',
	'&#127789;',
	'&#128176;',
	'&#127790;',
	'&#127831;',
	'&#128580;',
	'&#129300;',
	'&#129316;',
	'&#128076;',
	'&#128079;',
	'&#128123;',
	'&#128163;',
	'&#128640;',
	'&#128642;',
	'&#127881;',
	'&#129419;',
	'&#128511;',
	'&#129504;',
	'&#129412;',
	'&#129414;',
	'&#128008;',
	'&#128584;',
	'&#127937;',
	'&#127873;',
	'&#127828;',
	'&#128056;',
	'&#127822;',
	'&#127823;',
	'&#127852;',
	'&#128526;',
	'&#128057;',
	'&#128045;',
	'&#128565;',
	'&#128168;',
	'&#129301;',
	'&#128543;',
	'&#127875;',
	'&#128564;',
	'&#128578;',
	'&#128570;',
	'&#128568;',
	'&#128545;',
	'&#129297;',
	'&#129298;',
	'&#128036;',
	'&#128529;',
	'&#128522;',
	'&#128521;',
	'&#11088;',
	'&#9786;',
	'&#9757;',
	'&#9996;',
	'&#9994;'
];

const generateSmiles = currentSmiles[Math.floor(Math.random() * currentSmiles.length)];

//Счетчик до определенной даты
const currentDate = new Date().getFullYear();
const yearDate = new Date(`31 October ${currentDate} 00:00:00`); //currentDate + 1
const todayDate = Date.now();
const difference = yearDate - todayDate;
const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

function generateValue(min = 10, max = 999) {
    return Math.ceil(Math.random() * (max - min) + min); //диапазон от 10 до 999;
}

async function run() {

	const api = vk.api.wall.post
	const currentNumber = generateValue()

	if(currentNumber === 666 || currentNumber === 777 || currentNumber === 69 || currentNumber === 228) {
		await api({
			owner_id: process.env.GROUP_ID, //основная группа
			from_group: 1, //публикация от имени сообщества
			message: generateSmiles + generateStatus + '\n\nЗапомните этот легендарный день! Все дедлайны выполнены и наконец выпал редчайший бочонок #' + currentNumber + ' (невозможная редкость Immortal Arcana)' + '\n\n«' + generateText + '»'
		});
	}

	else await api({
		owner_id: process.env.GROUP_ID, //основная группа, тест группа -202784674
		from_group: 1, //публикация от имени сообщества
		message: generateSmiles + generateStatus + '\n\nПродолжаем надеяться на лучшее (скоро дедлайн)\nДо Хэллоуина осталось ' + daysLeft + ' дн.! &#127875;\nСегодня выпал бочонок #' + currentNumber + '\n\n«' + generateText + '»'
	});

	console.log(api);
}

run().catch(console.log);

//Logi
console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);
vk.updates.start().catch(console.error);