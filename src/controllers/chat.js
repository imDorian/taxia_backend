import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { contextIA } from '../utils/contextIA.js';
import { io } from '../server.js';


dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
});


async function getWeather(req, res) {
    const { lat, lon } = req.query;
    console.log(lat, lon, "lat y lon");
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
    const { geoPoint } = req.query;
    console.log(geoPoint, "geoPoint");
    const events = await getTicketMaster(geoPoint);
    console.log(events, "events");
    const context = contextIA.concat(JSON.stringify(events));

    const response = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: context,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        'name': {
                            type: Type.STRING,
                            description: 'Name of the event',
                            nullable: false,
                        },
                        'image': {
                            type: Type.STRING,
                            description: 'Image of the event',
                            nullable: false,
                        },
                        'venue': {
                            type: Type.STRING,
                            description: 'Venue of the event',
                            nullable: false,
                        },
                        'street': {
                            type: Type.STRING,
                            description: 'Street of the event',
                            nullable: false,
                        },
                        'city': {
                            type: Type.STRING,
                            description: 'City of the event',
                            nullable: false,
                        },
                        'country': {
                            type: Type.STRING,
                            description: 'Country of the event',
                            nullable: false,
                        },
                        'date': {
                            type: Type.STRING,
                            description: 'Date of the event',
                            nullable: false,
                        },
                        'url': {
                            type: Type.STRING,
                            description: 'URL of the event',
                            nullable: false,
                        },
                        'distance': {
                            type: Type.NUMBER,
                            description: 'Distance of the event',
                            nullable: false,
                        },
                        'id': {
                            type: Type.STRING,
                            description: 'unique id, never repeat',
                            nullable: false,

                        }
                    },
                    required: ['name', 'image', 'venue', 'street', 'city', 'country', 'date', 'url', 'distance', 'id'],
                },
            },
        },
    });

    let responseObj = "";
    for await (const chunk of response) {
        for (const letter of chunk.text) {
            if (letter === "{") {
                responseObj += letter;
            }
            if (responseObj.length > 0 && letter !== "}" && letter !== "{") {
                responseObj += letter;
            }
            if (letter === "}") {
                responseObj += letter;
                io.emit("newMessage", JSON.parse(responseObj));
                responseObj = "";
            }
        }

    }
    res.end();
}

async function getTicketMaster(geoPoint) {

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=ES&apikey=${process.env.TICKET_KEY}&locale=es-es&sort=relevance,desc&geoPoint=${geoPoint}&unit=km`
    // ;
    const url2 = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${process.env.TICKET_KEY}&locale=es-es&geoPoint=${geoPoint}`;
    const url3 = `https://app.ticketmaster.com/discovery/v2/suggest.json?apikey=${process.env.TICKET_KEY}&sort=distance,asc&geoPoint=${geoPoint}&locale=es-es`;
    const response = await fetch(url);
    const json = await response.json();
    const events = json._embedded.events?.map(event => {
        console.log(event, "event");
        return {
            name: event.name,
            image: event.images[1].url,
            venue: event._embedded.venues[0]?.name,
            street: event._embedded.venues[0]?.address?.line1,
            city: event._embedded.venues[0]?.city?.name,
            country: event._embedded.venues[0]?.country?.name,
            date: event.dates.start.dateTime,
            url: event.url,
            distance: event.distance,
        }
    });
    console.log(response, "events");

    return events;

}




export { getMessage, getWeather, getTicketMaster };      
