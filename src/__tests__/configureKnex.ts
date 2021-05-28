import knex from "knex";

export default function configureKnex(): knex {
    return knex({
        client: "pg",
        version: "11.5",
        connection: {
            host: "0.0.0.0",
            user: "rsdbseeder",
            password: "rsdbseeder",
            database: "rsdbseeder",
            port: 5472
        },
        searchPath: ["public", "rsdbseeder"],
    });
}
