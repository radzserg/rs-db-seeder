import RefColumn from "./RefColumn";
import { IStorageWriter } from "./IStorageWriter";

export type DataProvider = () => any;

export interface IFactoryGirl {
    [key: string]: IFactory;
}

interface IFactory {
    tableName: string;
    id: string;
    dataProvider: DataProvider;
}

/**
 * Allows to easily seed DB. Useful for tests.
 */
export default class DbSeeder {
    private factories: { [name: string]: IFactory } = {};
    private storage: IStorageWriter;

    constructor(storage: IStorageWriter) {
        this.storage = storage;
    }

    /**
     * Adds new factory
     * @param {string} name - factory name, i.e. user, post
     * @param {string} tableName - table name, i.e. users tbl_user etc
     * @param {DataProvider} dataProvider - data provider callback
     * @param {string} id = "id" - ID column name, by default id
     */
    public addFactory(
        name: string,
        tableName: string,
        dataProvider: DataProvider,
        id: string = "id"
    ) {
        this.factories[name] = {
            tableName,
            id,
            dataProvider,
        };
    }

    /**
     * Inserts data to DB
     * @param name - factory name
     * @param data - optional data that will override data generated by dataProvider
     */
    public async insert(name: string, data?: any) {
        const factory = this.getFactory(name);
        const fakeData = {
            ...factory.dataProvider(),
            ...data
        };

        const resultedData: any = {};
        for (const fieldName of Object.keys(fakeData)) {
            const fieldValue = fakeData[fieldName];
            if (fieldValue instanceof RefColumn) {
                const refId = fieldValue.getRefId();
                if (fakeData[refId] === undefined) {
                    const nestedData = data ? data[fieldName] : {};
                    const refData = await this.insert(fieldName, nestedData);
                    resultedData[refId] = refData[fieldValue.getId()];
                }
            } else {
                resultedData[fieldName] = fieldValue;
            }
        }

        return await this.storage.insert(
            factory.tableName,
            resultedData,
            factory.id
        );
    }

    /**
     * Builds data
     * @param name
     * @param data
     */
    public build(name: string, data?: any): any {
        const factory = this.getFactory(name);
        const fakeData = {
            ...factory.dataProvider(),
            ...data
        };

        const resultedData: any = {};
        for (const fieldName of Object.keys(fakeData)) {
            const fieldValue = fakeData[fieldName];
            if (!(fieldValue instanceof RefColumn)) {
                resultedData[fieldName] = fieldValue;
            }
        }
        return resultedData;
    }


    private getFactory(name: string): IFactory {
        const factory = this.factories[name];
        if (factory === undefined) {
            throw new Error(`Definition ${name} is not set up`);
        }
        return factory;
    }
}
