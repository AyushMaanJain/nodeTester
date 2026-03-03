import express from 'express';
import { query, TYPES } from './db.js';

const app = express();
app.use(express.json());

const RESPONSE_STANDARD = { message: "success", status: 202 };

app.post('/list', async (req, res) => {
  const { sql } = req.body;

  try {
    const result = await query(sql,[]);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});


export default app;
