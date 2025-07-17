-- +goose Up
create table users (
	id uuid PRIMARY KEY,
	created_at timestamp not null,
	updated_at timestamp not null,
	email text not null unique
);

-- +goose Down
drop table users;
