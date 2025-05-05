import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { contextIA } from '../utils/contextIA.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
});
const __dirname = dirname(fileURLToPath(import.meta.url));


async function getWeather(req, res) {
    // const lat = req.query.lat;
    // const lon = req.query.lon;
    const lat = 40.416775;
    const lon = -3.70379;
    const API_key = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&lang=es&units=metric`;

    try {
        const response = await fetch(url);
        const json = await response.json();
        const data = {
            weather: json.weather[0].description,
            temperature: json.main.temp,
            zone: json.name,
            country: json.sys.country,
        }
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getMessage(req, res) {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contextIA,
        config: {
            maxOutputTokens: 1000,
            temperature: 2,
        },
    });

    const responseText = (response.text).replace(/```json/g, '').replace(/```/g, '');
    console.log(responseText);
    res.status(200).json(responseText);

}


export { getMessage, getWeather };      
