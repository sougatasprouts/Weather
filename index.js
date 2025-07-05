const express = require('express');
const cors = require('cors');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const z = require('zod');

// === Weather and Population Data ===
const getWeather = async (city) => {
  const weatherMap = {
    Delhi: { condition: "sunny", temperature: "37°C" },
    Mumbai: { condition: "rainy", temperature: "29°C" },
    Kolkata: { condition: "humid", temperature: "34°C" },
    Bangalore: { condition: "cloudy", temperature: "27°C" },
    Chennai: { condition: "hot", temperature: "36°C" },
    Hyderabad: { condition: "dry", temperature: "33°C" },
    Pune: { condition: "pleasant", temperature: "26°C" },
    Jaipur: { condition: "hot and dry", temperature: "39°C" },
    Ahmedabad: { condition: "scorching", temperature: "41°C" },
  };

  const normalizedCity = city.trim().toLowerCase();
  const matchedCity = Object.keys(weatherMap).find(
    (key) => key.toLowerCase() === normalizedCity
  );

  if (matchedCity) {
    const w = weatherMap[matchedCity];
    return `The weather in ${matchedCity} is ${w.condition} with a temperature of ${w.temperature}.`;
  } else {
    return `Weather data for "${city}" is not available.`;
  }
};

const getPopulation = async (city) => {
  const populationMap = {
    Delhi: "32 million",
    Mumbai: "20 million",
    Kolkata: "14.8 million",
    Bangalore: "13 million",
    Chennai: "11.5 million",
    Hyderabad: "10.5 million",
    Pune: "7.4 million",
    Jaipur: "4 million",
    Ahmedabad: "8.6 million",
  };

  const normalizedCity = city.trim().toLowerCase();
  const matchedCity = Object.keys(populationMap).find(
    (key) => key.toLowerCase() === normalizedCity
  );

  if (matchedCity) {
    return `The population of ${matchedCity} is approximately ${populationMap[matchedCity]}.`;
  } else {
    return `Population data for "${city}" is not available.`;
  }
};

// === MCP Server Setup ===
const server = new McpServer({
  name: "WeatherMCP",
  version: "1.0.0",
});

// Register tools
server.tool(
  "weather",
  z.object({ city: z.string() }),
  async ({ city }) => ({
    content: [{ type: "text", text: await getWeather(city) }],
  })
);

server.tool(
  "population",
  z.object({ city: z.string() }),
  async ({ city }) => ({
    content: [{ type: "text", text: await getPopulation(city) }],
  })
);

// === Express Server with SSE Endpoint Only ===
const app = express();
app.use(cors());
app.use(express.json());

// SSE Endpoint
app.post("/sse", (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  server.connect(transport);
});

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`✅ WeatherMCP running at http://localhost:${PORT}`);
  console.log(`🔗 SSE endpoint: http://localhost:${PORT}/sse`);
});
