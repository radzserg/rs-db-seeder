import knex from "knex";

export default function configureKnex(): knex {
    return knex({
        client: "pg",
        connection: {
            host: "localhost",
            user: "postgres",
            password: "postgres",
            database: "napomnu_test",
            port: 5462
        },
        searchPath: ["public"],
    });
}
