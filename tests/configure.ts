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

export function getKnexClient(): Knex {
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
        searchPath: ["public", "rsdbseeder"],
    });
}
