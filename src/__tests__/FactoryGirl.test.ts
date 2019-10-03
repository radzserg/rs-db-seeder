import FactoryGirl, { IFactoryGirl } from "../FactoryGirl";
import configureKnex from "./configureKnex";
import { KnexStorageWriter } from "./KnexStorageWriter";
import { ref } from "../RefFactory";

const knex = configureKnex();
const storage = new KnexStorageWriter(knex);
const factoryGirl = new FactoryGirl(storage);
factoryGirl.addFactory("user", "users", (data: any = {}): any => {
    return {
        id: 99,
        name: "John",
        phone: "55555555",
        channel: ref("channel"),
        foreign_id: 2132323
    };
});
factoryGirl.addFactory("channel", "channels", (data: any = {}): any => {
    return { name: "channel_1" };
});

describe("FactoryGirl", () => {
    beforeEach(async () => {
        await knex.raw("BEGIN");
    });
    afterEach(async () => {
        await knex.raw("ROLLBACK");
    });

    it("build data - simple case", () => {
        const data = factoryGirl.build("channel");
        expect(data).toEqual({ name: "channel_1" });
    });

    it("build data with extended data", () => {
        const data = factoryGirl.build("channel", { id: 100 });
        expect(data).toEqual({ id: 100, name: "channel_1" });
    });

    it("build data with referenced field", () => {
        const data = factoryGirl.build("user", { id: 100 });
        expect(data).toEqual({
            id: 100,
            name: "John",
            phone: "55555555",
            channel: { name: "channel_1" },
            foreign_id: 2132323,
        });
    });

    it("insert data - simple case", async () => {
        const data = await factoryGirl.insert("channel");
        expect(data.name).toEqual('channel_1');
        expect(data.id).not.toBeNull();
    });

    it("insert data with referenced field", async () => {
        const data = await factoryGirl.insert("user", { id: 100 });
        expect(data.name).toEqual('John');
        expect(data.id).toEqual(100);
        expect(data.phone).toEqual('55555555');
        expect(data.channel_id).not.toBeNull();
        expect(data.foreign_id).toEqual(2132323);
    });
});
