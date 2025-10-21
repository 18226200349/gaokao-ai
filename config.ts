const configs = {
    mysql: {
        host: 'localhost',
        user: 'root',
        password: 'jmj123456',
        database: 'ai-database',
        port: 3306
    },
    log: {
        error (message: string) {
            console.log('[Knex error]', message)
        }
    },
    aiToken: 'sk-w8mxMdJX1Y1WHhL4yZp26NmrbB43xSRoxmEsIixj7Ae4QJe1'
}

export default configs