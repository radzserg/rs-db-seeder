export default class RefFactory {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export function ref(factoryName: string) {
    return new RefFactory(factoryName);
}
