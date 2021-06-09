export default class RefColumn {
    private readonly factoryName: string;
    private readonly refId: string;
    private readonly id: string;

    constructor(factoryName: string, id: string = "id", refId?: string) {
        this.factoryName = factoryName;
        this.refId = refId ?? `${this.factoryName}_id`;
        this.id = id;
    }

    public getFactoryName() {
        return this.factoryName;
    }

    public getRefId() {
        return this.refId;
    }

    public getId() {
        return this.id;
    }
}

export function ref(factoryName: string, id: string = "id", refId?: string) {
    return new RefColumn(factoryName, id, refId);
}
