-- name: CreateChirp :one
INSERT INTO chirps (id, created_at, updated_at, body, user_id)
VALUES (
	gen_random_uuid(),
	now(),
	now(),
	$1,
	$2
)
RETURNING *;

-- name: GetChirpsByAuthorOrAll :many
SELECT * FROM chirps
WHERE (user_id = sqlc.narg(user_id) OR sqlc.narg(user_id) IS NULL)
ORDER BY
    CASE WHEN sqlc.narg(sort_order) = 'DESC' THEN created_at END DESC,
    CASE WHEN sqlc.narg(sort_order) IS NULL OR sqlc.narg(sort_order) = 'ASC' THEN created_at END ASC;

-- name: GetChirpById :one
SELECT * FROM chirps
WHERE id = $1;

-- name: DeleteChirpById :exec
DELETE FROM chirps
	WHERE id = $1;
