/* by Sergey Ushakov 2025 | https://github.com/smdkx */

// Подключение модулей и библиотек
require('dotenv').config()
const { VK } = require('vk-io')
const fs = require('fs').promises;
const path = require('path');
const {
	RETRY_ATTEMPTS,
	RETRY_DELAY_MS,
	DATE_FORMAT,
	MIN_VALUE,
	MAX_VALUE,
	MILLISECONDS_PER_DAY,
} = require('./config');

// Проверка переменных окружения
const requiredEnv = ['TOKEN_GROUP', 'TOKEN_USER', 'GROUP_ID', 'MONGODB'];
for (const env of requiredEnv) {
	if (!process.env[env]) {
		console.error(`Ошибка: отсутствует переменная окружения ${env}`);
		process.exit(1);
	}
}

// Токен сообщества
const vk = new VK({
	token: process.env.TOKEN_GROUP
});

// Утилиты
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const generateValue = (min = MIN_VALUE, max = MAX_VALUE) => Math.floor(Math.random() * (max - min + 1)) + min;

// Функция для склонения слова "день"
function pluralizeDays(days) {
	const lastDigit = days % 10;
	const lastTwoDigits = days % 100;
	if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${days} дней`;
	if (lastDigit === 1) return `${days} день`;
	if (lastDigit >= 2 && lastDigit <= 4) return `${days} дня`;
	return `${days} дней`;
}

// Валидация и преобразование даты
function validateAndParseDate(dateStr, year) {
	const date = new Date(`${dateStr} ${year}`);
	if (isNaN(date.getTime())) {
		throw new Error(`Неверный формат даты: "${dateStr}". Ожидается: "${DATE_FORMAT}" (например, "9 May")`);
	}
	return date;
}

// Вычисление дней до даты
function daysUntil(targetDate) {
	const diffInDays = (targetDate - Date.now()) / (MILLISECONDS_PER_DAY);
	return Math.ceil(diffInDays); //для точного определения дня
}

// Подсчёт количества праздников
function countHolidays(data) {
	const count = data.holidays.length;
	console.log(`Количество праздников: ${count}`);
	return count;
}

// Чтение и парсинг JSON
async function readDataFile() {
	try {
		const dataPath = path.join(__dirname, 'data.json');
		const rawData = await fs.readFile(dataPath, 'utf8');
		return JSON.parse(rawData);
	} catch (error) {
		console.error(`Ошибка чтения данных: ${error.message}`, error.stack);
		throw new Error(`Не удалось прочитать или распарсить data.json: ${error.message}`);
	}
}

// Валидация структуры данных
function validateData(data) {
	try {
		const requiredFields = ['currentText', 'currentStatus', 'currentSmiles', 'specialNumbers', 'holidays'];
		for (const field of requiredFields) {
			if (!data[field] || !Array.isArray(data[field])) {
				throw new Error(`Отсутствует или неверный формат поля: "${field}"`);
			}
		}

		for (const holiday of data.holidays) {
			if (!holiday.name || !holiday.date || !holiday.emoji) {
				throw new Error(`Неверная структура праздника: ${JSON.stringify(holiday)}`);
			}
		}
	} catch (error) {
		console.error(`Ошибка валидации данных: ${error.message}`, error.stack);
		throw new Error(`Неверная структура данных: ${error.message}`);
	}
}

// Преобразование дат праздников
function transformHolidays(data) {
	try {
		data.holidays = data.holidays.map(holiday => ({
			...holiday,
			getDate: () => {
				const currentYear = new Date().getFullYear();
				let date = validateAndParseDate(holiday.date, currentYear);
				if (date < Date.now()) {
					date = validateAndParseDate(holiday.date, currentYear + 1);
				}
				return date;
			},
		}));
		return data;
	} catch (error) {
		console.error(`Ошибка преобразования праздников: ${error.message}`, error.stack);
		throw new Error(`Не удалось преобразовать даты праздников: ${error.message}`);
	}
}

// Загрузка и обработка данных
async function loadData() {
	const data = await readDataFile();
	validateData(data);
	transformHolidays(data);
	countHolidays(data);
	return data;
}

// Вычисляет количество дней до ближайшего праздника
function calculateHolidays(holidays) {
	if (!holidays?.length) throw new Error('Список праздников пуст');

	const holidayList = holidays.map(holiday => ({
		...holiday,
		days: daysUntil(holiday.getDate())
	}));

	return holidayList.reduce((closest, current) => {
		if (closest.days < 0 && current.days >= 0) return current;
		if (current.days < 0 && closest.days >= 0) return closest;
		return current.days < closest.days ? current : closest;
	});
}

// Формирование сообщения
function createMessage(data, number) {
	const today = new Date();
	const holiday = data.holidays.find(holiday => {
		const holidayDate = holiday.getDate();
		return holidayDate.getDate() === today.getDate() && holidayDate.getMonth() === today.getMonth();
	});
	const isSpecial = data.specialNumbers.includes(number);

	let message;

	if (holiday) {
		message = `${randomItem(data.currentSmiles)} ${randomItem(data.currentStatus)}\n\n` +
			`Лучшие времена настали (дождались дедлайна)\n` +
			`Сегодня празднуем «${holiday.name}»! ${holiday.emoji}\n\n` +
			`«${randomItem(data.currentText)}»`
	} else {
		const nextHoliday = calculateHolidays(data.holidays);

		message = isSpecial
			? `${randomItem(data.currentSmiles)}${randomItem(data.currentStatus)}\n\n` +
			`Запомните этот легендарный день! Все дедлайны выполнены и ` +
			`выпал редчайший бочонок #${number} (невозможная редкость Immortal Arcana)\n\n` +
			`«${randomItem(data.currentText)}»`

			: `${randomItem(data.currentSmiles)}${randomItem(data.currentStatus)}\n\n` +
			`Продолжаем надеяться на лучшее (скоро дедлайн)\n` +
			`До праздника «${nextHoliday.name}» ${nextHoliday.days === 1 ? 'остался' : 'осталось'} ${pluralizeDays(nextHoliday.days)}! ${nextHoliday.emoji}\n` +
			`Сегодня выпал бочонок #${number}\n\n` +
			`«${randomItem(data.currentText)}»`;
	}

	return { message };
}

// Отправка сообщения с повторными попытками
async function sendMessageWithRetry(vk, ownerId, messageContent, retries = RETRY_ATTEMPTS, delay = RETRY_DELAY_MS) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await vk.api.wall.post({
				owner_id: ownerId,
				from_group: 1,
				...messageContent,
			});
			console.log(`Запись успешно опубликована с ${attempt} попытки`);
			return;
		} catch (error) {
			let errorMessage = error.message;
			if (error.code === 403) errorMessage = `Нет прав для отправки в сообщество ${ownerId}`;
			if (error.code === 404) errorMessage = `Сообщество не найдено: ${ownerId}`;
			if (error.code === 429) {
				const retryAfter = error.retryAfter || delay;
				console.log(`Лимит запросов, повтор через ${retryAfter} мс`);
				await new Promise(resolve => setTimeout(resolve, retryAfter));
				continue;
			}
			console.error(`Попытка ${attempt} не удалась: ${errorMessage}`, error.stack);
			if (attempt === retries) {
				throw new Error(`Не удалось отправить сообщение после ${retries} попыток: ${errorMessage}`);
			}
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

// Основная функция запуска
async function run() {
	console.log('>_ Started! Script: ' + process.env.VERSION_BOT + ' | API: ' + process.env.VERSION_API);

	try {
		const data = await loadData();
		const number = generateValue();
		const messageContent = createMessage(data, number);

		await sendMessageWithRetry(vk, process.env.GROUP_ID, messageContent)
	} catch (error) {
		console.error(`Publication error: ${error.message}`);
	}
}

// Logs
run().catch((error) => {
	console.error(`Bot error: ${error.message}`);
	vk.updates.start().catch(console.error);
	process.exit(1);
});