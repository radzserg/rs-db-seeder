import { Client } from "pg";
import { IStorageWriter } from "../src";

export class RawPgStorageWriter implements IStorageWriter {
    constructor(private readonly client: Client) {}

    insert = async (tableName: string, data: any) => {
        await this.client.connect();

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

    delete = async (
        tableName: string,
        data: { [key: string]: string }
    ): Promise<any> => {
        await this.client.connect();

        const where = Object.keys(data)
            .map((k, v) => {
                return `${k} = $${v}`;
            })
            .join(" AND ");
        const values = Object.values(data);

        console.log(`DELETE FROM ${tableName} WHERE ${where}`)

        await this.client.query(
            `DELETE FROM ${tableName} WHERE ${where}`,
            values
        );
    };
}
