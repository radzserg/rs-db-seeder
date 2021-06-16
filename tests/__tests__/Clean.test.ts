import DbSeeder from "../../src/DbSeeder";
import { getKnexClient } from "../configure";
import { KnexStorageWriter } from "../KnexStorageWriter";
import { ref } from "../../src";

describe("Clean", () => {
    const knex = getKnexClient();
    const storage = new KnexStorageWriter(knex);

    beforeAll(async () => {
        // make sure data is clean
        await knex.raw("TRUNCATE channels CASCADE");
    });

    afterAll(async () => {
        await knex.destroy();
    });

    describe("user and channel relation", () => {
        const seeder = new DbSeeder(storage);

        seeder.addFactory({
            id: "user",
            tableName: "users",
            dataProvider: (data: any): any => ({
                name: "Kate",
                phone: "55555555",
                foreign_id: 20,
                ...data,
            }),
            refs: [ref("channel")],
        });
        seeder.addFactory({
            id: "channel",
            tableName: "channels",
            dataProvider: (data: any): any => ({ name: "channel_1", ...data }),
        });

        it("insert 2 nested tables and then clean up all the data", async () => {
            const data = await seeder.insert("user");
            expect(data.id).not.toBeNull();

            await seeder.clean();

            const [channelCount] = await knex.table("channels").count({ count: "*" });
            expect(parseInt(channelCount.count, 10)).toBe(0)
            const [userCount] = await knex.table("channels").count({ count: "*" });
            expect(parseInt(userCount.count, 10)).toBe(0)
        });
    })
})