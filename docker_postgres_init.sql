create table project
(
    id serial not null
        constraint project_pk
            primary key,
    name varchar not null
);

create table channels
(
    id serial not null
        constraint channels_pkey
            primary key,
    name varchar(20) not null,
    project_id integer
        constraint channels_project_id_fk
            references project
);

create index channels_project_id_index
	on channels (project_id);

create table users
(
    id serial not null
        constraint users_pkey
            primary key,
    foreign_id integer not null,
    channel_id integer not null
        constraint users_channel_id_foreign
            references channels,
    inserted_at timestamp,
    name varchar(255),
    phone varchar(255),
    constraint users_channel_id_foreign_id_unique
        unique (channel_id, foreign_id)
);

create unique index users_foreign_id_uindex
	on users (foreign_id);

create unique index project_id_uindex
	on project (id);

