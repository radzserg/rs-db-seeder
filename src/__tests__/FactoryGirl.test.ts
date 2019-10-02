import FactoryGirl, { IFactoryGirl } from "../FactoryGirl";
import configureKnex from "./configureKnex";
import { KnexStorageWriter } from "./KnexStorageWriter";
import { ref } from "../RefFactory";

const storage = new KnexStorageWriter(configureKnex());
const factoryGirl = new FactoryGirl(storage);
factoryGirl.addFactory("user", "users", (data: any = {}): any => {
    return {
        id: 99,
        name: "John",
        phone: "55555555",
        channel: ref("channel"),
        foreign_id: 2132323,
        ...data,
    };
});
factoryGirl.addFactory("channel", "channels", (data: any = {}): any => {
    return { id: 1, name: "channel_1", ...data };
});

describe("FactoryGirl", () => {
    it("build data - simple case", () => {
        const data = factoryGirl.build("channel");
        expect(data).toEqual({ id: 1, name: "channel_1" });
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
            channel: { id: 1, name: "channel_1" },
            foreign_id: 2132323,
        });
    });

    it("insert data - simple case", () => {
        const data = factoryGirl.build("channel");
        // factoryGirl.
        // console.log(data);
        // expect(data).toEqual({ id: 99, name: 'John', phone: '55555555' });
    });
});
