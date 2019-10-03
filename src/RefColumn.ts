export default class RefColumn {
    private readonly name: string;
    private readonly refId: string;
    private readonly id: string;

    constructor(name: string, id: string = 'id', refId?: string) {
        this.name = name;
        this.refId = refId;
        this.id = id;
    }

    public getRefId() {
        if (this.refId) {
            return this.refId;
        }
        return `${this.name}_id`;
    }

    public getId() {
        return this.id;
    }
}

export function ref(factoryName: string, id: string = 'id', refId?: string){
    return new RefColumn(factoryName, id, refId);
}
