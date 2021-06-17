import DbSeeder from "../../src/DbSeeder";
import { getKnexClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import { ref } from "../../src";

describe("Builds", () => {
    const knex = getKnexClient();
    const storage = new KnexPgStorageWriter(knex);

    const seeder = new DbSeeder(storage);

    afterAll(async () => {
        await knex.destroy();
    });

    seeder.addFactory({
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
    seeder.addFactory({
        id: "channel",
        tableName: "channels",
        dataProvider: (data: any): any => ({ name: "channel_1", ...data }),
    });

    it("builds data - simple case", () => {
        const data = seeder.build("channel");
        expect(data.name).toEqual("channel_1");
    });

    it("builds data without referenced field", () => {
        const data = seeder.build("user");
        expect(data).toEqual({
            id: 99,
            name: "John",
            phone: "55555555",
            foreign_id: 2132323,
        });
    });

    it("builds data with nested field", () => {
        const data = seeder.build("user", {
            channel: seeder.build("channel", { foo: "buzz" }),
        });
        expect(data).toEqual({
            id: 99,
            name: "John",
            phone: "55555555",
            foreign_id: 2132323,
            channel: {
                name: "channel_1",
                foo: "buzz",
            },
        });
    });
});
