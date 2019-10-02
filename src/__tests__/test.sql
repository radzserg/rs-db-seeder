create table if not exists public.channels
(
	id serial not null
		constraint channels_pkey
			primary key,
	name varchar(20) not null
);

create table if not exists public.users
(
	id serial not null
		constraint users_pkey
			primary key,
	foreign_id integer not null,
	channel_id integer not null
		constraint users_channel_id_foreign
			references public.channels,
	inserted_at timestamp,
	name varchar(255),
	phone varchar(255),
	constraint users_channel_id_foreign_id_unique
		unique (channel_id, foreign_id)
);

