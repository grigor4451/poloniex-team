import TelegramBot from 'node-telegram-bot-api'
import config from 'config'
import { connection } from './db/connection.mjs'
import { Replenishment } from './db/replenishmentModel.mjs'
import canvas from 'canvas'
import { Canvas } from 'canvas-constructor/cairo'
process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 0;

const bot = new TelegramBot(config.get('TELEGRAM_TOKEN'), { polling: true })

const BASE_URL = config.get('BASE_URL')

connection
  .then(() => {
    console.log('Database connection successful')
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`)
    process.exit(1)
  })

bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;

  newMembers.forEach((member) => {
    bot.sendPhoto(chatId, `${BASE_URL}/invite.png`, {
      caption: `
Добро пожаловать @${member.username}! В самую дружную команду, которая станет для тебя второй семьей, а тс отцом.
   Перед началом хочу предупредить тебя о том что тебе нужно будет сделать:
1. Создать аккаунт(если это не является ворк аккаунтом);
2. Ознакомиться со всеми мануалами которые находятся в самом первом закрепе;
3. Если у тебя появляются трудности в ворке,не стесняйся их писать в общую беседу, или в лс куратору (он знает толк в своей сфере и поможет тебе разобраться каждом моменте).
   Желаю тебе больших профитов и постоянных залетов. Верю что в нашей команде ты обретешь новые навыки в сфере скама и добьешься желаемого результата, а так же сможешь стать частью нашей дружной  команды🎩
Заряд на предстоящий ворк🎉`
    });
  });
});

bot.on('message', async (msg) => {
  const { text, from, chat } = msg
  const regexPattern = new RegExp(chat.id + '$', 'i');
  const replenishment = await Replenishment.findOne({ state: { $regex: regexPattern } })
  if (chat.id !== from.id) {

    const userReplenishments = await Replenishment.aggregate([
      {
        $group: {
          _id: '$worker',
          replenishmentsCount: { $sum: 1 },
          summ: { $sum: '$amount' }
        }
      }
    ]).sort({ summ: -1 })

    const totalReplenishmentSum = await Replenishment.aggregate([
      {
        $group: {
          _id: null,
          totalSum: { $sum: '$amount' }
        }
      }
    ]);

    if (text?.startsWith('/top')) {

      const totalReplenishments = await Replenishment.countDocuments();


      return bot.sendMessage(chat.id, `
⭐️ ТОП ВОРКЕРОВ ПО СУММЕ ЗАЛЕТОВ:

🏆 ${userReplenishments[0]?._id.substring(1)} - | 😎 ︻デ═一 💥 🦣 |

${userReplenishments.slice(0, 10).map((user, index) => `${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `⚡️${(index + 1)} `}${user._id.substring(1)} - ${user.summ} RUB - ${user.replenishmentsCount} Профитов`).join('\n')}

📑 Общее количество залетов: ${totalReplenishments}
💳 Общая сумма залетов: ${totalReplenishmentSum[0].totalSum} RUB`)



    }

    if (text?.startsWith('/month')) {

      const monthAgoDate = new Date();
      monthAgoDate.setDate(monthAgoDate.getDate() - 30);
      const totalReplenishments = await Replenishment.countDocuments({
        createdAt: { $gte: monthAgoDate }  
      });


      const userReplenishmentsMonth = await Replenishment.aggregate([
        {
          $match: {
            createdAt: { $gte: monthAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: '$worker',
            replenishmentsCount: { $sum: 1 },
            summ: { $sum: '$amount' }
          }
        }
      ]).sort({ summ: -1 })

      const totalReplenishmentSumMonth = await Replenishment.aggregate([
        {
          $match: {
            createdAt: { $gte: monthAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: '$amount' }
          }
        }
      ]);


      return bot.sendMessage(chat.id, `
👁️ТОП ВОРКЕРОВ ПО СУММЕ ЗАЛЕТОВ ЗА МЕСЯЦ:

🏆 ${userReplenishmentsMonth[0]?._id.substring(1)} - | 😎 ︻デ═一 💥 🦣 |

${userReplenishmentsMonth.slice(0, 10).map((user, index) => `${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `⚡️${(index + 1)} `}${user._id.substring(1)} - ${user.summ} RUB - ${user.replenishmentsCount} Профитов`).join('\n')}

📑 Общее количество залетов: ${totalReplenishments}
💳 Общая сумма залетов: ${totalReplenishmentSumMonth[0].totalSum} RUB`)



    }
    if (text?.startsWith('/day')) {

      const dayAgoDate = new Date();
      dayAgoDate.setDate(dayAgoDate.getDate() - 1);
      const totalReplenishments = await Replenishment.countDocuments({
        createdAt: { $gte: dayAgoDate }
      });


      const userReplenishmentsDay = await Replenishment.aggregate([
        {
          $match: {
            createdAt: { $gte: dayAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: '$worker',
            replenishmentsCount: { $sum: 1 },
            summ: { $sum: '$amount' }
          }
        }
      ]).sort({ summ: -1 })

      const totalReplenishmentSumDay = await Replenishment.aggregate([
        {
          $match: {
            createdAt: { $gte: dayAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: '$amount' }
          }
        }
      ]);

      if (userReplenishmentsDay.length === 0) {
        return bot.sendMessage(chat.id, `Нет залетов за последний день`)
      }

      return bot.sendMessage(chat.id, `
👁️ТОП ВОРКЕРОВ ПО СУММЕ ЗАЛЕТОВ ЗА СУТКИ:

🏆 ${userReplenishmentsDay[0]?._id.substring(1)} - | 😎 ︻デ═一 💥 🦣 |

${userReplenishmentsDay.slice(0, 10).map((user, index) => `${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `⚡️${(index + 1)} `}${user._id.substring(1)} - ${user.summ} RUB - ${user.replenishmentsCount} Профитов`).join('\n')}

📑 Общее количество залетов: ${totalReplenishments}
💳 Общая сумма залетов: ${totalReplenishmentSumDay[0].totalSum} RUB`)



    }

    if (text?.startsWith('/freemoney')) {

      const startDate = new Date('2024-09-10'); // Start from 10st sep 2024
      const endDate = new Date('2024-10-10');
      const totalReplenishments = await Replenishment.countDocuments({
        createdAt: {
          $gte: startDate,  // Greater than or equal to 1st August 2024
          $lt: endDate      // Less than 1st September 2024
        }
      });


      const userReplenishmentsDay = await Replenishment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,  // Greater than or equal to 1st August 2024
              $lt: endDate      // Less than 1st September 2024
            }
          }
        },
        {
          $group: {
            _id: '$worker',
            replenishmentsCount: { $sum: 1 },
            summ: { $sum: '$amount' }
          }
        }
      ]).sort({ summ: -1 })

      const totalReplenishmentSumDay = await Replenishment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,  // Greater than or equal to 1st August 2024
              $lt: endDate      // Less than 1st September 2024
            }
          }
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: '$amount' }
          }
        }
      ]);

      if (userReplenishmentsDay.length === 0) {
        return bot.sendMessage(chat.id, `Нет залетов с начала конкурса`)
      }

      return bot.sendMessage(chat.id, `
⭐️ ТОП ВОРКЕРОВ ПО СУММЕ ЗАЛЕТОВ В КОНКУРСЕ:

🏆 ${userReplenishmentsDay[0]?._id.substring(1)} - | 😎 ︻デ═一 💥 🦣 |

${userReplenishmentsDay.map((user, index) => `${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `⚡️${(index + 1)} `}${user._id.substring(1)} - ${user.summ} RUB - ${user.replenishmentsCount} Профитов`).join('\n')}

📑 Общее количество залетов: ${totalReplenishments}
💳 Общая сумма залетов: ${totalReplenishmentSumDay[0].totalSum} RUB`)



    }

    if (text?.startsWith('/mytop')) {
      const loader = await bot.sendMessage(chat.id, "⏳");

      const monthAgoDate = new Date();
      monthAgoDate.setDate(monthAgoDate.getDate() - 30);

      const userMonthReplenishmentSum = await Replenishment.aggregate([
        {
          $match: {
            worker: `@${from.username}`,  // Match the user by username
            createdAt: { $gte: monthAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' } // Sum up the amount field
          }
        }
      ]);

      const weekAgoDate = new Date();
      weekAgoDate.setDate(weekAgoDate.getDate() - 7);

      const userWeekReplenishmentSum = await Replenishment.aggregate([
        {
          $match: {
            worker: `@${from.username}`,  // Match the user by username
            createdAt: { $gte: weekAgoDate }  // Match documents where createdAt is greater than or equal to 30 days ago
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' } // Sum up the amount field
          }
        }
      ]);

      const userReplenishmentSum = await Replenishment.aggregate([
        {
          $match: { worker: `@${from.username}` }
        },
        {
          $group: {
            _id: null,
            replenishmentsCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);


//       return bot.sendMessage(chat.id, `
// ⭐️ Топ воркера ${from.first_name}:
// 🏆 Место в топе ${(userReplenishments?.findIndex(user => user._id === `@${from.username}`) + 1) || 'нет'}
// 💸 Сумма залетов за все время: ${userReplenishmentSum[0]?.totalAmount || 0}₽

// 💵 Сумма залетов за последий месяц: ${userMonthReplenishmentSum[0]?.totalAmount || 0}₽
// 💵 Сумма залето за последнюю неделю: ${userWeekReplenishmentSum[0]?.totalAmount || 0}₽

      // 📈 Вклад в кассу: ${userReplenishmentSum[0] ? ((+userReplenishmentSum[0]?.totalAmount / +totalReplenishmentSum[0]?.totalSum) * 100).toFixed(3) : 0}%`)

      setTimeout(async () => {
        try {
          // 3. Generate the image in an async manner
          const image = await generateImageWithCanva(`${userReplenishmentSum[0]?.replenishmentsCount || 0}`, `${userReplenishmentSum[0]?.totalAmount || 0} RUB`, `${userMonthReplenishmentSum[0]?.totalAmount || 0} RUB`, `${userWeekReplenishmentSum[0]?.totalAmount || 0} RUB`, `${(userReplenishments?.findIndex(user => user._id === `@${from.username}`) + 1) || 'not in the top'}`, `@${from.username}`);

          bot.deleteMessage(chat.id, loader.message_id)

          return await bot.sendPhoto(chat.id, image, {
            caption: `
    📈 Вклад в кассу: ${userReplenishmentSum[0] ? ((+userReplenishmentSum[0]?.totalAmount / +totalReplenishmentSum[0]?.totalSum) * 100).toFixed(3) : 0}%`
});
        
        } catch (error) {
          console.error("Error while generating or sending image:", error);
          bot.sendMessage(chat.id, "Sorry, something went wrong while generating your image.");
        }
      }, 3000); // Delay to simulate async background process (can adjust as needed)

    }


    return
  }


  if (replenishment) {
    if (replenishment.state.startsWith('deposit')) {
      const info = text.split('\n')
      const percent = +replenishment.percent
      const amount = +info[0]?.trim()
      const service = info[1]?.trim()
      const worker = info[2]?.trim()
      const income = amount * percent / 100

      if (!amount || !service || !worker) {
        return bot.sendMessage(chat.id, `❌ Некорректный ввод, повторите попытку`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔙 Назад',
                  callback_data: `cancel`,
                },
              ],
            ],
          }
        })
      } else if (!worker.startsWith('@')) {
        return bot.sendMessage(chat.id, `❌ Некорректный ввод, имя воркера должно начинаться с @`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔙 Назад',
                  callback_data: `cancel`,
                },
              ],
            ],
          }
        })
      } else {
        replenishment.amount = amount
        replenishment.service = service
        replenishment.worker = worker
        replenishment.income = income
        replenishment.state = ''

        await replenishment.save()

        const message = `
  🎯Успешное пополнение🎯

  💸Доля воркера: ₽ ${income}(-${100 - percent}%)
  💵 Сумма пополнения: ${amount}₽
  💻Сервис: ${service}
  🥷Воркер: ${worker}
          `
        return bot.sendMessage(chat.id, `Подтвердите пополнение:\n${message}`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ Подтвердить',
                  callback_data: `accept-${replenishment?._id}`,
                },
                {
                  text: '❌ Отменить',
                  callback_data: `delete-${replenishment?._id}`,
                },
              ],
            ],
          }
        })
      }
    }
  }

  if (text.startsWith('/start')) {
    return bot.sendMessage(chat.id, `👋 Привет, ${from.first_name}! Удачного ворка`)
  }

  if (text === '/addzalet') {
    return replenishmentMenu(chat.id)
  }

  return bot.sendMessage(chat.id, `❌ Некорректный ввод, повторите попытку`)
})

bot.on('callback_query', async (query) => {
  const { data, message } = query
  const { chat } = message
  const regexPattern = new RegExp(chat.id + '$', 'i');
  const replenishment = await Replenishment.findOne({ state: { $regex: regexPattern } })


  if (data === 'cancel') {
    bot.deleteMessage(chat.id, query.message.message_id)

    await replenishment?.deleteOne()
    return replenishmentMenu(chat.id)
  }

  if (replenishment) return

  if (data.startsWith('accept')) {
    bot.deleteMessage(chat.id, query.message.message_id)

    const id = data.split('-')[1]
    const zalet = await Replenishment.findOne({ _id: id })
    const message = `
🎯Успешное пополнение🎯

💸Доля воркера: ₽ ${zalet.income}(-${100 - zalet.percent}%)
💵 Сумма пополнения: ${zalet.amount}₽
💻Сервис: ${zalet.service}
🥷Воркер: ${zalet.worker}
        `

    bot.sendMessage('-1002037682102', message)
    bot.sendMessage('-1002144952177', message)
    return replenishmentMenu(chat.id)

  }

  if (data.startsWith('delete')) {
    bot.deleteMessage(chat.id, query.message.message_id)

    const id = data.split('-')[1]
    const zalet = await Replenishment.findOne({ _id: id })
    await zalet?.deleteOne()
    return replenishmentMenu(chat.id)
  }


  if (data.startsWith('deposit')) {
    if (query && query.message) {
      bot.deleteMessage(chat.id, query.message.message_id)
    }

    const percent = data.split('-')[1]
    const zalet = await Replenishment.create({
      percent,
      amount: 0,
      worker: '@gohaPidor',
      service: 'Trade📊',
    })
    await zalet.save()

    await Replenishment.findOneAndUpdate({ _id: zalet._id }, { state: `deposit-${chat.id}` })

    return bot.sendMessage(chat.id, `
🔴 Напиши желаемые значения по инструкции:

1️⃣ Сумма пополнения
2️⃣ Сервис
3️⃣ Воркер

👇🏻 Пример введенных данных:

\`10000\`
\`Trade📊\`
\`@gohaPidor\``, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔙 Назад',
              callback_data: `cancel`,
            },
          ],
        ],
      }
    })
  }
})




function replenishmentMenu(chatId) {

  const buttons = [
    [
      {
        text: '💲 Пополнение: 80 %',
        callback_data: `deposit-80`,
      },
      {
        text: '💲 Прямой перевод: 75 %',
        callback_data: `deposit-75`,
      },
    ],
    [
      {
        text: '💲 Добив через ТП: 70 %',
        callback_data: `deposit-70`,
      },
      {
        text: '💲 Добив через ТП х2/3/4: 70 %',
        callback_data: `deposit-70`,
      },
    ],
    [
      {
        text: '💲 Добив через ТП х4/5: 70 %',
        callback_data: `deposit-70`,
      }
    ],
  ]

  return bot.sendMessage(chatId, `Выберете тип залета`,
    {
      reply_markup: {
        inline_keyboard: buttons
      },
    },
  )
}

async function generateImageWithCanva(count, tatal, totalMonth, totalWeek, place, username) {
  const img = await canvas.loadImage(`${BASE_URL}/mytop.png`)
  canvas.registerFont("./Winter Holiday.otf", {
    family: "Winter-Holiday"
  })

  let image = new Canvas(960, 540)
    .printImage(img, 0, 0, 960, 540)
    .setTextFont('35pt Winter-Holiday')
    .setColor('#08390b')
    .printText(count, 290, 100)
    .printText(tatal, 50, 200)
    .printText(totalMonth, 50, 300)
    .printText(totalWeek, 50, 395)
    .printText(place, 50, 100)
    .setTextFont('35pt Winter-Holiday')
    .setColor('#fff')
    .printText(username, 140, 480)
    .toBuffer();
  
  
  return image
}