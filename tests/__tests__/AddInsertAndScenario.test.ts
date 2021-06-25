import DbSeeder from "../../src/DbSeeder";
import { getKnexPgClient } from "../configure";
import { KnexPgStorageWriter } from "../KnexPgStorageWriter";
import { ref } from "../../src";
import { randNumber } from "../faker";

describe("AddInsertAndScenario", () => {
    const knex = getKnexPgClient();
    const storage = new KnexPgStorageWriter(knex);
    const seeder = new DbSeeder(storage);

    seeder.addFactory({
        id: "channel",
        tableName: "channels",
    });

    seeder.addScenario({
        id: "userWithChannel",
        insert: async (): Promise<any> => null,
    });

    it("throw an error when try to register scenario twice", () => {
        expect(() => {
            seeder.addScenario({
                id: "userWithChannel",
                insert: async (): Promise<any> => null,
            });
        }).toThrow("Scenario userWithChannel has been already registered");
    });

    it("throw an error when try to register factory twice", () => {
        expect(() => {
            seeder.addFactory({
                id: "channel",
                tableName: "channels",
            });
        }).toThrow("Factory channel has been already registered");
    });
});
