# RS DB Seeder

`RS DB Seeder` allows you to populate DB tables for your tests easily.

# Getting Started

### DB Adapter
We need to build our own DB provider implementing `IStorageWriter` first.
Here's a simple `knex` adapter for `pg`. 

```typescript
export class KnexStorageWriter implements IStorageWriter {
    private knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any, id: string = 'id') => {
        const [result] = await this.knex(tableName).insert(data, [id]);
        return {
            ...result,
            ...data,
        };
    };
}

const knex = configureKnex();
const storage = new KnexStorageWriter(knex);
const dbSeeder = new DbSeeder(storage);
```

### Setup factories
```typescript
/**
 * Adds new factory
 * @param {string} name - factory name, i.e. user, post
 * @param {string} tableName - table name, i.e. users tbl_user etc
 * @param {DataProvider} dataProvider - data provider callback
 * @param {string} id = "id" - ID column name, by default id  
 */
dbSeeder.addFactory("channel", "channels", (data: any = {}): any => {
    return { name: "channel_1" };
});
dbSeeder.addFactory("user", "users", (data: any = {}): any => {
    return {
        id: faker.random.number(999999),
        channel: ref("channel"),        // references to the another factory
        foreign_id: faker.random.number(999999999),
        name: faker.name.findName(),
        phone: faker.phone.phoneNumber()
    };
});
```

### Usage 

`dbSeeder.insert` - will build and write data to the DB. Note: it's async method. All referenced fields will be built 
and inserted as well, i.e. we will do 2 inserts into (ref) channels and users 
```typescript
const data = await dbSeeder.insert("user", { id: 100 });
/*
   {
      id: 100,
      name: 'John',
      phone: '55555555',
      channel_id: 60,
      foreign_id: 2132323
    }
*/
``` 

`dbSeeder.build` - build data without DB updates. Ref columns won't ne provided
```typescript
const data = factoryGirl.build("user", { id: 100 });
/*
    {
      id: 100,
      name: 'John',
      phone: '55555555',
      foreign_id: 2132323
    }
*/
```
