import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { contextIA } from "../utils/contextIA.js";
import { io } from "../server.js";
import Flight from "../models/flight.model.js";
import { CronJob } from "cron";
import Chat from "../models/chat.model.js";

dotenv.config();

const API_URL = "http://api.aviationstack.com/v1/timetable";
const API_KEY = process.env.AVIATION_KEY;
const IATA_CODE = "MAD";

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
    };
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMessage(req, res) {
  try {
    const { geoPoint } = req.query;
    const events = await getTicketMaster(geoPoint);
    const arrivals = await getFlights();
    console.log(arrivals);
    const context = JSON.stringify(events)
      .concat(JSON.stringify(arrivals))
      .concat(contextIA);
    console.log(context, "context");

    const response = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: context,
      config: {
        // tokenLimit: 6000,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timeRange: {
                type: Type.STRING,
                description: "Hora de inicio y fin del evento",
                nullable: false,
              },
              image: {
                type: Type.STRING,
                description: "URL de la imagen del evento",
                nullable: false,
              },
              locationName: {
                type: Type.STRING,
                description: "Nombre del lugar del evento",
                nullable: false,
              },
              reason: {
                type: Type.STRING,
                description: "Motivo por el que se ha seleccionado el evento",
                nullable: false,
              },
              arrivalTime: {
                type: Type.STRING,
                description: "Hora de llegada al evento",
                nullable: false,
              },
              departureTime: {
                type: Type.STRING,
                description: "Hora de salida del evento",
                nullable: false,
              },
              demandLevel: {
                type: Type.STRING,
                description: "Nivel de afluencia en el evento",
                nullable: false,
              },
              googleMaps: {
                type: Type.STRING,
                description: "URL de Google Maps del evento",
                nullable: false,
              },
              waze: {
                type: Type.STRING,
                description: "URL de Waze del evento",
                nullable: false,
              },
              notes: {
                type: Type.STRING,
                description: "Notas adicionales sobre el evento",
                nullable: false,
              },
              id: {
                type: Type.STRING,
                description: "inventate un id para cada evento",
                nullable: false,
              },
            },
            required: [
              "timeRange",
              "locationName",
              "reason",
              "arrivalTime",
              "departureTime",
              "demandLevel",
              "googleMaps",
              "waze",
              "notes",
              "id",
            ],
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
  } catch (error) {
    console.log(error.message, "error");
  }
}

async function getTicketMaster(geoPoint) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=ES&apikey=${process.env.TICKET_KEY}&locale=es-es&sort=relevance,desc&geoPoint=${geoPoint}&unit=km`;
  // ;
  const url2 = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${process.env.TICKET_KEY}&locale=es-es&geoPoint=${geoPoint}`;
  const url3 = `https://app.ticketmaster.com/discovery/v2/suggest.json?apikey=${process.env.TICKET_KEY}&sort=distance,asc&geoPoint=${geoPoint}&locale=es-es`;
  const response = await fetch(url);
  const json = await response.json();
  const events = json._embedded.events?.map((event) => {
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
      id: event.id,
    };
  });

  return events;
}

async function getArrivalsWithin12Hours() {
  const now = new Date();
  const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const dateStr = now.toISOString().split("T")[0];
  const url = `${API_URL}?access_key=${API_KEY}&iataCode=${IATA_CODE}&type=arrival&date=${dateStr}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const filtered = data.data.filter((flight) => {
      const arrivalTimeStr = flight.arrival?.scheduledTime;
      if (!arrivalTimeStr) return false;
      const arrivalDate = new Date(arrivalTimeStr);
      return arrivalDate >= now && arrivalDate <= in12h;
    });

    for (const f of filtered) {
      const airline = f.airline.name;
      const terminal = f.arrival.terminal;
      const scheduledTime = f.arrival.scheduledTime;
      const delay = f.arrival?.delay;
      const flight = f.flight.iataNumber;
      const status = f.status;
      const departureCode = f.departure.iataCode;

      await Flight.findOneAndUpdate(
        { flight },
        {
          airline,
          status,
          terminal,
          scheduledTime,
          delay,
          departureCode,
          flight,
        },
        { upsert: true, new: true }
      );
    }

    console.log(`Guardados ${filtered.length} vuelos.`);
  } catch (err) {
    console.error("Error al consultar vuelos:", err);
  }
}

async function getFlights() {
  try {
    const flights = await Flight.find();
    return flights;
  } catch (error) {
    console.error(error);
  }
}

async function getChat(id) {
  const chat = await Chat.findOne({ user: id });
  console.log(chat);
}

// timeRange: { type: String },
//         locationName: { type: String },
//         reason: { type: String },
//         arrivalTime: { type: String },
//         departureTime: { type: String },
//         demandLevel: { type: String },
//         googleMaps: { type: String },
//         waze: { type: String },
//         notes: { type: String },
const userID = "68268790d89d0e65137c1c6f";
async function createChat() {
  const newMess = {
    locationName: "MICASA",
    reason: "porque si",
    arrivalTime: "10:00",
    departureTime: "12:00",
    demandLevel: "Alto",
    googleMaps: "",
    waze: "",
    notes: "BRRR",
  };
  const newChat = new Chat();
  newChat.chat.push(newMess);
  newChat.user = userID;
  await newChat.save();
  console.log(newChat);
}

// createChat();
getChat(userID);
// deleteChat(ide);

const job = new CronJob(
  "0 */12 * * *",
  async function () {
    await getArrivalsWithin12Hours();
  },
  null,
  true,
  null,
  null,
  false
);

export { getMessage, getWeather, getTicketMaster };
