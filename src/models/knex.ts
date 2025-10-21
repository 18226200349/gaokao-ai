import configs from '../../config';
import knex from 'knex';

const db = knex({
  client: 'mysql',
  connection: {
    host: configs.mysql.host,
    port: configs.mysql.port,
    user: configs.mysql.user,
    password: configs.mysql.password,
    database: configs.mysql.database
  },
  log: {
    error (message: string) {
      console.log('[knex error]', message)
    }
  }
})

export default db;