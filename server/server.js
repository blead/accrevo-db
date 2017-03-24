const auth = require('basic-auth');
const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const uuid = require('uuid/v4');
const config = require('./config.json');

var app = express();

var server = app.listen(config.server.port,() => {
  console.log('server started, listening on port ' + config.server.port);
});

var connections = mysql.createPool(config.db);

app.use(bodyParser.json());

app.post('/company',(req,res,next) => {
  if(config.server.log.post) console.log('request: /company');
  let credentials = auth(req);
  if(!credentials) {
    if(config.server.log.accessDenied) console.log('response: Access denied');
    res.status(401).end('Access denied');
  } else {
    try {
      connections.getConnection( (error,connection) => {
        if(error) {
          connection.release();
          throw error;
        }
        connection.beginTransaction( (error) => {
          if(error) {
            connection.release();
            throw error;
          }
          const companyDefaults = {
            name: '',
            address: '',
            id13: '',
            taxbr: '',
            type: 0,
            comment: '',
            contactperson: '',
            contacttel: '',
            year: 0,
            owner: '',
            partner: '',
            code: ''
          }
          let company = Object.assign(companyDefaults,req.body);
          // validate(company);
          connection.query('INSERT INTO `companys` SET ?', company, (error,results,fields) => {
            if(error) {
              return connection.rollback(() => { connection.release(); throw error; });
            }
            connection.query('INSERT INTO `companykey` SET ?', {company_id: results.insertId, key: uuid(), partner_id: 0}, (error,results,fields) => {
              if(error) {
                return connection.rollback(() => { connection.release(); throw error; });
              }
              connection.commit( (error) => {
                if(error) {
                  return connection.rollback(() => { connection.release(); throw error; });
                }
                if(config.server.log.post) console.log('response: ' + JSON.stringify(req.body));
                res.status(200).end('Success');
                connection.release();
              });
            });
          });
        });
      });
    } catch(error) {
      if(config.server.log.error) console.log('error: ' + error.toString());
      res.status(500).end('Internal server error');
    }
  }
});

app.get('/company/getnewAPIKey',(req,res,next) => {
    if(config.server.log.get) console.log('request: /company/getnewAPIKey?company_name=' + req.query.company_name);
    try {
      connections.query('SELECT `id` FROM `companys` WHERE `name` = ?', [req.query.company_name], (error,results,fields) => {
        if(error) {
          throw error;
        }
        if(results.length == 0) {
          if(config.server.log.badRequest) console.log('response: Bad request');
          res.status(400).end('Bad request');
        } else {
          let entry = {company_id: results[0].id, key: uuid(), partner_id: 0};
          connections.query('UPDATE `companykey` SET ? WHERE `company_id` = ?', [entry,results[0].id], (error,results,fields) => {
            if(error) {
              throw error;
            }
            if(config.server.log.get) console.log('response: ' + entry.key);
            res.status(200).end(entry.key);
          });
        }
      });
    } catch(error) {
      if(config.server.log.error) console.log('error: ' + error.toString());
      res.status(500).end('Internal server error');
    }
});

app.get('/company/:companyname',(req,res,next) => {
  if(config.server.log.get) console.log('request: /company/' + req.params.companyname);
  connections.query('SELECT `id`, `name`, `address`, `code`, `id13` FROM `companys` WHERE `name` = ?', [req.params.companyname], (error,results,fields) => {
    if(error) {
      if(config.server.log.error) console.log('error: ' + error.toString());
      res.status(500).end('Internal server error');
    } else if(results.length == 0) {
      if(config.server.log.notFound) console.log('response: Not found');
      res.status(404).end('Not found');
    } else {
      if(config.server.log.get) console.log('response: ' + JSON.stringify(results[0]));
      res.json(results[0]);
    }
  });
});

app.use((req,res,next) => {
  if(config.server.log.badRequest) {
    console.log('request: ' + req.url);
    console.log('response: Bad request');
  }
  res.status(400).end('Bad request');
});
