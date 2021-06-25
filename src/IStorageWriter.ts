export interface IStorageWriter {
    insert: (tableName: string, data: any) => Promise<any>;
}
