import express from 'express';
import { query, TYPES } from './db.js';

const app = express();
app.use(express.json());

const RESPONSE_STANDARD = { message: "success", status: 202 };

// Assign Employee Role to Request
app.post('/addroles', async (req, res) => {
  const { Requestid, Employeeid, expecteddaysneeded, laborCost, workstartdate, workenddate } = req.body;
  
  const sql = `
    INSERT INTO employeerole (Requestid, Employeeid, expecteddaysneeded, laborCost, workstartdate, workenddate)
    VALUES (@Requestid, @Employeeid, @expecteddaysneeded, @laborCost, @workstartdate, @workenddate);
    SELECT SCOPE_IDENTITY() AS employeeroleid;
  `;

  const params = [
    { name: 'Requestid', type: TYPES.Int, value: Requestid },
    { name: 'Employeeid', type: TYPES.Int, value: Employeeid },
    { name: 'expecteddaysneeded', type: TYPES.Int, value: expecteddaysneeded },
    { name: 'laborCost', type: TYPES.Decimal, value: laborCost },
    { name: 'workstartdate', type: TYPES.DateTime, value: workstartdate ? new Date(workstartdate) : null },
    { name: 'workenddate', type: TYPES.DateTime, value: workenddate ? new Date(workenddate) : null },
  ];

  try {
    const result = await query(sql, params);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Add Item Used to Request
app.post('/additems', async (req, res) => {
  const { Requestid, itemname, quantity, unit, itemcost, overallcost } = req.body;
  
  const sql = `
    INSERT INTO itemsused (Requestid, itemname, quantity, unit, itemcost, overallcost)
    VALUES (@Requestid, @itemname, @quantity, @unit, @itemcost, @overallcost);
    SELECT SCOPE_IDENTITY() AS itemsuseid;
  `;

  const params = [
    { name: 'Requestid', type: TYPES.Int, value: Requestid },
    { name: 'itemname', type: TYPES.VarChar, value: itemname },
    { name: 'quantity', type: TYPES.Decimal, value: quantity },
    { name: 'unit', type: TYPES.VarChar, value: unit },
    { name: 'itemcost', type: TYPES.Decimal, value: itemcost },
    { name: 'overallcost', type: TYPES.Decimal, value: overallcost },
  ];

  try {
    const result = await query(sql, params);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Read Work Details for Request
app.get('/:requestid', async (req, res) => {
  const { requestid } = req.params;
  try {
    const roles = await query('SELECT * FROM employeerole WHERE Requestid = @id', [
      { name: 'id', type: TYPES.Int, value: parseInt(requestid) }
    ]);
    const items = await query('SELECT * FROM itemsused WHERE Requestid = @id', [
      { name: 'id', type: TYPES.Int, value: parseInt(requestid) }
    ]);
    res.status(202).json({ ...RESPONSE_STANDARD, data: { roles, items } });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

export default app;
