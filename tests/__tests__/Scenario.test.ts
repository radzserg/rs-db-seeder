import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import DbSeeder, { Seeder } from "../../src";
import { Knex } from "knex";
import { randNumber } from "../faker";

class AdvancedKnexPgStorageWriter extends KnexPgStorageWriter {
    async transaction<T>(
        callback: (trx: Knex.Transaction) => Promise<T> | void
    ) {
        return await this.knex.transaction(callback);
    }
}

describe("Scenario", () => {
    const knex = getKnexPgClient();
    const storage = new AdvancedKnexPgStorageWriter(knex);

    afterAll(async () => {
        await knex.destroy();
    });

    describe("user and channel scenario without data provider", () => {
        const seeder: Seeder<"userWithChannel"> = new DbSeeder(storage);

        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        seeder.addScenario({
            id: "userWithChannel",
            insert: async (
                storage: AdvancedKnexPgStorageWriter,
                data: any
            ): Promise<any> => {
                return await storage.transaction(async () => {
                    const channel = await storage.insert("channels", {
                        name: data.channel.name,
                    });

                    const user = await storage.insert("users", {
                        name: "John",
                        phone: "55555555",
                        foreign_id: randNumber(),
                        channel_id: channel.id,
                    });

                    return { user, channel };
                });
            },
        });

        it("adds user and channel in scenario", async () => {
            const { user, channel } = await seeder.insert("userWithChannel", {
                channel: { name: "Woh channel" },
            });
            expect(user).not.toBeNull();
            expect(user.id).not.toBeNull();
            expect(user.name).toBe("John");
            expect(user.phone).toBe("55555555");
            expect(user.foreign_id).not.toBeNull();
            expect(channel).not.toBeNull();
            expect(channel.name).toEqual("Woh channel");
        });
    });
});
