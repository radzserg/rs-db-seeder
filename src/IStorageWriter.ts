export interface IStorageWriter {
    insert: (tableName: string, data: any) => Promise<any>;
    delete: (tableName: string, data: any) => Promise<void>;
}