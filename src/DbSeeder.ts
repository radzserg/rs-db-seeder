import RefColumn from "./RefColumn";
import { IStorageWriter } from "./IStorageWriter";
import { factory } from "ts-jest/dist/transformers/path-mapping";
export type DataProvider = (data?: any) => any;

export interface ISeedFactory<S = string> {
    id: S; // unique factory ID
    tableName: string; // name of the table where factory will write data
    dataProvider?: DataProvider; // function that will create mock data
    // custom insert implementation, (useful for non-trivial cases)
    insert?: (data?: any) => Promise<any>;
    // custom delete implementation, (useful for non-trivial cases)
    delete?: (data?: any) => Promise<void>;
    refs?: RefColumn[];
}

export interface ISeedScenario<S = string> {
    id: S; // unique factory ID
    dataProvider?: DataProvider; // function that will create mock data
    insert: (data?: any) => Promise<any>;
    delete?: (data?: any) => Promise<void>;
}

export interface Seeder<S = string> {
    addFactory: (factory: ISeedFactory<S>) => void;
    addScenario: (scenario: ISeedScenario<S>) => void;
    insert: (factoryId: S, data?: any) => Promise<any>;
    build: (factoryId: S, data?: any) => any;
}

/**
 * Makes it easy to seed the database. Useful for tests.
 */
export default class DbSeeder implements Seeder {
    private factories: ISeedFactory[] = [];
    private scenarios: ISeedScenario[] = [];
    private storage: IStorageWriter;

    private insertedData: { factoryId: string; data: any }[] = [];

    constructor(storage: IStorageWriter) {
        this.storage = storage;
    }

    public addScenario(scenario: ISeedScenario) {
        // @todo ensure that scenario is not registered
        this.scenarios.push(scenario);
    }

    public addFactory(factory: ISeedFactory) {
        this.factories.push(factory);
    }

    /**
     * Inserts data to DB
     * @param id - factory name
     * @param data - optional data that will override data generated by dataProvider
     */
    public async insert(id: string, data: any = {}) {
        const factory = this.getFactory(id);
        if (factory) {
            return await this.insertWithCircularRefCheck(id, data, [id]);
        }
        const scenario = this.getScenario(id);
        if (scenario) {
            return await scenario.insert(data);
        }
        throw new Error(`No factory or scenario with ID ${id} exists`);
    }

    private async insertWithCircularRefCheck(
        factoryId: string,
        data: any = {},
        deps: string[]
    ) {
        if (deps.slice(0, -1).includes(factoryId)) {
            throw new Error(
                "Circular refs detected. Please provide at least one entity manually to break the circular chain. Chain:" +
                    deps.join(" -> ")
            );
        }
        const factory = this.getFactory(factoryId);
        const mockedData = this.build(factoryId, data);

        const refs = factory.refs ?? [];
        const refData: any = {};
        await Promise.all(
            refs.map(async (ref) => {
                const nestedMockedData: any = mockedData
                    ? mockedData[ref.getFactoryId()]
                    : {};
                delete mockedData[ref.getFactoryId()];
                const refColumnName = ref.getReferenceColumnName();
                if (typeof mockedData[refColumnName] !== "undefined") {
                    refData[refColumnName] = mockedData[refColumnName];
                    return;
                }
                if (
                    nestedMockedData &&
                    nestedMockedData[ref.getIdColumnName()]
                ) {
                    refData[refColumnName] =
                        nestedMockedData[ref.getIdColumnName()];
                    return;
                }
                deps.push(ref.getFactoryId());
                const nestedInsertedData = await this.insertWithCircularRefCheck(
                    ref.getFactoryId(),
                    nestedMockedData,
                    deps
                );
                refData[refColumnName] =
                    nestedInsertedData[ref.getIdColumnName()];
            })
        );

        const resultedData: any = {
            ...mockedData,
            ...refData,
        };

        const insertedData = factory.insert
            ? await factory.insert(resultedData)
            : await this.storage.insert(factory.tableName, resultedData);

        this.insertedData.push({ factoryId: factory.id, data: insertedData });

        return insertedData;
    }

    /**
     * Builds data
     * @param id
     * @param data
     */
    public build(id: string, data: any = {}): any {
        const factory = this.getFactory(id);
        if (!factory.dataProvider) {
            return data;
        }
        return factory.dataProvider(data);
    }

    /**
     * Clean up inserted data
     */
    public async clean() {
        while (this.insertedData.length) {
            const { factoryId, data } = this.insertedData.pop();
            const factory = this.getFactory(factoryId);
            factory.delete
                ? await factory.delete(data)
                : await this.storage.delete(factory.tableName, data);
        }
    }

    private getFactory(id: string): ISeedFactory {
        return this.factories.find((f) => f.id === id);
    }

    private getScenario(id: string): ISeedScenario {
        return this.scenarios.find((s) => s.id === id);
    }
}
