
INSERT INTO users (nickname, tag, password_hash, role, description)
VALUES ('Администратор', 'admin', 'admin', 'admin', 'Главный администратор Lumo')
ON CONFLICT (tag) DO NOTHING;

INSERT INTO user_stats (user_id)
SELECT id FROM users WHERE tag = 'admin'
ON CONFLICT (user_id) DO NOTHING;
