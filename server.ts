import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

type ExpenseClassification = 'impulso' | 'suprimento' | 'comum';

interface ParsedExpenseAiResult {
  classification?: string;
  categoryLabel?: string;
  itemDescription?: string;
  amount?: number;
  tacticalReply?: string;
}

const SYSTEM_INSTRUCTION = `Você é o Oficial de Inteligência Tática do Comandante Gabriel (Fortaleza Família Conceição).
Seu papel é ler relatórios diários de gastos em linguagem natural (português do Brasil) e classificá-los rigorosamente em uma de três categorias estratégicas:

1. "impulso": Gastos imprevistos, impulsivos, supérfluos ou explicitamente "fora do plano" (ex.: açaí fora do plano, delivery por impulso, lanche caro não planejado, compras supérfluas, apostas, itens de capricho, parcelamentos desnecessários).
2. "suprimento": Gastos previstos, essenciais e estruturais do lar/família (ex.: compra do mês no supermercado, feira planejada, conta de luz, água, gás, internet, escola, farmácia essencial, financiamento da casa, combustível de trabalho, manutenção preventiva).
3. "comum": Outros lançamentos operacionais cotidianos que não são claramente um impulso destrutivo nem um grande suprimento mensal planejado (ex.: taxa bancária pequena, estacionamento eventual, ajuste operacional rotineiro, café rápido no serviço).

Regras de resposta:
- Extraia o valor numérico em reais (amount). Se nenhum valor for mencionado, retorne 0.
- Crie categoryLabel curto (ex.: "Impulso / Fora do Plano", "Suprimento Previsto", "Lançamento Operacional").
- Crie itemDescription resumido (máx. 80 caracteres).
- Escreva tacticalReply em 2 frases diretas, em tom de estrategista militar medieval disciplinado e leal à família:
  * Se "impulso": resposta crítica e firme alertando que houve brecha na muralha ("Inimigo no Front"), cobrando vigilância e retorno à temperança.
  * Se "suprimento": elogie a ordem, a previsão e o reforço nos suprimentos da guarnição e do lar.
  * Se "comum": confirme o registro na conta operacional e lembre de manter o foco nas Arcas.`;

type WeatherCondition = 'clear' | 'rain' | 'snow' | 'mist';

interface WeatherCacheEntry {
  expiresAt: number;
  payload: WeatherApiResponse;
}

interface WeatherApiResponse {
  condition: WeatherCondition;
  rawConditionType: string;
  description: string;
  temperatureC: number | null;
  feelsLikeC: number | null;
  humidityPct: number | null;
  windKmh: number | null;
  isDaytime: boolean;
  locationLabel: string;
  source: 'google-weather' | 'open-meteo';
  fetchedAtIso: string;
}

const weatherCache = new Map<string, WeatherCacheEntry>();
const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000;

function mapGoogleWeatherType(typeRaw: string, cloudCover?: number): WeatherCondition {
  const t = typeRaw.toUpperCase();
  if (
    t.includes('SNOW') ||
    t.includes('BLIZZARD') ||
    t.includes('SLEET') ||
    t.includes('ICE') ||
    t.includes('FREEZING')
  ) {
    return 'snow';
  }
  if (
    t.includes('RAIN') ||
    t.includes('SHOWER') ||
    t.includes('DRIZZLE') ||
    t.includes('THUNDER') ||
    t.includes('STORM') ||
    t.includes('HAIL')
  ) {
    return 'rain';
  }
  if (
    t.includes('FOG') ||
    t.includes('MIST') ||
    t.includes('HAZE') ||
    t.includes('SMOKE') ||
    t.includes('OVERCAST') ||
    (t.includes('CLOUDY') && (cloudCover ?? 0) >= 85)
  ) {
    return 'mist';
  }
  return 'clear';
}

function mapWmoWeatherCode(code: number): {
  condition: WeatherCondition;
  rawType: string;
  description: string;
} {
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: 'snow', rawType: `WMO_${code}_SNOW`, description: 'Neve' };
  }
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)
  ) {
    return {
      condition: 'rain',
      rawType: code >= 95 ? `WMO_${code}_THUNDERSTORM` : `WMO_${code}_RAIN`,
      description: code >= 95 ? 'Tempestade com chuva' : 'Chuva',
    };
  }
  if ([3, 45, 48].includes(code)) {
    return {
      condition: 'mist',
      rawType: code === 3 ? 'WMO_3_OVERCAST' : `WMO_${code}_FOG`,
      description: code === 3 ? 'Céu encoberto / Neblina' : 'Neblina',
    };
  }
  if (code === 2) {
    return { condition: 'clear', rawType: 'WMO_2_PARTLY_CLOUDY', description: 'Parcialmente nublado' };
  }
  if (code === 1) {
    return { condition: 'clear', rawType: 'WMO_1_MAINLY_CLEAR', description: 'Predominantemente limpo' };
  }
  return { condition: 'clear', rawType: `WMO_${code}_CLEAR`, description: 'Céu limpo' };
}

function translateGoogleConditionPt(typeRaw: string, fallbackText?: string): string {
  const t = typeRaw.toUpperCase();
  if (t.includes('THUNDER')) return 'Tempestade';
  if (t.includes('HEAVY_RAIN')) return 'Chuva forte';
  if (t.includes('LIGHT_RAIN') || t.includes('DRIZZLE')) return 'Chuva leve';
  if (t.includes('RAIN') || t.includes('SHOWER')) return 'Chuva';
  if (t.includes('SNOW') || t.includes('BLIZZARD')) return 'Neve';
  if (t.includes('FOG') || t.includes('MIST') || t.includes('HAZE')) return 'Neblina';
  if (t.includes('OVERCAST') || t.includes('MOSTLY_CLOUDY')) return 'Nublado';
  if (t.includes('PARTLY_CLOUDY')) return 'Parcialmente nublado';
  if (t.includes('CLEAR') || t.includes('SUNNY')) return 'Céu limpo';
  return fallbackText || 'Tempo estável';
}

async function resolveCityLabelGoogle(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string | null> {
  try {
    const geoUrl = new URL('https://geocode.googleapis.com/v4/geocode/location');
    geoUrl.searchParams.append('location.latitude', String(lat));
    geoUrl.searchParams.append('location.longitude', String(lng));
    geoUrl.searchParams.append('languageCode', 'pt-BR');

    const geoRes = await fetch(geoUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'results.addressComponents,results.formattedAddress',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
    });
    if (!geoRes.ok) return null;
    const geoData = (await geoRes.json()) as {
      results?: Array<{
        formattedAddress?: string;
        addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>;
      }>;
    };
    const first = geoData.results?.[0];
    if (!first) return null;
    const comps = first.addressComponents || [];
    const cityComp =
      comps.find((c) => c.types?.includes('locality')) ||
      comps.find((c) => c.types?.includes('administrative_area_level_2'));
    const stateComp = comps.find((c) => c.types?.includes('administrative_area_level_1'));
    if (cityComp?.longText && stateComp?.shortText) {
      return `${cityComp.longText}, ${stateComp.shortText}`;
    }
    if (cityComp?.longText) return cityComp.longText;
    return first.formattedAddress?.split(',').slice(0, 2).join(', ') || null;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/weather', async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      res.status(400).json({ error: 'Coordenadas inválidas para consulta climática.' });
      return;
    }

    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.payload);
      return;
    }

    const mapsApiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.MAPS_API_KEY ||
      '';

    if (mapsApiKey) {
      try {
        const weatherUrl = new URL('https://weather.googleapis.com/v1/currentConditions:lookup');
        weatherUrl.searchParams.append('key', mapsApiKey);
        weatherUrl.searchParams.append('location.latitude', String(lat));
        weatherUrl.searchParams.append('location.longitude', String(lon));
        weatherUrl.searchParams.append('unitsSystem', 'METRIC');

        const [weatherRes, cityLabel] = await Promise.all([
          fetch(weatherUrl.toString(), {
            method: 'GET',
            headers: {
              'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
            },
          }),
          resolveCityLabelGoogle(lat, lon, mapsApiKey),
        ]);

        const rawPayload = (await weatherRes.json().catch(() => ({}))) as {
          error?: { status?: string; message?: string; code?: number };
          isDaytime?: boolean;
          weatherCondition?: {
            type?: string;
            description?: { text?: string };
          };
          temperature?: { degrees?: number };
          feelsLikeTemperature?: { degrees?: number };
          relativeHumidity?: number;
          wind?: { speed?: { value?: number } };
          cloudCover?: number;
        };

        if (
          weatherRes.status === 429 ||
          rawPayload?.error?.status === 'RESOURCE_EXHAUSTED'
        ) {
          res.status(429).json({
            error: {
              status: 'RESOURCE_EXHAUSTED',
              message: 'Google Maps Platform Weather API quota reached.',
            },
          });
          return;
        }

        if (weatherRes.ok && rawPayload.weatherCondition) {
          const rawType = rawPayload.weatherCondition.type || 'CLEAR';
          const condition = mapGoogleWeatherType(rawType, rawPayload.cloudCover);
          const payload: WeatherApiResponse = {
            condition,
            rawConditionType: rawType,
            description: translateGoogleConditionPt(
              rawType,
              rawPayload.weatherCondition.description?.text
            ),
            temperatureC:
              typeof rawPayload.temperature?.degrees === 'number'
                ? Math.round(rawPayload.temperature.degrees)
                : null,
            feelsLikeC:
              typeof rawPayload.feelsLikeTemperature?.degrees === 'number'
                ? Math.round(rawPayload.feelsLikeTemperature.degrees)
                : null,
            humidityPct:
              typeof rawPayload.relativeHumidity === 'number'
                ? Math.round(rawPayload.relativeHumidity)
                : null,
            windKmh:
              typeof rawPayload.wind?.speed?.value === 'number'
                ? Math.round(rawPayload.wind.speed.value)
                : null,
            isDaytime: rawPayload.isDaytime ?? true,
            locationLabel:
              cityLabel || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
            source: 'google-weather',
            fetchedAtIso: new Date().toISOString(),
          };
          weatherCache.set(cacheKey, {
            expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
            payload,
          });
          res.json(payload);
          return;
        }
      } catch (err: unknown) {
        console.warn(
          'Google Weather API fallback triggered:',
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    // Fallback meteorológico real (sem chave Maps ativa ou em indisponibilidade pontual)
    try {
      const omUrl = new URL('https://api.open-meteo.com/v1/forecast');
      omUrl.searchParams.append('latitude', String(lat));
      omUrl.searchParams.append('longitude', String(lon));
      omUrl.searchParams.append(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m'
      );
      omUrl.searchParams.append('timezone', 'auto');

      const omRes = await fetch(omUrl.toString());
      if (!omRes.ok) {
        res.status(502).json({ error: 'Falha ao consultar dados meteorológicos locais.' });
        return;
      }
      const omData = (await omRes.json()) as {
        timezone?: string;
        current?: {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          apparent_temperature?: number;
          is_day?: number;
          weather_code?: number;
          wind_speed_10m?: number;
        };
      };

      const cur = omData.current;
      if (!cur) {
        res.status(502).json({ error: 'Resposta meteorológica incompleta.' });
        return;
      }

      const mapped = mapWmoWeatherCode(Number(cur.weather_code ?? 0));
      const tzCity = omData.timezone?.split('/').pop()?.replace(/_/g, ' ');
      const payload: WeatherApiResponse = {
        condition: mapped.condition,
        rawConditionType: mapped.rawType,
        description: mapped.description,
        temperatureC:
          typeof cur.temperature_2m === 'number' ? Math.round(cur.temperature_2m) : null,
        feelsLikeC:
          typeof cur.apparent_temperature === 'number'
            ? Math.round(cur.apparent_temperature)
            : null,
        humidityPct:
          typeof cur.relative_humidity_2m === 'number'
            ? Math.round(cur.relative_humidity_2m)
            : null,
        windKmh:
          typeof cur.wind_speed_10m === 'number' ? Math.round(cur.wind_speed_10m) : null,
        isDaytime: cur.is_day === 1,
        locationLabel: tzCity || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        source: 'open-meteo',
        fetchedAtIso: new Date().toISOString(),
      };
      weatherCache.set(cacheKey, {
        expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
        payload,
      });
      res.json(payload);
    } catch {
      res.status(500).json({
        error: 'Não foi possível consultar o clima da sua localização no momento.',
      });
    }
  });

  app.post('/api/tactical-expense', async (req, res) => {
    const rawMessage =
      typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!rawMessage) {
      res.status(400).json({ error: 'Descreva o gasto no relatório diário antes de enviar.' });
      return;
    }
    if (rawMessage.length > 600) {
      res.status(400).json({ error: 'Relatório muito longo (máximo de 600 caracteres).' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error:
          'Chave da API Gemini não configurada no servidor. Configure GEMINI_API_KEY em Settings > Secrets.',
      });
      return;
    }

    const ctx = (req.body?.context || {}) as {
      streak?: number;
      xp?: number;
      box1?: number;
    };

    const userPrompt = [
      `Contexto atual do Comandante: XP total = ${Number(ctx.xp || 0)}, Dias Invictos (streak) = ${Number(ctx.streak || 0)}, Arca I acumulada = R$ ${Number(ctx.box1 || 0).toFixed(2)}.`,
      `Relatório de gasto enviado pelo Comandante: "${rawMessage}"`,
    ].join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: {
                type: Type.STRING,
                enum: ['impulso', 'suprimento', 'comum'],
                description: 'Classificação estratégica do gasto.',
              },
              categoryLabel: {
                type: Type.STRING,
                description: 'Rótulo curto da classificação.',
              },
              itemDescription: {
                type: Type.STRING,
                description: 'Resumo curto do gasto relatado.',
              },
              amount: {
                type: Type.NUMBER,
                description: 'Valor em reais extraído do texto, ou 0 se não informado.',
              },
              tacticalReply: {
                type: Type.STRING,
                description: 'Resposta do estrategista militar medieval em português.',
              },
            },
            required: [
              'classification',
              'categoryLabel',
              'itemDescription',
              'amount',
              'tacticalReply',
            ],
          },
        },
      });

      const rawJson = (response.text ?? '{}').trim();
      let parsed: ParsedExpenseAiResult = {};
      try {
        parsed = JSON.parse(rawJson) as ParsedExpenseAiResult;
      } catch {
        parsed = {};
      }

      const rawClass = String(parsed.classification || 'comum').toLowerCase();
      const classification: ExpenseClassification =
        rawClass === 'impulso'
          ? 'impulso'
          : rawClass === 'suprimento'
          ? 'suprimento'
          : 'comum';

      const amountNum = Number(parsed.amount);
      const amount =
        Number.isFinite(amountNum) && amountNum > 0
          ? Math.min(1_000_000_000, Math.round(amountNum * 100) / 100)
          : 0;

      const xpDelta =
        classification === 'impulso'
          ? -150
          : classification === 'suprimento'
          ? 80
          : 25;

      const streakReset = classification === 'impulso';

      const fallbackReply =
        classification === 'impulso'
          ? 'Inimigo no Front! Este gasto fora do plano abriu uma brecha na muralha: -150 XP e sua sequência de dias invictos foi zerada. Retome a guarda imediatamente.'
          : classification === 'suprimento'
          ? 'Suprimento confirmado no paiol da Fortaleza! Sua disciplina fortalece a provisão do lar e rende +80 XP ao estandarte da tropa.'
          : 'Lançamento registrado na conta operacional da campanha (+25 XP). Mantenha o controle de cada moeda rumo às metas das Arcas.';

      res.json({
        classification,
        categoryLabel: String(
          parsed.categoryLabel ||
            (classification === 'impulso'
              ? 'Impulso / Fora do Plano'
              : classification === 'suprimento'
              ? 'Suprimento Previsto'
              : 'Lançamento Operacional')
        ).slice(0, 80),
        itemDescription: String(parsed.itemDescription || rawMessage).slice(0, 160),
        amount,
        xpDelta,
        streakReset,
        tacticalReply: String(parsed.tacticalReply || fallbackReply).slice(0, 1000),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Gemini tactical-expense error:', msg);
      if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
        res.status(403).json({
          error: 'Chave da API Gemini inválida ou sem permissão. Verifique em Settings > Secrets.',
        });
        return;
      }
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        res.status(429).json({
          error: 'Limite de requisições da API Gemini atingido no momento. Tente novamente em instantes.',
        });
        return;
      }
      res.status(500).json({
        error: 'Não foi possível classificar o relatório no Estado-Maior agora. Tente novamente.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fortaleza server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
