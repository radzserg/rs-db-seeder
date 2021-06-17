import DbSeeder from "../../src/DbSeeder";
import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import { ref } from "../../src";
import { randNumber } from "../faker";

describe("Circular Refs", () => {
    const knex = getKnexPgClient();
    const storage = new KnexPgStorageWriter(knex);

    const seeder = new DbSeeder(storage);

    afterAll(async () => {
        await seeder.clean();
        await knex.destroy();
    });

    seeder.addFactory({
        id: "project",
        tableName: "projects",
        dataProvider: (data: any): any => ({
            name: "prj-1",
            ...data,
        }),
        refs: [ref("user")],
    });
    seeder.addFactory({
        id: "user",
        tableName: "users",
        dataProvider: (data: any): any => ({
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
        refs: [ref("project")],
    });

    it("throw an error when insert entity with circular refs", async () => {
        await expect(async () => {
            await seeder.insert("channel");
        }).rejects.toThrow(
            "Circular refs detected. Please provide at least one entity manually to break the circular chain."
        );
    });

    it("inserts entity with circular refs when one reference is provided", async () => {
        const channel = await seeder.insert("channel", { project_id: null });
        expect(channel.project_id).toBeNull();
        const user = await seeder.insert("user", { channel });
        expect(user).not.toBeNull();
    });
});
