var express = require("express");
var lusca = require("lusca");
var logger = require("./logger");
var config = require("./config");
const path = require("path");

var app = express();

const fs = require('fs');
const swaggerDefinition = fs.readFileSync('./.build/api.json',
       { encoding: 'utf8', flag: 'r' });

app.locals["CONFIG"] = config;

// NOTE: this assumes you're running behind an nginx instance or other proxy
app.enable("trust proxy");

// Turn off TLS / certificate checking due to some excpired cert in chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// security
app.use(
  lusca({
    csrf: false,
    xframe: "SAMEORIGIN",
    p3p: false,
    csp: false
  })
);

// logger
app.use((req, res, next) => {
  logger.info(`[Web] ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
    params: req.params
  });
  next();
});

// Swagger setup
const swaggerUi = require('swagger-ui-express');
// routes
const swaggerMiddleware = require("swagger-express-middleware");
var BUILD_DIR = path.join(__dirname, "../.build");
var apiDef = require(path.join(BUILD_DIR, "api.json"));

app.get('/api-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

//app.use('/xdocs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// By default the Swagger Explorer bar is hidden, to display it pass 'explorer : true'
var swaggerOptions = {
  explorer : true
};

app.use('/ydocs',async (req, res, next) => {
   console.log("Middleware has been called");
    next();
  }, swaggerUi.serve, swaggerUi.setup(swaggerDefinition, swaggerOptions));

// api
swaggerMiddleware(apiDef, app, function(err, middleware) {
  if (err) throw err;
  // NOTE: install the swagger middleware at the top level of the app. This is required
  //       as otherwise the path param is missing the /api/1 prefix and swagger metadata
  //       doesn't get attached correctly in:
  //          swagger-express-middleware/lib/request-metadata.js#swaggerPathMetadata
  app.use(middleware.metadata());
  app.use(middleware.parseRequest());
  app.use(middleware.validateRequest());
  app.use(apiDef.basePath, require("./web-api/app"));
});

// static
app.use(require("./web-static/app"));

module.exports = app;
