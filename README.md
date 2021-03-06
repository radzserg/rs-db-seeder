# RS DB Seeder

`RS DB Seeder` makes it easy to populate database tables for your tests.

-   [Motivation](#motivation)
-   [Getting Started](#getting-started)
    -   [DB Adapter](#db-adapter)
    -   [Factories](#factories)
-   [Usage](#usage)
-   [API](#api)
    -   [Build](#build)
    -   [Insert](#insert)
        -   [References](#references)
        -   [Custom insert implementation](#custom-insert-implementation)
-   [Clean up](#clean-up)
-   [Advanced usage](#advanced-usage)
    -   [Typings](#typings)
    -   [Scenarios](#scenarios)
    -   [Circular Table dependencies](#circular-table-dependencies)

## Motivation

When you have many dependent tables, it becomes difficult to create test data. Sometimes you need to test the function
of changing a user's email address, but you need to create two more dependent tables because the user table has
constraints.

![dependent tables](https://github.com/radzserg/rs-db-seeder/blob/master/docs/dependent_tables_hor.png)

In order to create `user` you have to create `project` and `channel` records first.

```typescript
const { rows: project} = client.query({
  text: 'INSERT INTO projects(name, description) VALUES($1, $2)',
  values: ['Foo Project', 'Bla bla bla'],
})
const { rows: channel} = client.query({
  text: 'INSERT INTO channels(name, project_id) VALUES($1, $2)',
  values: ['dev-hunour', project.id],
})
const { rows: user} = client.query({
  text: 'INSERT INTO users(name, phone, foreign_id, channel_id) VALUES($1, $2)',
  values: ['brianc', '555-555-555', 123 channel.id],
})
```

rs-db-seeder allows you to do it in just one step

```typescript
await dbSeeder.insert("user", { name: "john" });
```

**Any missing information**(phone, foreign_id fields) **will be added and dependent records** (channels, projects)
**will be automatically created** behind the scenes.

# Getting Started

### DB Adapter

`rs-db-seeder` is framework agnostic. It doesn't use specific ORM - like knex, typeorm, sequelize. So you will need
to build your own simple adapter for you application. The adapter implements `IStorageWriter` and has only one
method `insert`. You can find example Postgres and Mysql adapter implementations [here](https://github.com/radzserg/rs-db-seeder/tree/master/tests).

Here's a simple `knex` adapter for `pg`.

```typescript
export class KnexPgStorageWriter implements IStorageWriter {
    private knex: Knex;
    constructor(knex: Knex) {
        this.knex = knex;
    }

    insert = async (tableName: string, data: any) => {
        const [result] = await this.knex(tableName).insert(data, "*");
        return {
            ...result,
            ...data,
        };
    };
}
```

### Factories

Now that we have an adapter, we need to configure `rs-db-seeder`, so that it can generate test data and know about
the dependent tables.

```typescript
seeder.addFactory({
    id: "user", // unique factory ID
    tableName: "users", // table name
    dataProvider: (data: any): any => ({
        // data provider implementation
        id: 99,
        name: "John",
        phone: "55555555",
        foreign_id: 2132323,
        ...data,
    }),
    refs: [
        // identify dependent relations
        ref("channel"), // by default consider users.channel_id => {channel}.id
        // alternatively  you can do  `ref("channel", 'uuid', ch_id)` users.ch_id => {channel}.uuid
    ],
});
seeder.addFactory({
    id: "channel",
    tableName: "channels",
    dataProvider: (data: any): any => ({ name: "channel_1", ...data }),
});
```

# Usage

```typescript
// configure dbSeeder
const knex = configure();
const storage = new KnexPgStorageWriter(knex);
const dbSeeder = new DbSeeder(storage);

seeder.addFactory({
    id: "user",
    tableName: "users",
    dataProvider: (data: any): any => ({
        name: faker.name.firstName(),
        phone: faker.phone.phoneNumber(),
        ...data,
    }),
    refs: [ref("channel")],
});
seeder.addFactory({
    id: "channel",
    tableName: "channels",
    dataProvider: (data: any): any => ({
        name: faker.random.alpha({ count: 10 }),
        ...data,
    }),
});

// usage in your tests
import dbSeeder from "./configureDbSeeder";

it("updates user email", () => {
    const user = seeder.build("user", { name: "john" });

    const updatedUser = myUserMananger.updateName("tom");
    expect(updatedUser.name).toEqual("tom");
});
```

# API

## Build

Build operation allows you to build fake data for your entity. Data is not written to the database. It is somewhat
like a faker, it just builds data for the entire entity. Note: data for referenced tables

```typescript
const data = dbSeeder.build("user", { id: 100 });
// {
//   id: 100,
//   name: 'John',
//   phone: '55555555',
//   foreign_id: 2132323
// }
```

Note: data for referenced tables is not added. At the same time, no one bothers to add them ourselves.

```typescript
const data = dbSeeder.build("user", {
    id: 100,
    channel: dbSeeder.build("channel"),
});
// {
//   id: 100,
//   name: 'John',
//   phone: '55555555',
//   foreign_id: 2132323
//   channel: {
//     name: "my channel"
//   }
// }
```

## Insert

`dbSeeder.insert` - will build and write data to the DB. Note: it's async method. All referenced fields will be built
and inserted as well, i.e. we will do 2 inserts into (ref) channels and users

```typescript
const data = await dbSeeder.insert("user", { id: 100 });
// {
//    id: 100,
//    name: 'John',
//    phone: '55555555',
//    channel_id: 60,            // channel with ID = 60 has created
//    foreign_id: 2132323
//  }
```

## Insert Many

`dbSeeder.insertMany` inserts multiple records

```typescript
const [channel1, channel2] = await seeder.insertMany(2, "channel", {
    name: "channel_1",
});
```

inserts 2 `channel` records with `name: channel_1` 

### References

If you created a dependent entity before, pass it as a simple column value or as an object.

```typescript
const channel = dbSeeder.build("channel");
const user1 = dbSeeder.build("user", { id: 100, channel_id: channel.id });
const user2 = dbSeeder.build("user", { id: 100, channel });
```

if you pass data as an object

```typescript
const data = dbSeeder.build("user", {
    id: 100,
    channel: { name: "my channel" },
});
```

`{ name: "my channel"}` will be passed to channel `insert` method.

if you pass data as an object and an id field is specified, the dependent record will not be inserted.

```typescript
const data = dbSeeder.build("user", { id: 100, channel: { id: 123 } });
```

### Custom insert implementation

It's possible to provide custom insert implementation

```typescript
seeder.addFactory({
    id: "user",
    tableName: "users",
    dataProvider: (data): any => ({
        id: 99,
        name: "John",
        phone: "55555555",
        foreign_id: 2132323,
        ...data,
    }),
    insert: async (data: any) => {
        const [user] = await knex("users")
            .insert(data, "*")
            .onConflict("foreign_id")
            .merge();
        return user;
    },
});
```

# Clean up

The simplest and most efficient approach is to use uncommitted transactions. We insert data, do our tests, then inserted
data is erased because the transaction is rolled back.

```typescript
// use transaction instead if clean up
beforeEach(async () => {
    await knex.raw("BEGIN");
});
afterEach(async () => {
    await knex.raw("ROLLBACK");
});

it("insert data - simple case", async () => {
    const data = await seeder.insert("channel");
    ...
});
```

**Why Seeder does not delete data automatically**

Let's say you are testing the creation of an article. The article must have an author.
(`creator_id integer constraint article_users_id_fk references users`)

```typescript
afterEach(async () => {
    await dbSeeder.cleanup(); // this method doesn't not exist, see explanation below
});

const author = seeder.insert("author");
const article = postManager.addPost(...data, author);
```

Seeder knows that it inserted an author record. It doesn't know about article record. It has been added by `postManager`.
If we try to delete data inserted by the Seeder we will delete only the author record and it leads to constraint
violation since an article must have an author.

To avoid such conflicts, we abandoned the idea of automatic data deletion.

# Advanced usage

### Typings

```typescript
type Factories = "users" | "channels";

const seeder: Seeder<Factories> = new DbSeeder(storage);
seeder.addFactory({
    id: "users",
    tableName: "users",
});
seeder.build("users");
seeder.insert("users");

// TS will signal errors
seeder.insert("usr");
seeder.build("usr");
seeder.addFactory({
    id: "user",
    tableName: "users",
});
```

### Scenarios

For non-trivial cases, you can use scripts. Let's say you need to create records using transactions.

```typescript
class AdvancedKnexPgStorageWriter extends KnexPgStorageWriter {
    getKnex() {
        return this.knex;
    }
}

const knex = getKnexPgClient();
const storage = new AdvancedKnexPgStorageWriter(knex);
const seeder: Seeder<"userWithChannel"> = new DbSeeder(storage);

seeder.addScenario({
    id: "userWithChannel",
    insert: async (
        storage: AdvancedKnexPgStorageWriter,
        data: any
    ): Promise<any> => {
        const knex = storage.getKnex();
        knex.raw("BEGIN");

        const channel = await storage.insert("channels", {
            name: data.channel.name,
        });

        const user = await storage.insert("users", {
            name: "John",
            phone: "55555555",
            foreign_id: randNumber(),
            channel_id: channel.id,
        });
        knex.raw("COMMIT");
        return { user, channel };
    },
});
```

Then you can use it in the same way as you use factories.

```typescript
const { user, channel } = await seeder.insert("userWithChannel", {
    channel: { name: "Woh channel" },
});
```

### Circular Table Dependencies

In case you have tables with circular dependencies

```
users(id, channel_id)    -> channel_id -> channels.od
channels(id, project_id) -> project_id -> projects.id
project(id, creator_id)  -> creator_id -> users.id
```

At least one table has nullable reference. Make sure you break the chain explicitly providing entity with nullable field.

```typescript
const channel = await seeder.insert("channel", { project_id: null });
const user = await seeder.insert("user", { channel });
```
