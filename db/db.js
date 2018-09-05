// const pg = require('pg');
const pg = require('pg');

const config = {
  user: 'szaslan',
  host: 'fareshare.cvhjwsu7pmgh.us-east-2.rds.amazonaws.com',
  database: 'fareshare',
  password: 'NUsharesrides',
  port: 5432,
  max: 20,
};

const pool = new pg.Pool(config);

module.exports = pool;
