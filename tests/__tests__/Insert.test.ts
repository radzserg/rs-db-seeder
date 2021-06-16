import DbSeeder from "../../src/DbSeeder";
import { getKnexClient } from "../configure";
import { KnexStorageWriter } from "../KnexStorageWriter";
import { ref } from "../../src";
import { randNumber } from "../faker";

describe("Insert", () => {
    const knex = getKnexClient();
    const storage = new KnexStorageWriter(knex);

    afterAll(async () => {
        await knex.destroy();
    });

    describe("user and channel relation", () => {
        const seeder = new DbSeeder(storage);

        // use transaction instead if clean up
        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        seeder.addFactory({
            id: "user",
            tableName: "users",
            dataProvider: (data: any): any => ({
                id: randNumber(),
                name: "John",
                phone: "55555555",
                foreign_id: randNumber(),
                ...data,
            }),
            refs: [ref("channel")],
        });
        seeder.addFactory({
            id: "channel",
            tableName: "channels",
            dataProvider: (data: any): any => ({ name: "channel_1", ...data }),
        });

        it("insert data - simple case", async () => {
            const data = await seeder.insert("channel");
            expect(data.name).toEqual("channel_1");
            expect(data.id).not.toBeNull();
        });

        it("insert data with referenced field", async () => {
            const data = await seeder.insert("user", { id: 100 });
            expect(data.name).toEqual("John");
            expect(data.id).toEqual(100);
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).not.toBeNull();
            expect(data.foreign_id).not.toBeNull();
        });

        it("insert data when referenced field is provided", async () => {
            await seeder.insert("channel", { id: 2 });
            const data = await seeder.insert("user", {
                channel_id: 2,
            });
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).toEqual(2);
            expect(data.foreign_id).not.toBeNull();
        });

        it("inserts nested data with empty data", async () => {
            const data = await seeder.insert("user");
            expect(data.id).not.toBeNull();
        });

        it("inserts nested data with predefined values", async () => {
            const data = await seeder.insert("user", {
                channel: { name: "my channel" },
            });
            expect(data.id).not.toBeNull();
            const [channel] = await knex
                .table("channels")
                .where("id", data.channel_id);
            expect(channel).not.toBeNull();
            expect(channel.name).toEqual("my channel");
        });

        it("does not add new reference records if record ID field is provided", async () => {
            const channel = await seeder.insert("channel");
            const data = await seeder.insert("user", {
                channel: { id: channel.id },
            });
            expect(data.id).not.toBeNull();
            expect(data.channel_id).toEqual(channel.id);
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
        seeder.addFactory({
            id: "channelAuthors",
            tableName: "users",
            dataProvider: (data): any => ({
                id: randNumber(),
                name: "John",
                phone: "55555555",
                foreign_id: randNumber(),
                ...data,
            }),
            refs: [ref("channel", "id", "channel_id")],
        });
        seeder.addFactory({
            id: "channel",
            tableName: "channels",
            dataProvider: (data): any => ({ name: "channel_1", ...data }),
        });

        it("insert data when referenced field is not provided", async () => {
            const data = await seeder.insert("channelAuthors");
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).not.toBeNull();
            expect(data.foreign_id).not.toBeNull();
        });

        it("insert data when referenced field is provided", async () => {
            const channel = await seeder.insert("channel", { id: 2 });
            expect(channel.id).toEqual(2);
            const data = await seeder.insert("channelAuthors", {
                channel_id: 2,
            });
            expect(data.name).toEqual("John");
            expect(data.id).not.toBeNull();
            expect(data.phone).toEqual("55555555");
            expect(data.channel_id).toEqual(2);
            expect(data.foreign_id).not.toBeNull();
        });
    });

    describe("predefined relation column value", () => {
        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        const seeder = new DbSeeder(storage);
        seeder.addFactory({
            id: "user",
            tableName: "users",
            dataProvider: (): any => ({
                id: randNumber(),
                name: "John",
                phone: "55555555",
                foreign_id: randNumber(),
                channel_id: 2,
            }),
        });

        it("will use predefined value for a related record", async () => {
            seeder.addFactory({
                id: "channel",
                tableName: "channels",
                dataProvider: (data): any => ({ name: "channel_1", ...data }),
            });
            seeder.insert("channel", { id: 2 });

            const user = await seeder.insert("user");
            expect(user).not.toBeNull();
            expect(user.channel_id).toEqual(2);
        });
    });

    describe("custom insert method", () => {
        beforeEach(async () => {
            await knex.raw("BEGIN");
        });
        afterEach(async () => {
            await knex.raw("ROLLBACK");
        });

        const seeder = new DbSeeder(storage);
        seeder.addFactory({
            id: "channel",
            tableName: "channels",
            dataProvider: (data): any => ({ name: "channel_1", ...data }),
        });
        seeder.addFactory({
            id: "user",
            tableName: "users",
            dataProvider: (data): any => ({
                id: randNumber(),
                name: "John",
                phone: "55555555",
                foreign_id: randNumber(),
                ...data,
            }),
            refs: [ref("channel")],
            insert: async (data: any) => {
                const [user] = await knex("users")
                    .insert(data, "*")
                    .onConflict("foreign_id")
                    .merge();
                return user;
            },
        });

        it("makes custom insert", async () => {
            const channel = await seeder.insert("channel");
            const user1 = await seeder.insert("user", {
                foreign_id: 123,
                name: "john",
                channel,
            });
            expect(user1).not.toBeNull();
            const user2 = await seeder.insert("user", {
                foreign_id: 123,
                name: "tom",
                channel,
            });
            expect(user2).not.toBeNull();
        });
    });
});
