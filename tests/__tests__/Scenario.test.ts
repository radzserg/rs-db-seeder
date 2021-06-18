import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import DbSeeder, { ref, Seeder } from "../../src";
import { randNumber } from "../faker";
import { Knex } from "knex";

describe("Scenario", () => {
    const knex = getKnexPgClient();
    const storage = new KnexPgStorageWriter(knex);

    afterAll(async () => {
        await knex.destroy();
    });

    describe("user and channel scenario without data provider", () => {
        const seeder: Seeder<"userWithChannel"> = new DbSeeder(storage);

        // use transaction instead if clean up
        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        seeder.addScenario({
            id: "userWithChannel",
            insert: async (): Promise<any> => {
                const channel = await storage.insert("channels", {
                    name: "channel_1",
                });

                const user = await storage.insert("users", {
                    name: "John",
                    phone: "55555555",
                    foreign_id: randNumber(),
                    channel_id: channel.id
                });

                return { user, channel };
            },
        });

        it("adds user and channel in scenario", async () => {
            const { user, channel } = await seeder.insert("userWithChannel");
            expect(user).not.toBeNull();
            expect(user.id).not.toBeNull();
            expect(user.name).toBe("John");
            expect(user.phone).toBe("55555555");
            expect(user.foreign_id).not.toBeNull();
            expect(channel).not.toBeNull();
            expect(channel.name).toEqual("channel_1");
        });
    });
});
