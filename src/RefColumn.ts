export default class RefColumn {
    private readonly factoryId: string;
    private readonly referenceColumnName: string;
    private readonly idColumnName: string;

    /**
     *
     * @param factoryId - unique factory ID
     * @param idColumnName - field name that will be used as id column
     * @param referenceColumnName - reference column name, by default factoryId + '_id'
     */
    constructor(
        factoryId: string,
        idColumnName: string = "id",
        referenceColumnName?: string
    ) {
        this.factoryId = factoryId;
        this.referenceColumnName =
            referenceColumnName ?? `${this.factoryId}_id`;
        this.idColumnName = idColumnName;
    }

    public getFactoryId() {
        return this.factoryId;
    }

    public getReferenceColumnName() {
        return this.referenceColumnName;
    }

    public getIdColumnName() {
        return this.idColumnName;
    }
}

/**
 *
 * @param factoryId - unique factory ID
 * @param idColumnName - field name that will be used as id column
 * @param referenceColumnName - reference column name, by default factoryId + '_id'
 */
export function ref(
    factoryId: string,
    idColumnName: string = "id",
    referenceColumnName?: string
) {
    return new RefColumn(factoryId, idColumnName, referenceColumnName);
}
