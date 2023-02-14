const fs = require('fs');
const oracledb = require('oracledb');
const http = require("http");
const express = require('express');
const app = express();
const path = require('path');
const basicAuth = require('express-basic-auth')

oracledb.initOracleClient({ libDir: '/instantclient_21_7', configDir: '/Wallet/' });

app.use('/admin', basicAuth({
    users: { 'priceadmin': 'admin_pwd' },
    challenge: true,
    realm: 'Price Admin'
}));

app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.use('/api-docs', express.static(path.join(__dirname, 'api-docs')));

app.get('/free', (req, res) => {
  queryPrice('FREE') .then((json) => {
     console.log(json);
     res.send(JSON.stringify(json));
  });
});

app.put('/admin/free/:json', (req, res) => {
  var json = JSON.parse(req.params['json']);
  updatePrice('FREE', json);
  res.send(JSON.stringify('"free update": "ok"'));
});

app.get('/pro', (req, res) => {
  queryPrice('PRO') .then((json) => {
     console.log(json);
     res.send(JSON.stringify(json));
  });
});

app.put('/admin/pro/:json', (req, res) => {
  var json = JSON.parse(req.params['json']);
  updatePrice('PRO', json);
  res.send(JSON.stringify('"pro update": "ok"'));
});

app.get('/enterprise', (req, res) => {
  queryPrice('ENTERPRISE') .then((json) => {
     console.log(json);
     res.send(JSON.stringify(json));
  });
});

app.put('/admin/enterprise/:json', (req, res) => {
  var json = JSON.parse(req.params['json']);
  updatePrice('ENTERPRISE', json);
  res.send(JSON.stringify('"enterprise update": "ok"'));
});

async function init() {
  try {
    // Create a connection pool which will later be accessed via the
    // pool cache as the 'default' pool.
    await oracledb.createPool({
      user: 'admin',
      password: 'atp_pwd',
      connectString: 'meshdemo_dbname_tp'
    });
    console.log('Connection pool started succesfully. Running DDL.'); 
    DDL();
  } catch (err) {
    console.error('init() error: ' + err.message);
    console.log('priceadmin/atp_pwd');
  }
}

async function queryPrice(tier) {
  let connection;
  try {
    // Get a connection from the default pool
    connection = await oracledb.getConnection();
    const sql = `SELECT PRICE_MO, STORAGE, USERS, SUPPORT FROM PRICE WHERE TIER = :tier`;
    const binds = [tier];
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
    const result = await connection.execute(sql, binds, options);
    const row = result.rows[0];
    const tierOptions = await queryOptions(tier);
    var json = { 'price' : {'monthly' : JSON.stringify(row.PRICE_MO), 'storage' : JSON.stringify(row.STORAGE), 'users' : JSON.stringify(row.USERS), 'support' : JSON.stringify(row.SUPPORT).replace(/['"]+/g, '') }, options : tierOptions };
    return json;
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        // Put the connection back in the pool
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function queryOptions(tier) {
  let connection;
  try {
    // Get a connection from the default pool
    connection = await oracledb.getConnection();
    const sql = `select ISPUBLIC, ISPRIVATE, ISPERMISSIONS, ISSHARING, ISUNLIMITED, ISEXTRASEC FROM OPTIONS WHERE TIER = :tier`;
    const binds = [tier];
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
    const result = await connection.execute(sql, binds, options);
    const row = result.rows[0];
    var json = { 'public' : JSON.stringify(row.ISPUBLIC).replace(/['"]+/g, ''), 'private' : JSON.stringify(row.ISPRIVATE).replace(/['"]+/g, ''), 'permissions' : JSON.stringify(row.ISPERMISSIONS).replace(/['"]+/g, ''), 'sharing' : JSON.stringify(row.ISSHARING).replace(/['"]+/g, ''), 'unlimited' : JSON.stringify(row.ISUNLIMITED).replace(/['"]+/g, ''), 'extrasec' : JSON.stringify(row.ISEXTRASEC).replace(/['"]+/g, '') };
    return json;
  } catch (err) {
    console.error(err);
    closePoolAndExit();
  } finally {
    if (connection) {
      try {
        // Put the connection back in the pool
        await connection.close();
      } catch (err) {
        console.error(err);
        //closePoolAndExit();
      }
    }
  }
}

async function updatePrice(tier, json) {
  let connection;
  console.log(json.price);
  try {
    // Get a connection from the default pool
    connection = await oracledb.getConnection();
    const sql = `UPDATE PRICE SET PRICE_MO = :price, STORAGE = :storage, USERS = :users, SUPPORT = :support WHERE TIER = :tier`;
    const binds = [json.price.monthly, json.price.storage, json.price.users, json.price.support, tier];
    const result = await connection.execute(sql, binds, { autoCommit: true });
    console.log(result);
    const result2 = await updateOptions(tier, json);
  } catch (err) {
    console.error(err);
    //closePoolAndExit();
  } finally {
    if (connection) {
      try {
        // Put the connection back in the pool
        await connection.close();
      } catch (err) {
        console.error(err);
        //closePoolAndExit();
      }
    }
  }
}

async function updateOptions(tier, json) {
  let connection;
  console.log(json.options);
  try {
    // Get a connection from the default pool
    connection = await oracledb.getConnection();
    const sql = `UPDATE OPTIONS SET ISPUBLIC = :ispublic, ISPRIVATE = :isprivate, ISPERMISSIONS = :ispermissions, ISSHARING = :issharing, ISUNLIMITED = :isunlimited,  ISEXTRASEC = :isextrasec WHERE TIER = :tier`;
    const binds = [json.options.public, json.options.private, json.options.permissions, json.options.sharing, json.options.unlimited, json.options.extrasec, tier];
    const result = await connection.execute(sql, binds, { autoCommit: true });
    console.log(result);
  } catch (err) {
    console.error(err);
    //closePoolAndExit();
  } finally {
    if (connection) {
      try {
        // Put the connection back in the pool
        await connection.close();
      } catch (err) {
        console.error(err);
        //closePoolAndExit();
      }
    }
  }
}

async function DDL() {
  let connection;
  try {
    // Get a connection from the default pool
    connection = await oracledb.getConnection();
    const sql1 = `CREATE TABLE PRICE (TIER VARCHAR2(100), PRICE_MO NUMBER(6,2), USERS NUMBER(4), STORAGE NUMBER(4), SUPPORT VARCHAR2(1000))`;
    var result = await connection.execute(sql1);
    console.log(result);
    const sql2 = `create unique index PRICE_TIER_IND on PRICE(TIER)`;
    result = await connection.execute(sql2);
    console.log(result);
    const sql3 = `INSERT INTO PRICE VALUES ('FREE', 0, 10, 2, 'Email support')`;
    result = await connection.execute(sql3,{},{ autoCommit: true });
    console.log(result);
    const sql4 = `INSERT INTO PRICE VALUES ('PRO', 15, 20, 10, 'Priority email support')`;
    result = await connection.execute(sql4,{},{ autoCommit: true });
    console.log(result);
    const sql5 = `INSERT INTO PRICE VALUES ('ENTERPRISE', 29, 30, 15, 'Phone and email support')`;
    result = await connection.execute(sql5,{},{ autoCommit: true });
    console.log(result);
    const sql6 = `CREATE TABLE OPTIONS (TIER VARCHAR2(100), ISPUBLIC VARCHAR2(2), ISPRIVATE VARCHAR2(2), ISPERMISSIONS VARCHAR2(2), ISSHARING VARCHAR2(2), ISUNLIMITED VARCHAR2(2), ISEXTRASEC VARCHAR2(2))`;
    var result = await connection.execute(sql6);
    console.log(result);
    const sql7 = `create unique index OPTIONS_TIER_IND on OPTIONS(TIER)`;
    result = await connection.execute(sql7);
    console.log(result);
    const sql8 = `INSERT INTO OPTIONS VALUES ('FREE', 'Y', 'N', 'Y', 'N', 'N', 'N')`;
    result = await connection.execute(sql8,{},{ autoCommit: true });
    console.log(result);
    const sql9 = `INSERT INTO OPTIONS VALUES ('PRO', 'Y', 'Y', 'Y', 'Y', 'Y', 'N')`;
    result = await connection.execute(sql9,{},{ autoCommit: true });
    console.log(result);
    const sql10 = `INSERT INTO OPTIONS VALUES ('ENTERPRISE', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y')`;
    result = await connection.execute(sql10,{},{ autoCommit: true });
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        // Put the connection back in the pool
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    // Get the pool from the pool cache and close it when no
    // connections are in use, or force it closed after 10 seconds.
    // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file.
    // This setting should not be needed if both Oracle Client and Oracle
    // Database are 19c (or later).
    await oracledb.getPool().close(10);
    console.log('Pool closed');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

process
  .once('SIGTERM', closePoolAndExit)
  .once('SIGINT',  closePoolAndExit);

init();
app.listen(3010);
console.log("DEBUG");
console.log("meshdemo_pwd");
console.log("atp_pwd");