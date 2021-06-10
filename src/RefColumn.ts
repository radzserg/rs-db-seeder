export default class RefColumn {
    private readonly factoryId: string;
    private readonly refId: string;
    private readonly id: string;

    /**
     *
     * @param factoryId - unique factory ID
     * @param id - field name that will be used as id column
     * @param refId - reference column name, by default factoryId + '_id'
     */
    constructor(factoryId: string, id: string = "id", refId?: string) {
        this.factoryId = factoryId;
        this.refId = refId ?? `${this.factoryId}_id`;
        this.id = id;
    }

    public getFactoryId() {
        return this.factoryId;
    }

    public getRefId() {
        return this.refId;
    }

    public getId() {
        return this.id;
    }
}

/**
 *
 * @param factoryId - unique factory ID
 * @param id - field name that will be used as id column
 * @param refId - reference column name, by default factoryId + '_id'
 */
export function ref(factoryId: string, id: string = "id", refId?: string) {
    return new RefColumn(factoryId, id, refId);
}
