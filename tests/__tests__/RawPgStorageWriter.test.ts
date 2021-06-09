import DbSeeder from "../../src/DbSeeder";
import RefColumn, { ref } from "../../src/RefColumn";
import { configurePgClint } from "../configure";
import { RawPgStorageWriter } from "../RawPgStorageWriter";

type UserData = {
    id: number;
    name: string;
    phone: string;
    channel: RefColumn;
    channel_id: number;
    foreign_id: number;
};

describe("RawPgSeeder", () => {
    const pgClient = configurePgClint();
    const storage = new RawPgStorageWriter(pgClient);
    const rawPgDbSeeder = new DbSeeder(storage);

    rawPgDbSeeder.addFactory("user", "users", (data: any = {}): any => {
        return {
            id: 1000,
            name: "John",
            phone: "55555555",
            channel: ref("channel"),
            foreign_id: 21323,
        };
    });
    rawPgDbSeeder.addFactory("channel", "channels", (data: any = {}): any => {
        return { name: "channel_1" };
    });

    beforeAll(async () => {
        await pgClient.connect();
    });

    afterAll(async () => {
        await pgClient.end();
    });

    beforeEach(async () => {
        await pgClient.query("BEGIN");
    });
    afterEach(async () => {
        await pgClient.query("ROLLBACK");
    });

    it("insert data with referenced field using raw pg", async () => {
        const channelsCount: number = await channelsCountInDb();
        const data = await rawPgDbSeeder.insert<UserData>("user", { id: 100 });
        expect(data.name).toEqual("John");
        expect(data.id).toEqual(100);
        expect(data.phone).toEqual("55555555");
        expect(data.channel_id).not.toBeNull();
        expect(data.foreign_id).toEqual(21323);

        const newChannelsCount: number = await channelsCountInDb();
        expect(channelsCount + 1).toEqual(newChannelsCount);
    });

    async function channelsCountInDb(): Promise<number> {
        const { rows } = await pgClient.query("SELECT COUNT(*) FROM channels");
        return parseInt(rows[0].count!, 10);
    }
});
