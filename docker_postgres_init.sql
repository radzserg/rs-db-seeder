create table channels
(
	id serial not null
		constraint channels_pkey
			primary key,
	name varchar(20) not null,
	project_id integer
);

alter table channels owner to rsdbseeder;

create index channels_project_id_index
	on channels (project_id);

create table users
(
	id serial not null
		constraint users_pkey
			primary key,
	foreign_id integer not null,
	channel_id integer not null
		constraint users_channel_id
			references channels,
	inserted_at timestamp,
	name varchar(255),
	phone varchar(255)
);

alter table users owner to rsdbseeder;

create unique index users_foreign_id_uindex
	on users (foreign_id);

create table projects
(
	id serial not null
		constraint project_pk
			primary key,
	name varchar not null,
	creator_id integer
		constraint project_users_id_fk
			references users
);

alter table projects owner to rsdbseeder;

alter table channels
	add constraint channels_project_id_fk
		foreign key (project_id) references projects;

create unique index project_id_uindex
	on projects (id);

