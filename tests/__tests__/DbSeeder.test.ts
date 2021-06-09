import DbSeeder from "../../src/DbSeeder";
import { configureKnex } from "../configure";
import { KnexStorageWriter } from "../KnexStorageWriter";
import RefColumn, { ref } from "../../src/RefColumn";

type UserData = {
    id: number;
    name: string;
    phone: string;
    channel: RefColumn;
    channel_id: number;
    foreign_id: number;
};

describe("DbSeeder", () => {
    afterAll(async () => {
        await knex.destroy();
    });
    const knex = configureKnex();
    const storage = new KnexStorageWriter(knex);

    describe("user and channel relation", () => {
        const seeder = new DbSeeder(storage);

        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        seeder.addFactory("user", "users", (data: any = {}): any => {
            return {
                id: 99,
                name: "John",
                phone: "55555555",
                channel: ref("channel"),
                foreign_id: 2132323,
            };
        });
        seeder.addFactory("channel", "channels", (data: any = {}): any => {
            return { name: "channel_1" };
        });

        it("builds data - simple case", () => {
            const data = seeder.build("channel");
            expect(data.name).toEqual("channel_1");
        });

        it("builds data with referenced field", () => {
            const data = seeder.build("user");
            expect(data).toEqual({
                id: 99,
                name: "John",
                phone: "55555555",
                foreign_id: 2132323,
            });
        });

        it("insert data - simple case", async () => {
            const data = await seeder.insert("channel");
            expect(data.name).toEqual("channel_1");
            expect(data.id).not.toBeNull();
        });

        it("insert data with referenced field", async () => {
            const channelsCount: number = await channelsCountInDb();
            const data = await seeder.insert<UserData>("user", { id: 100 });
            expect(data.name).toEqual("John");
            expect(data.id).toEqual(100);
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).not.toBeNull();
            expect(data.foreign_id).toEqual(2132323);

            const newChannelsCount: number = await channelsCountInDb();
            expect(channelsCount + 1).toEqual(newChannelsCount);
        });

        it("insert data when referenced field is provided", async () => {
            await seeder.insert("channel", { id: 2 });
            const channelsCount: number = await channelsCountInDb();
            const data = await seeder.insert<UserData>("user", {
                channel_id: 2,
            });
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).toEqual(2);
            expect(data.foreign_id).toEqual(2132323);

            const newChannelsCount: number = await channelsCountInDb();
            expect(channelsCount).toEqual(newChannelsCount);
        });

        it("inserts nested data with empty data", async () => {
            const data = await seeder.insert("user");
            expect(data.id).not.toBeNull();
        });
    });

    describe("relation with customized name", () => {
        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        const seeder = new DbSeeder(storage);
        seeder.addFactory("channelAuthors", "users", (data: any = {}): any => {
            return {
                mainChannel: ref("channel", "id", "channel_id"),
                id: 99,
                name: "John",
                phone: "55555555",
                foreign_id: 2132323,
            };
        });
        seeder.addFactory("channel", "channels", (data: any = {}): any => {
            return { name: "channel_1" };
        });

        it("insert data when referenced field is not provided", async () => {
            const channelsCount: number = await channelsCountInDb();
            const data = await seeder.insert<UserData>("channelAuthors");
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).not.toBeNull();
            expect(data.foreign_id).toEqual(2132323);

            const newChannelsCount: number = await channelsCountInDb();
            expect(newChannelsCount).toBeGreaterThan(channelsCount);
        });

        it("insert data when referenced field is provided", async () => {
            await seeder.insert("channel", { id: 2 });
            const channelsCount: number = await channelsCountInDb();
            const data = await seeder.insert<UserData>("channelAuthors", {
                channel_id: 2,
            });
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).toEqual(2);
            expect(data.foreign_id).toEqual(2132323);

            const newChannelsCount: number = await channelsCountInDb();
            expect(channelsCount).toEqual(newChannelsCount);
        });
    });

    async function channelsCountInDb(): Promise<number> {
        const [result] = await knex.table("channels").count("id");
        return parseInt(result["count"], 10);
    }
});
