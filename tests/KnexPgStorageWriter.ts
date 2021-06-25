import { Knex } from "knex";
import { IStorageWriter } from "../src";

export class KnexPgStorageWriter implements IStorageWriter {
    protected knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any) => {
        const [result] = await this.knex(tableName).insert(data, "*");
        return {
            ...result,
            ...data,
        };
    };
}
