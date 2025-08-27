import { GarminConnect } from 'garmin-connect';

export default async function handler(req, res) {
  const { GARMIN_USERNAME, GARMIN_PASSWORD } = process.env;

  if (!GARMIN_USERNAME || !GARMIN_PASSWORD) {
    res.status(500).json({ error: 'Garmin credentials not configured.' });
    return;
  }

  try {
    const client = new GarminConnect();
    await client.login(GARMIN_USERNAME, GARMIN_PASSWORD);

    const steps = await client.getSteps();
    const activities = await client.getActivities(0, 3);

    res.status(200).json({ steps, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

