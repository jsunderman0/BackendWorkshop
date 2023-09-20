const express = require ('express');
const app = express();
const pg = require ('pg');
const client = new pg.Client('postgres://localhost/bulls')
const cors = require ('cors');
app.use(cors());
const morgan = require('morgan');
app.use(morgan("dev"))
app.use(express.json())
//console.log(express.json().toString())

app.get('/api/players', async(req, res, next) => {
    try{
        const SQL = `
            SELECT *
            FROM players
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch (error){
        next(error)
    };
});

app.get('/api/players/:id', async (req, res, next) => {
    try{
        const SQL = `
        SELECT *
        FROM players
        WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id])
        if(response.rows.length === 0) {
            throw new Error("id does not exist")
        }
        res.send(response.rows[0])

    }
    catch(error){
        next(error)
    }
});

app.delete('/api/players/:id', async (req, res, next) => {
    try{
        const SQL = `
            DELETE
            FROM players
            WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows)
    }
    catch (error){
        next(error)
    }
});

app.post('/api/players', async (req, res, next) => {
    const body = req.body
    console.log(body)
    try{
        const SQL = `
        INSERT INTO players (name, number, position)
        VALUES ($1, $2, $3)
        RETURNING *
        `;

        const response = await client.query(SQL, [body.name, body.number, body.position])
        res.send(response.rows)
    }
    catch(error){
        next(error)
    }
});

app.put('/api/players/:id', async (req, res, next) => {
    try{
        const SQL = `
            UPDATE players
            SET name = $1, number = $2, position = $3
            WHERE id = $4
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.number, req.body.position, req.params.id])
        res.send(response.rows)
    }
    catch (error){
        next(error)
    }
});

//custom 404 route
app.use('*', (req, res, next) => {
    res.status(404).send("invalid route")
})

app.use((err, req, res, next) => {
    console.log("error handler")
    res.status(500).send(err.message)
})


const start = async () => {
    await client.connect()
    console.log("connected to database")

    const SQL = `
    DROP TABLE IF EXISTS players;
    CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        number INT,
        position VARCHAR(2)
    );
    INSERT INTO players (name, number, position) VALUES ('MichaelJordan', 23, 'sg');
    INSERT INTO players (name, number, position) VALUES ('ScottiePippen', 33, 'sf');
    INSERT INTO players (name, number, position) VALUES ('DennisRodman', 91, 'pf');
    INSERT INTO players (name, number, position) VALUES ('SteveKerr', 25, 'pg');
    `;
   
        await client.query(SQL);
        console.log("database seeded")
        

    const port = process.env.PORT || 3000
    app.listen (port, () => {
        console.log( `listening on port ${port}` )
    })
};

start();