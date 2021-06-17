create table channels
(
	id int auto_increment
		primary key,
	name varchar(20) not null,
	project_id int null
);

create table users
(
	id int auto_increment
		primary key,
	foreign_id int not null,
	channel_id int not null,
	inserted_at datetime null,
	name varchar(255) null,
	phone varchar(255) null,
	constraint users_channels_id_fk
		foreign key (channel_id) references channels (id)
);

create table projects
(
	id int auto_increment
		primary key,
	name varchar(255) not null,
	creator_id int null,
	constraint project_users_id_fk
		foreign key (creator_id) references users (id)
);

