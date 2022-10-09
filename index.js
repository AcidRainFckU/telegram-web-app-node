const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5618877713:AAHYzoO6ra_liUKr9xUX9kbSqmMQjYIez6k';
const webAppUrl = 'https://sensational-paletas-b0e431.netlify.app';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard: [[{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }]],
      },
    });
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Заполнить форму', web_app: { url: webAppUrl } }]],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, 'Спасибо за обратную связь');
      await bot.sendMessage(chatId, 'Страна: ' + data?.country);
      await bot.sendMessage(chatId, 'Улица: ' + data?.city);
      await bot.sendMessage(chatId, 'Лицо: ' + data?.subject);

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  }
});
app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: 'Поздравляю, вы совершили покупку на сумму ' + totalPrice,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Произошла ошибка',
      input_message_content: {
        message_text: 'Не удалось преобрести товар',
      },
    });
    return res.status(500).json({});
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));
