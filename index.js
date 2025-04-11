const express = require('express');
const fetch = require('node-fetch');
const pool = require('./db.js');
const app = express();
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}
);
app.use(express.json());
const baseUrl = 'https://jsonplaceholder.typicode.com/posts'
app.get('/', async (req, res) => {
    try {
        const response = await fetch(baseUrl);
        const data = await response.json();
        // console.log(data);
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
})
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${baseUrl}/${id}`);
        if (!response.ok) {
            return res.status(404).send('Post not found');
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
}
);
app.post('/posts', async (req, res) => {
    const { title, body, userId } = req.body;
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, userId })
        });
        const data = await response.json();
        res.status(201).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
}
);
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, body, userId } = req.body;
    try {
        const response = await fetch(`${baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, userId })
        });
        if (!response.ok) {
            return res.status(404).send('Post not found');
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating post');
    }
}
);
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            return res.status(404).send('Post not found');
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
}
);

app.get('/users', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error fetching users');
    }
});


app.post('/users', async (req, res) => {
    const { name, email, age } = req.body;
    console.log('Received data:', req.body);
    try {
        const insertQuery = `
        INSERT INTO users (name, email, age)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
        const newUser = await pool.query(insertQuery, [name, email, age]);
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).send('Error creating user');
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error fetching user');
    }
}
);

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;
    try {
        const updateQuery = `
        UPDATE users
        SET name = $1, email = $2, age = $3
        WHERE id = $4
        RETURNING *;
      `;
        const updatedUser = await pool.query(updateQuery, [name, email, age, id]);
        if (updatedUser.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error updating user');
    }
}
);
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING *;';
        const deletedUser = await pool.query(deleteQuery, [id]);
        if (deletedUser.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error deleting user');
    }
}
);