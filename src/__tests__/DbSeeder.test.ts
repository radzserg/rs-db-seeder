import DbSeeder from "../DbSeeder";
import configureKnex from "./configureKnex";
import { KnexStorageWriter } from "./KnexStorageWriter";
import RefColumn, { ref } from "../RefColumn";

jest.setTimeout(30000);

const knex = configureKnex();
const storage = new KnexStorageWriter(knex);
const dbSeeder = new DbSeeder(storage);

type UserData = {
    id: number;
    name: string;
    phone: string;
    channel: RefColumn;
    channel_id: number;
    foreign_id: number
}

dbSeeder.addFactory("user", "users", (data: any = {}): any => {
    return {
        id: 99,
        name: "John",
        phone: "55555555",
        channel: ref("channel"),
        foreign_id: 2132323,
    };
});
dbSeeder.addFactory("channel", "channels", (data: any = {}): any => {
    return { name: "channel_1" };
});

describe("FactoryGirl", () => {
    beforeEach(async () => {
        await knex.raw("BEGIN");
    });
    afterEach(async () => {
        await knex.raw("ROLLBACK");
    });

    it("builds data - simple case", () => {
        const data = dbSeeder.build("channel");
        expect(data.name).toEqual("channel_1");
    });

    it("builds data with referenced field", () => {
        const data = dbSeeder.build("user");
        expect(data).toEqual({
            id: 99,
            name: "John",
            phone: "55555555",
            foreign_id: 2132323,
        });
    });

    it("insert data - simple case", async () => {
        const data = await dbSeeder.insert("channel");
        expect(data.name).toEqual("channel_1");
        expect(data.id).not.toBeNull();
    });

    it("insert data with referenced field", async () => {
        const channelsCount: number = await channelsCountInDb();
        const data = await dbSeeder.insert<UserData>("user", { id: 100 });
        expect(data.name).toEqual("John");
        expect(data.id).toEqual(100);
        expect(data.phone).toEqual("55555555");
        expect(data.channel_id).not.toBeNull();
        expect(data.foreign_id).toEqual(2132323);

        const newChannelsCount: number = await channelsCountInDb();
        expect(channelsCount + 1).toEqual(newChannelsCount);
    });

    it("insert data when referenced field is provided", async () => {
        const channelsCount: number = await channelsCountInDb();
        const data = await dbSeeder.insert<UserData>("user", { channel_id: 1 });
        expect(data.name).toEqual("John");
        expect(data.id).not.toBeNull();
        expect(data.phone).toEqual("55555555");
        expect(data.channel_id).toEqual(1);
        expect(data.foreign_id).toEqual(2132323);

        const newChannelsCount: number = await channelsCountInDb();
        expect(channelsCount).toEqual(newChannelsCount);
    });

    it("inserts nested data with empty data", async () => {
        const data = await dbSeeder.insert("user");
        expect(data.id).not.toBeNull();
    });

    async function channelsCountInDb(): Promise<number> {
        const [result] = await knex.table("channels").count("id");
        return parseInt(result["count"], 10);
    }
});
