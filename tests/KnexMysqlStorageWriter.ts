import { Knex } from "knex";
import { IStorageWriter } from "../src";

export class KnexMysqlStorageWriter implements IStorageWriter {
    private knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any) => {
        const [id] = await this.knex(tableName).insert(data);
        return {
            id,
            ...data,
        };
    };
}
