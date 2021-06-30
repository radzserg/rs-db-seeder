import knex, { Knex } from "knex";
import { Client } from "pg";

let pgClient: Client;
let knexPgClient: Knex;
let knexMysqlClient: Knex;

export function configurePgClint() {
    if (!pgClient) {
        pgClient = new Client({
            host: "localhost",
            user: "rsdbseeder",
            password: "rsdbseeder",
            database: "rsdbseeder",
            port: 5472,
        });
    }
    return pgClient;
}

export function getKnexPgClient(): Knex {
    if (!knexPgClient) {
        knexPgClient = knex({
            client: "pg",
            version: "11.5",
            connection: {
                host: "0.0.0.0",
                user: "rsdbseeder",
                password: "rsdbseeder",
                database: "rsdbseeder",
                port: 5472,
            },
            pool: {
                min: 1,
                max: 1,
            },
            searchPath: ["public", "rsdbseeder"],
        });
    }
    return knexPgClient;
}

export function getKnexMysqlClient(): Knex {
    if (!knexMysqlClient) {
        knexMysqlClient = knex({
            client: "mysql2",
            connection: {
                host: "127.0.0.1",
                user: "dbseeder",
                password: "dbseeder",
                database: "dbseeder",
                port: 3321,
            },
        });
    }
    return knexMysqlClient;
}
