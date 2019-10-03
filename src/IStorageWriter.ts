export interface IStorageWriter {
    insert: (tableName: string, data: any, id: string) => Promise<any>;
}