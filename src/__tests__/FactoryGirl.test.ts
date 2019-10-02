import FactoryGirl, { IFactoryGirl } from "../FactoryGirl";

describe("FactoryGirl build", () => {
    it("build data - simple case", () => {
        const factoryGirl = new FactoryGirl();
        factoryGirl.addFactory("user", "users", (data: any = {}): any => {
            return {
                id: 99,
                name: "John",
                phone: "55555555",
                ...data,
            };
        });

        const data = factoryGirl.build("user");
        expect(data).toEqual({ id: 99, name: 'John', phone: '55555555' });
    });

    it("build data with extended data", () => {
        const factoryGirl = new FactoryGirl();
        factoryGirl.addFactory("user", "users", (data: any = {}): any => {
            return {
                id: 99,
                name: "John",
                phone: "55555555",
                ...data,
            };
        });

        const data = factoryGirl.build("user", {id: 100});
        expect(data).toEqual({ id: 100, name: 'John', phone: '55555555' });
    })
});
