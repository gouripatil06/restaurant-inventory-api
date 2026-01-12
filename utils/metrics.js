const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for Restaurant Inventory API
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const inventoryOperationsTotal = new client.Counter({
  name: 'inventory_operations_total',
  help: 'Total number of inventory operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

const authOperationsTotal = new client.Counter({
  name: 'auth_operations_total',
  help: 'Total number of authentication operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const status = res.statusCode.toString();
    
    httpRequestDuration.observe(
      { method: req.method, route, status },
      duration
    );
    httpRequestTotal.inc({ method: req.method, route, status });
  });
  
  next();
};

// Get metrics as Prometheus format
const getMetrics = async () => {
  return register.metrics();
};

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  inventoryOperationsTotal,
  authOperationsTotal,
  metricsMiddleware,
  getMetrics
};
