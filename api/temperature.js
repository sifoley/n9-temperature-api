import { TuyaContext } from '@tuya/tuya-connector-nodejs';

const tuya = new TuyaContext({
  baseUrl: 'https://openapi.tuyaeu.com',
  accessKey: process.env.TUYA_CLIENT_ID,
  secretKey: process.env.TUYA_CLIENT_SECRET
});

export default async function handler(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${process.env.TUYA_DEVICE_ID}/status`,
      method: 'GET'
    });

    const values = {};

    response.result.forEach(item => {
      values[item.code] = item.value;
    });

    res.status(200).json({
      temperature: values.va_temperature / 10,
      humidity: values.va_humidity,
      battery: values.battery_state,
      live: true
    });

  } catch (error) {

    console.error("Using fallback values:", error);

    res.status(200).json({
      temperature: -19.6,
      humidity: 72,
      battery: "offline",
      live: false
    });

  }

}
