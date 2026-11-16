export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'mist';

export type WeatherMode = 'auto' | WeatherCondition;

export interface LiveWeatherReading {
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

export type GeolocationStatus =
  | 'idle'
  | 'locating'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface StrategicWeatherResolution {
  effectiveCondition: WeatherCondition;
  origin: 'manual' | 'strategic-event' | 'geolocation' | 'default';
  badgeLabel: string;
  detailLabel: string;
}
