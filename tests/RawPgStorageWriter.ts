import { Client } from "pg";
import { IStorageWriter } from "../src/IStorageWriter";

export class RawPgStorageWriter implements IStorageWriter {
    constructor(private readonly client: Client) {}

    insert = async (tableName: string, data: any) => {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = [];
        for (let i = 1; i <= values.length; i++) {
            placeholders.push(`$${i}`);
        }
        const { rows } = await this.client.query(
            `INSERT INTO ${tableName} (${fields.join(", ")}) 
                VALUES (${placeholders.join(", ")}) RETURNING *`,
            values
        );

        return {
            ...data,
            ...rows[0],
        };
    };
}
