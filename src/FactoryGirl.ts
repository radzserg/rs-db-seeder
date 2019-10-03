import RefFactory from "./RefFactory";
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

export default class FactoryGirl {
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
        id: string = 'id'
    ) {
        this.factories[name] = {
            tableName,
            id,
            dataProvider,
        };
    }

    public build(name: string, data?: any) {
        const factory = this.getFactory(name);
        const fakeData = {
            ...factory.dataProvider(),
            ...data
        };

        const resultedData: any = {};
        for (const fieldName of Object.keys(fakeData)) {
            const fieldValue = fakeData[fieldName];
            if (fieldValue instanceof RefFactory) {
                resultedData[fieldName] = this.build(
                    fieldName,
                    data[fieldName]
                );
            } else {
                resultedData[fieldName] = fieldValue;
            }
        }
        return resultedData;
    }

    public async insert(name: string, data?: any) {
        const factory = this.getFactory(name);
        const fakeData = {
            ...factory.dataProvider(),
            ...data
        };

        const resultedData: any = {};
        for (const fieldName of Object.keys(fakeData)) {
            const fieldValue = fakeData[fieldName];
            if (fieldValue instanceof RefFactory) {
                const refData = await this.insert(fieldName, data[fieldName]);
                resultedData[fieldValue.getRefId()] =
                    refData[fieldValue.getId()];
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

    private getFactory(name: string): IFactory {
        const factory = this.factories[name];
        if (factory === undefined) {
            throw new Error(`Definition ${name} is not set up`);
        }
        return factory;
    }
}
