import express from 'express';
import { query, TYPES } from './db.js';

const app = express();
app.use(express.json());

const RESPONSE_STANDARD = { message: "success", status: 202 };

// Create Customer
app.post('/add', async (req, res) => {
  const { employeename,speciality,hiredate,terminatedate, Contactno, emailid, addressLine1, addressLine2, addressLine3 } = req.body;
  
  const sql = `
    INSERT INTO employees (employeename,speciality,hiredate,terminatedate, Contactno, emailid, addressLine1, addressLine2, addressLine3)
    VALUES (@employeename,@speciality,@hiredate,@terminatedate, @Contactno, @emailid, @addressLine1, @addressLine2, @addressLine3);
    SELECT SCOPE_IDENTITY() AS employeeid;
  `;

  const params = [
    { name: 'employeename', type: TYPES.VarChar, value: employeename },
    { name: 'speciality', type: TYPES.VarChar, value: speciality },
    { name: 'hiredate', type: TYPES.DateTime, value: hiredate },
    { name: 'terminatedate', type: TYPES.DateTime, value: terminatedate },
    { name: 'Contactno', type: TYPES.VarChar, value: Contactno },
    { name: 'emailid', type: TYPES.VarChar, value: emailid },
    { name: 'addressLine1', type: TYPES.VarChar, value: addressLine1 },
    { name: 'addressLine2', type: TYPES.VarChar, value: addressLine2 },
    { name: 'addressLine3', type: TYPES.VarChar, value: addressLine3 },
  ];

  try {
    const result = await query(sql, params);
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Read Customers
app.get('/all', async (req, res) => {
  try {
    const result = await query('SELECT * FROM employees');
    res.status(202).json({ ...RESPONSE_STANDARD, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Read Customer by ID
app.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM employees WHERE employeeid = @id', [
      { name: 'id', type: TYPES.Int, value: parseInt(id) }
    ]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Customer not found", status: 404 });
    }
    res.status(202).json({ ...RESPONSE_STANDARD, data: result[0] });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Update Customer
app.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { speciality,hiredate,terminatedate,Contactno, addressLine1, addressLine2, addressLine3 } = req.body;
  
  // emailid is immutable, so we don't include it in the update
  const sql = `
    UPDATE employees 
    SET speciality=@speciality,
        hiredate=@hiredate
        terminatedate=@terminatedate
        Contactno = @Contactno, 
        addressLine1 = @addressLine1, 
        addressLine2 = @addressLine2, 
        addressLine3 = @addressLine3
    WHERE employeeid = @id
  `;

  const params = [
    { name: 'id', type: TYPES.Int, value: parseInt(id) },
    { name: 'speciality', type: TYPES.VarChar, value: speciality },
    { name: 'hiredate', type: TYPES.DateTime, value: hiredate },
    { name: 'terminatedate', type: TYPES.DateTime, value: terminatedate },
    { name: 'Contactno', type: TYPES.VarChar, value: Contactno },
    { name: 'addressLine1', type: TYPES.VarChar, value: addressLine1 },
    { name: 'addressLine2', type: TYPES.VarChar, value: addressLine2 },
    { name: 'addressLine3', type: TYPES.VarChar, value: addressLine3 },
  ];

  try {
    await query(sql, params);
    res.status(202).json(RESPONSE_STANDARD);
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

// Delete Customer
app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM employees WHERE employeeid = @id', [
      { name: 'id', type: TYPES.Int, value: parseInt(id) }
    ]);
    res.status(202).json(RESPONSE_STANDARD);
  } catch (err) {
    res.status(500).json({ message: err.message, status: 500 });
  }
});

export default app;
