import DbSeeder from "../../src/DbSeeder";
import { getKnexClient } from "../configure";
import { KnexStorageWriter } from "../KnexStorageWriter";
import { ref } from "../../src";

describe("KnexStorageWriter", () => {
    const knex = getKnexClient();
    const storage = new KnexStorageWriter(knex);
    const knexDbSeeder = new DbSeeder(storage);

    knexDbSeeder.addFactory({
        id: "user",
        tableName: "users",
        dataProvider: (data: any): any => ({
            id: 99,
            name: "John",
            phone: "55555555",
            foreign_id: 2132323,
            ...data,
        }),
        refs: [ref("channel")],
    });
    knexDbSeeder.addFactory({
        id: "channel",
        tableName: "channels",
        dataProvider: (data: any): any => ({ name: "channel_1", ...data }),
    });

    beforeEach(async () => {
        await knex.raw("BEGIN");
    });
    afterEach(async () => {
        await knex.raw("ROLLBACK");
    });

    it("builds data - simple case", () => {
        const data = knexDbSeeder.build("channel");
        expect(data.name).toEqual("channel_1");
    });

    it("builds data with referenced field", () => {
        const data = knexDbSeeder.build("user");
        expect(data).toEqual({
            id: 99,
            name: "John",
            phone: "55555555",
            foreign_id: 2132323,
        });
    });

    it("insert data - simple case", async () => {
        const data = await knexDbSeeder.insert("channel");
        expect(data.name).toEqual("channel_1");
        expect(data.id).not.toBeNull();
    });
});
