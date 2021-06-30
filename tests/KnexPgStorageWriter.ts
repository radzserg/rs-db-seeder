import { Knex } from "knex";
import { IStorageWriter } from "../src";

export class KnexPgStorageWriter implements IStorageWriter {
    protected knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any) => {
        try {
            const [result] = await this.knex(tableName).insert(data, "*");
            return {
                ...result,
                ...data,
            };
        } catch (e) {
            throw new Error(
                `Cannot insert data to ${tableName}. Data: ${JSON.stringify(
                    data
                )}. Error Details: ${e.toString()}`
            );
        }
    };
}
