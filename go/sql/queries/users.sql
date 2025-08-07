-- name: CreateUser :one
INSERT INTO users (id, created_at, updated_at, email, hashed_password)
VALUES (
	gen_random_uuid(),
	now(),
	now(),
	$1,
	$2
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1;

-- name: UpdateChirpyIsRed :one
UPDATE users
	SET updated_at = now(), is_chirpy_red = $2
	WHERE id = $1
RETURNING *;

-- name: UpdateUserPassword :one
UPDATE users
	SET updated_at = now(), hashed_password = $2, email = $3
	WHERE id = $1
RETURNING *;

-- name: DeleteUsers :exec
DELETE FROM users;

