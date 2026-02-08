import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const GEMINI = process.env.GEMINI_API_KEY;

async function askGemini(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
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
  if (msg.text && msg.text !== "/start") {
    const reply = await askGemini(msg.text);
    bot.sendMessage(msg.chat.id, reply);
  }
});
