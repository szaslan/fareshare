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
pool.connect((err, client, done) => {
  if (err) console.log('error');
  client.query(
    'CREATE TABLE IF NOT EXISTS test_table(ID INT PRIMARY KEY NOT NULL, name CHAR(50) NOT NULL)',
    () => console.log('queried')
  );
  done();
});

module.exports = { query: (params, callback) => pool.query(params, callback) };
