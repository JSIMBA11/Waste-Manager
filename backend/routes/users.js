// POST /api/users/register
router.post('/register', async (req, res) => {
  const { full_name, email, phone_number, location, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (full_name, email, phone_number, location, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone_number, location`,
      [full_name, email, phone_number, location, hash]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
});
