import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import DbSeeder, { Seeder } from "../../src";
import { randNumber } from "../faker";

class AdvancedKnexPgStorageWriter extends KnexPgStorageWriter {
    getKnex() {
        return this.knex;
    }
}

describe("Scenario", () => {
    const knex = getKnexPgClient();
    const storage = new AdvancedKnexPgStorageWriter(knex);
    let user: any;
    let channel: any;

    afterAll(async () => {
        if (user) {
            await knex("users").del("id", user.id);
        }
        if (channel) {
            await knex("channels").del("id", channel.id);
        }
    });

    describe("user and channel scenario without data provider", () => {
        const seeder: Seeder<"userWithChannel"> = new DbSeeder(storage);

        seeder.addScenario({
            id: "userWithChannel",
            insert: async (
                storage: AdvancedKnexPgStorageWriter,
                data: any
            ): Promise<any> => {
                const knex = storage.getKnex();
                knex.raw("BEGIN");

                const channel = await storage.insert("channels", {
                    name: data.channel.name,
                });

                const user = await storage.insert("users", {
                    name: "John",
                    phone: "55555555",
                    foreign_id: randNumber(),
                    channel_id: channel.id,
                });
                knex.raw("COMMIT");
                return { user, channel };
            },
        });

        it("adds user and channel in scenario", async () => {
            const result = await seeder.insert("userWithChannel", {
                channel: { name: "Woh channel" },
            });
            user = result.user;
            channel = result.channel;
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
