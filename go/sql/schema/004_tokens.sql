-- +goose Up
create table refresh_tokens (
	token text not null PRIMARY KEY,
	created_at timestamp not null,
	updated_at timestamp not null,
	expires_at timestamp not null,
	revoked_at timestamp,
	user_id uuid not null,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- +goose Down
drop table refresh_tokens;
