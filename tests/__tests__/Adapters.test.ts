import DbSeeder from "../../src/DbSeeder";
import {
    configurePgClint,
    getKnexMysqlClient,
    getKnexPgClient,
} from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import { ref } from "../../src";
import { RawPgStorageWriter } from "../RawPgStorageWriter";
import { KnexMysqlStorageWriter } from "../KnexMysqlStorageWriter";

describe("DbSeederAdapters", () => {
    const knexPg = getKnexPgClient();
    const knexPgStorageWriter = new KnexPgStorageWriter(knexPg);
    const knexPgDbSeeder = new DbSeeder(knexPgStorageWriter);

    const pgClient = configurePgClint();
    const rawPgStorageWriter = new RawPgStorageWriter(pgClient);
    const rawPgDbSeeder = new DbSeeder(rawPgStorageWriter);

    const knexMysql = getKnexMysqlClient();
    const knexMysqlStorageWriter = new KnexMysqlStorageWriter(knexMysql);
    const knexMysqlDbSeeder = new DbSeeder(knexMysqlStorageWriter);

    const seederAdapters = [knexPgDbSeeder, rawPgDbSeeder, knexMysqlDbSeeder];
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
        ["rawMysqlDbSeeder", knexMysqlDbSeeder],
        ["rawPgDbSeeder", rawPgDbSeeder],
        ["knexDbSeeder", knexPgDbSeeder],
    ];

    afterAll(async () => {
        await rawPgDbSeeder.clean();
        await knexPgDbSeeder.clean();
        await knexMysqlDbSeeder.clean();

        await knexMysql.destroy();
        await knexPg.destroy();
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
