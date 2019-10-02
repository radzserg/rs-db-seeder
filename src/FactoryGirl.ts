import RefFactory from "./RefFactory";
import { IStorageWriter } from "./IStorageWriter";

export type DataProvider = (data?: any) => any;

interface IFactory {
    build: (data?: any) => any;
    insert: (data?: any) => any;
}

export interface IFactoryGirl {
    [key: string]: IFactory;
}

interface IDefinition {
    tableName: string;
    dataProvider: DataProvider;
}

export default class FactoryGirl {
    private factories: { [name: string]: IDefinition } = {};
    private storage: IStorageWriter;

    constructor(storage: IStorageWriter) {
        this.storage = storage;
    }

    public addFactory(
        definition: string,
        tableName: string,
        dataProvider: DataProvider
    ) {
        this.factories[definition] = {
            tableName,
            dataProvider,
        };
    }

    public build(name: string, data?: any) {
        if (this.factories[name] === undefined) {
            throw new Error(`Definition ${name} is not set up`);
        }
        const definition = this.factories[name];
        const fakeData = definition.dataProvider(data);

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

    public insert(name: string, data?: any) {
        if (this.factories[name] === undefined) {
            throw new Error(`Definition ${name} is not set up`);
        }
        const definition = this.factories[name];
        const fakeData = definition.dataProvider(data);

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
}
