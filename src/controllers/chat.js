import dotenv from "dotenv";
import Flight from "../models/flight.model.js";
import { CronJob } from "cron";
import Terminal from "../models/terminal.model.js";

dotenv.config();

const API_URL = "http://api.aviationstack.com/v1/timetable";
const API_KEY = process.env.AVIATION_KEY;
const IATA_CODE = "MAD";

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

async function getTicketMaster(geoPoint) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=ES&apikey=${process.env.TICKET_KEY}&locale=es-es&sort=relevance,desc&geoPoint=${geoPoint}&unit=km`;
  // ;
  const url2 = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${process.env.TICKET_KEY}&locale=es-es&geoPoint=${geoPoint}`;
  const url3 = `https://app.ticketmaster.com/discovery/v2/suggest.json?apikey=${process.env.TICKET_KEY}&sort=distance,asc&geoPoint=${geoPoint}&locale=es-es`;
  const response = await fetch(url);
  const json = await response.json();

  const today = new Date().toISOString().split("T")[0]; // formato 'YYYY-MM-DD'

  const events = json._embedded.events
    // ?.filter((event) => event.dates.start.localDate === today)
    .map((event) => {
      return {
        name: event.name,
        image: event.images[1]?.url,
        venue: event._embedded.venues[0]?.name,
        street: event._embedded.venues[0]?.address?.line1,
        city: event._embedded.venues[0]?.city?.name,
        country: event._embedded.venues[0]?.country?.name,
        date: event.dates.start,
        url: event.url,
        distance: event.distance,
        id: event.id,
      };
    });
  console.log(events);
  return events;
}

async function getArrivalsWithin12Hours() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const dateStr = now.toISOString().split("T")[0];
  const url = `${API_URL}?access_key=${API_KEY}&iataCode=${IATA_CODE}&type=arrival&date=${dateStr}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Formato de datos inesperado");
    }

    // const filtered = data.data.filter((flight) => {
    //   const arrivalTimeStr = flight.arrival?.scheduledTime;
    //   const arrivalTimeEst = flight.arrival?.estimatedTime;
    //   if (!arrivalTimeStr) return false;
    //   const arrivalDate = new Date(arrivalTimeStr);
    //   const arrivalDateEst = new Date(arrivalTimeEst);
    //   return arrivalDateEst >= oneHourAgo || arrivalDate >= oneHourAgo;
    // });

    // if (filtered.length === 0) {
    //   console.log("No hay vuelos entre hace 1 hora y las próximas 12 horas.");
    //   return [];
    // }

    const flights = data.data.map((f) => ({
      airline: f.airline.name,
      terminal: f.arrival.terminal,
      scheduledTime: f.arrival.scheduledTime,
      delay: f.arrival?.delay,
      flight: f.flight.iataNumber,
      status: f.status,
      departure: f.departure.iataCode,
      estimatedTime: f.arrival.estimatedTime,
    }));

    // Borrar solo vuelos dentro del rango actualizado
    await Flight.deleteMany();

    const isSaved = await Flight.insertMany(flights);

    console.log(`Guardados ${isSaved.length} vuelos.`);

    return isSaved;
  } catch (err) {
    console.error("Error al consultar vuelos:", err);
    throw err;
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

async function getChat(req, res) {
  const { geoPoint } = req.query;
  console.log(geoPoint);
  try {
    const flights = await Terminal.findOne()
      .populate("terminal1")
      .populate("terminal2")
      .populate("terminal4");

    const events = await getTicketMaster(geoPoint);
    console.log(events);

    return res.status(200).json({ flights, events });
  } catch (error) {
    return res.status(404).json({ error: "el chat no se ha encontrado" });
  }
}

async function createRangeFlight() {
  const flights = await Flight.find();
  const terminal1 = flights.filter((f) => f.terminal === "1");
  const terminal2 = flights.filter((f) => f.terminal === "2");
  const terminal4 = flights.filter(
    (f) => f.terminal === "4" || f.terminal === "4S"
  );
  const terminal = await Terminal.deleteMany();
  const newTerminal = new Terminal();
  newTerminal.terminal1 = terminal1;
  newTerminal.terminal2 = terminal2;
  newTerminal.terminal4 = terminal4;
  newTerminal.date = new Date().toLocaleDateString("es-Es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await newTerminal.save();
  return;
}

const jobMorning = new CronJob("30 6 * * *", async () => {
  await getArrivalsWithin12Hours();
  await createRangeFlight();
  console.log("🚀 Actualización matutina completada");
});

const jobAfternoon = new CronJob("30 13 * * *", async () => {
  await getArrivalsWithin12Hours();
  await createRangeFlight();
  console.log("🌞 Actualización de mediodía completada");
});

const jobEvening = new CronJob("30 20 * * *", async () => {
  await getArrivalsWithin12Hours();
  await createRangeFlight();
  console.log("🌙 Actualización nocturna completada");
});

// Iniciar los jobs
jobMorning.start();
jobAfternoon.start();
jobEvening.start();

const keepAliveJob = new CronJob(
  "*/14 * * * *", // cada 14 minutos
  async function () {
    try {
      const res = await fetch(process.env.URL + "/ping");
      console.log(`Ping enviado. Estado: ${res.status}`);
    } catch (err) {
      console.error("Error haciendo ping al backend:", err.message);
    }
  },
  null,
  true,
  null,
  null,
  true
);

export { getWeather, getTicketMaster, getChat };
