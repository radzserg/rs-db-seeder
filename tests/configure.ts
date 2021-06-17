import knex, { Knex } from "knex";
import { Client } from "pg";

export function configurePgClint() {
    return new Client({
        host: "localhost",
        user: "rsdbseeder",
        password: "rsdbseeder",
        database: "rsdbseeder",
        port: 5472,
    });
}

export function getKnexPgClient(): Knex {
    return knex({
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
            max: 5,
        },
        searchPath: ["public", "rsdbseeder"],
    });
}

export function getKnexMysqlClient(): Knex {
    return knex({
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
