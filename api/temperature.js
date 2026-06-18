import crypto from 'crypto';

const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET;
const DEVICE_ID = process.env.TUYA_DEVICE_ID;

const BASE_URL = 'https://openapi.tuyaeu.com';

async function getToken() {

  const t = Date.now().toString();

  const signStr = CLIENT_ID + t;

  const sign = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(signStr)
    .digest('hex')
    .toUpperCase();

  const response = await fetch(
    `${BASE_URL}/v1.0/token?grant_type=1`,
    {
      method: 'GET',
      headers: {
        client_id: CLIENT_ID,
        sign,
        t,
        sign_method: 'HMAC-SHA256'
      }
    }
  );

  const data = await response.json();

  return data;
}

export default async function handler(req, res) {

  try {

    const tokenResponse = await getToken();

    if (!tokenResponse.success) {
      res.status(500).json({
        stage: "token",
        response: tokenResponse
      });
      return;
    }

    const token = tokenResponse.result.access_token;

    const t = Date.now().toString();

    const path = `/v1.0/iot-03/devices/${DEVICE_ID}/status`;

    const signStr = CLIENT_ID + token + t + path;

    const sign = crypto
      .createHmac('sha256', CLIENT_SECRET)
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    const response = await fetch(
      `${BASE_URL}${path}`,
      {
        method: 'GET',
        headers: {
          client_id: CLIENT_ID,
          access_token: token,
          sign,
          t,
          sign_method: 'HMAC-SHA256'
        }
      }
    );

    const data = await response.json();

    if (!data.success) {
      res.status(500).json({
        stage: "device",
        response: data
      });
      return;
    }

    const values = {};

    data.result.forEach(item => {
      values[item.code] = item.value;
    });

    res.status(200).json({
      temperature: values.va_temperature / 10,
      humidity: values.va_humidity,
      battery: values.battery_state
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}
