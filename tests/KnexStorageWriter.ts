import { Knex }  from "knex";
import { IStorageWriter } from "../src";

export class KnexStorageWriter implements IStorageWriter {
    private knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any) => {
        const [result] = await this.knex(tableName).insert(data, '*');
        return {
            ...result,
            ...data,
        };
    };

    delete = async (tableName: string, data: any): Promise<void> => {
        await this.knex(tableName).where(data).delete();
    }
}
