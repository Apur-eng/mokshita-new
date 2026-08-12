const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'autoparts.db');

const api = {
  _sqlDb: null,

  async init() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      this._sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      this._sqlDb = new SQL.Database();
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      this._sqlDb.exec(schema);
      this.save();
    }

    return this;
  },

  save() {
    if (!this._sqlDb) return;
    const data = this._sqlDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  },

  exec(sql) {
    this._sqlDb.exec(sql);
    this.save();
  },

  prepare(sql) {
    const self = this;
    return {
      all(...params) {
        const stmt = self._sqlDb.prepare(sql);
        if (params.length) stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
      get(...params) {
        const rows = this.all(...params);
        return rows[0];
      },
      run(...params) {
        self._sqlDb.run(sql, params);
        self.save();
        return { changes: self._sqlDb.getRowsModified() };
      },
    };
  },

  transaction(fn) {
    const self = this;
    return (...args) => {
      try {
        const result = fn(...args);
        self.save();
        return result;
      } catch (err) {
        throw err;
      }
    };
  },
};

module.exports = api;
