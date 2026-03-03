import express from 'express';
import { query, TYPES } from './db.js';

const app = express();
app.use(express.json());

const RESPONSE_STANDARD = { message: "success", status: 202 };

// Create Request
app.post('/add', async (req, res) => {
  const { requestStatus, Customerid, requesteddate, approveddate, startdate, completiondate, requestAlias, RequestDescription } = req.body;
  
  const sql = `
    INSERT INTO Requests (requestStatus, Customerid, requesteddate, approveddate, startdate, completiondate, requestAlias, RequestDescription)
    VALUES (@requestStatus, @Customerid, @requesteddate, @approveddate, @startdate, @completiondate, @requestAlias, @RequestDescription);
    SELECT SCOPE_IDENTITY() AS Requestid;
  `;

  const params = [
    { name: 'requestStatus', type: TYPES.VarChar, value: requestStatus },
    { name: 'Customerid', type: TYPES.Int, value: Customerid },
    { name: 'requesteddate', type: TYPES.DateTime, value: requesteddate ? new Date(requesteddate) : null },
    { name: 'approveddate', type: TYPES.DateTime, value: approveddate ? new Date(approveddate) : null },
    { name: 'startdate', type: TYPES.DateTime, value: startdate ? new Date(startdate) : null },
    { name: 'completiondate', type: TYPES.DateTime, value: completiondate ? new Date(completiondate) : null },
    { name: 'requestAlias', type: TYPES.VarChar, value: requestAlias },
    { name: 'RequestDescription', type: TYPES.VarChar, value: RequestDescription },
  ];

  try {
    const result = await query(sql, params);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Read Requests
app.get('/all', async (req, res) => {
  try {
    const result = await query('SELECT * FROM Requests');
    res.status(202).json({ ...RESPONSE_STANDARD, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Create Payment for Request
app.post('/:id/newpayments', async (req, res) => {
  const { id } = req.params;
  const { paymentdate, paymentAmount } = req.body;
  
  const sql = `
    INSERT INTO Requestpayments (Requestid, paymentdate, paymentAmount)
    VALUES (@Requestid, @paymentdate, @paymentAmount);
    SELECT SCOPE_IDENTITY() AS paymentid;
  `;

  const params = [
    { name: 'Requestid', type: TYPES.Int, value: parseInt(id) },
    { name: 'paymentdate', type: TYPES.DateTime, value: paymentdate ? new Date(paymentdate) : null },
    { name: 'paymentAmount', type: TYPES.Decimal, value: paymentAmount },
  ];

  try {
    const result = await query(sql, params);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Read Payments for Request
app.get('/:id/payments', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM Requestpayments WHERE Requestid = @id', [
      { name: 'id', type: TYPES.Int, value: parseInt(id) }
    ]);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

export default app;
