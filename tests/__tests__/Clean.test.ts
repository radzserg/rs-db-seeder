import DbSeeder from "../../src/DbSeeder";
import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import { ref } from "../../src";

describe("Clean", () => {
    const knex = getKnexPgClient();
    const storage = new KnexPgStorageWriter(knex);
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

    afterAll(async () => {
        await seeder.clean();
        await knex.destroy();
    });

    describe("user and channel relation", () => {
        it("insert 2 nested tables and then clean up all the data", async () => {
            const data = await seeder.insert("user");
            expect(data.id).not.toBeNull();
            expect(data.channel_id).not.toBeNull();
            const [createdChannel] = await knex
                .table("channels")
                .where("id", data.channel_id);
            expect(createdChannel).not.toBeNull();
            const [createdUser] = await knex
                .table("users")
                .where("id", data.id);
            expect(createdUser).not.toBeNull();

            await seeder.clean();

            const channelsRows = await knex
                .table("channels")
                .where("id", data.channel_id);
            expect(channelsRows).toHaveLength(0);
            const usersRows = await knex.table("users").where("id", data.id);
            expect(usersRows).toHaveLength(0);
        });
    });
});
