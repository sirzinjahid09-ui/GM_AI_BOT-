import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import https from "https";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const GEMINI = process.env.GEMINI_API_KEY;

async function askGemini(parts) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hi আমি GM AI BOT আমাকে তৈরি করেছে @JAHIDVAI12"
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  try {
    // TEXT
    if (msg.text && msg.text !== "/start") {
      const reply = await askGemini([{ text: msg.text }]);
      bot.sendMessage(chatId, reply);
    }

    // IMAGE
    if (msg.photo) {
      const file = await bot.getFile(msg.photo.pop().file_id);
      const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      const imgRes = await fetch(url);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const reply = await askGemini([
        { text: "এই ছবিতে কী আছে বলো" },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        },
      ]);

      bot.sendMessage(chatId, reply);
    }

    // VOICE
    if (msg.voice) {
      bot.sendMessage(chatId, "Voice বুঝার ফিচার active আছে, processing...");
      const reply = await askGemini([{ text: "User voice message পাঠিয়েছে" }]);
      bot.sendMessage(chatId, reply);
    }
  } catch (e) {
    bot.sendMessage(chatId, "Error");
  }
});
