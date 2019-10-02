import RefFactory from "./RefFactory";

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
    private definitions: { [name: string]: IDefinition } = {};
    private factories: IFactoryGirl;

    public addFactory(
        definition: string,
        tableName: string,
        dataProvider: DataProvider
    ) {
        this.definitions[definition] = {
            tableName,
            dataProvider,
        };

        const build = this.build.bind(this);
        Object.defineProperty(this, definition, {
            value: {
                build: (data: any) => {
                    return build(definition, data);
                },
                insert: (data: any) => {
                    //return this.insert(definition, data);
                },
            },
        });
    }

    public build(name: string, data?: any) {
        if (this.definitions[name] === undefined) {
            throw new Error(`Definition ${name} is not set up`);
        }
        const definition = this.definitions[name];
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
