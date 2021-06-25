import { Client } from "pg";
import { Knex } from "knex";
import {
    configurePgClint,
    getKnexMysqlClient,
    getKnexPgClient,
} from "./tests/configure";

let pgClient: Client;
let knexPgClient: Knex;
let knexMysqlClient: Knex;

beforeAll(async () => {
    pgClient = configurePgClint();
    await pgClient.connect();
    knexPgClient = getKnexPgClient();
    knexMysqlClient = getKnexMysqlClient();
});
afterAll(async () => {
    await pgClient.end();
    await knexPgClient.destroy();
    await knexMysqlClient.destroy();
});
