import express from 'express';
import dotenv from 'dotenv';
import customerService from './services/customer/index.js';
import employeeService from './services/employee/index.js'
import requestsService from './services/requests/index.js';
import requestWorkService from './services/request-work/index.js';
import customService from './services/custom/index.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Main Gateway is running' });
});

// Mount Microservices
app.use('/customers', customerService);
app.use('/employees', employeeService);
app.use('/requests', requestsService);
app.use('/work', requestWorkService);
app.use('/custom', customService);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Main Gateway running on http://0.0.0.0:${PORT}`);
  console.log('Microservices mounted:');
  console.log(' - Customer Service: customer/');
  console.log(' - Employee Service: employees/');
  console.log(' - Requests Service: requests/');
  console.log(' - RequestWork Service: work/');
});
