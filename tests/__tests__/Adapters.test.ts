import DbSeeder from "../../src/DbSeeder";
import { configurePgClint, getKnexClient } from "../configure";
import { KnexStorageWriter } from "../KnexStorageWriter";
import { ref } from "../../src";
import { RawPgStorageWriter } from "../RawPgStorageWriter";

describe("DbSeederAdapters", () => {
    const knex = getKnexClient();
    const knexStorageWriter = new KnexStorageWriter(knex);
    const knexDbSeeder = new DbSeeder(knexStorageWriter);

    const pgClient = configurePgClint();
    const rawPgStorageWriter = new RawPgStorageWriter(pgClient);
    const rawPgDbSeeder = new DbSeeder(rawPgStorageWriter);

    const seederAdapters = [knexDbSeeder, rawPgDbSeeder];
    seederAdapters.forEach((seeder) => {
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
    });

    const testSeederAdapters: [string, DbSeeder][] = [
        ["rawPgDbSeeder", rawPgDbSeeder],
        ["knexDbSeeder", knexDbSeeder],
    ];

    afterAll(async () => {
        await knex.raw("TRUNCATE channels CASCADE"); // @todo replace with seeder.clean()
        await knex.destroy();
        await pgClient.end();
    });

    it.each(testSeederAdapters)("%s builds data - simple case", (_, seeder) => {
        const data = seeder.build("channel");
        expect(data.name).toEqual("channel_1");
    });

    it.each(testSeederAdapters)(
        "%s builds data with referenced field",
        (_, seeder) => {
            const data = seeder.build("user");
            expect(data).toEqual({
                id: 99,
                name: "John",
                phone: "55555555",
                foreign_id: 2132323,
            });
        }
    );

    it.each(testSeederAdapters)(
        "%s insert data - simple case",
        async (_, seeder) => {
            const data = await seeder.insert("channel");
            expect(data.name).toEqual("channel_1");
            expect(data.id).not.toBeNull();
        }
    );
});
