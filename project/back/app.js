import pkg from 'pg';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
const { Pool } = pkg;

//Modularize environment variables
dotenv.config();
const env = process.env;

//Add dependencies for express
const app = express();
app.use(cors());
app.use(express.json());

//Parameters to conect to the data base
const bd = new Pool({
  host: env.HOST,
  port: env.PORT_DB,
  user: env.USER_DB,
  password: env.USER_PASSWORD,
  database: env.DB_NAME
});

bd.connect(er => {
  if (er) {
    throw er
  }
  console.log("Conect with the database");

})

//Configure multer for the save files in folder 'files'
const mult = multer({ dest: path.join(process.cwd(), 'files/') });

// //Endpoint for upload in db files with format csv
app.post("/send_clients", mult.single('file'), async (req, res) => {
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (info) => {
      const { name, identification, address, phone, email } = info;

      try {
        bd.query("insert into clients(name, identification, address, phone, email) values($1, $2, $3, $4, $5);",
          [name, identification, address, phone, email]);

      } catch (er) {
        res.status(500).json({
          message: "Error"
        })
      }
    })

    .on('end', () => {

      res.status(200).json({
        message: "The csv are upload in the db"
      });
    });
});

//Get clients
app.get("/getClients", async (req, res) => {
  try {

    let data = await bd.query("select * from clients where name != 'Sin cliente'");

    res.status(200).json(data.rows);

    console.log("GET /getClients");


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when get clients" });

  }
});

// Post clients
app.post("/postClient", async (req, res) => {
  try {
    const { name, identification, address, phone, email } = req.body;


    await bd.query("insert into clients(name, identification, address, phone, email) values($1, $2, $3, $4, $5);",
      [name, identification, address, phone, email]
    );

    res.status(201).json({ message: "Client created" })

    console.log("POST /postClients");

  } catch (err) {
    console.error("Error when post clients\n", err)
    res.status(500).json({ message: "An error ocurrered" })

  }
});

//Update clients
app.put("/updateClient", async (req, res) => {
  try {
    const { id, name, identification, address, phone, email } = req.body;
    const resBD = await bd.query('update clients set name=$2, identification=$3, address=$4, phone=$5, email=$6  where id = $1',
      [id, name, identification, address, phone, email]);


    res.status(200).json({
      message: "Client updated"
    });

    console.log("PUT /putClients");
  } catch (er) {
    console.error("Error when update clients", er);
    res.status(500).json({ message: "An error a ocurrered" })
  }
});

//Delete client
app.delete("/deleteClient", async (req, res) => {
  try {
    const idDel = req.body.id;

    bd.query("delete from clients where id=$1", [idDel]);

    res.status(200).json({
      message: "Client deleted"
    });

    console.log("DELETE /deleteClient");

  } catch (er) {
    console.error("Error when delete clients", er);
    res.status(500).json({ message: "Error" })
  }
});


//Endpoints for querys
app.get("/totalPayClients", async (req, res) => {
  try {
    const data = await bd.query("select clients.name as name, sum(invoices.amount) as total from clients join invoices on clients.id = invoices.client_id group by clients.name;");
    res.status(200).json(data.rows);

  } catch(er) {
    console.log(er);
    res.status(500).send("error");
  }
})

app.get("/invoicesPending", async (req, res) => {
  try {
    const data = await bd.query("select c.name as name_client, i.id from clients c join invoices i on c.id = i.client_id join transactions t on t.invoice_id = i.id where i.state = 'Pendiente';");
    res.status(200).json(data.rows);

  } catch(er) {
    console.log(er);
    res.status(500).send("error");
  }
})

app.get("/transactionsNequi", async (req, res) => {
  try {
    const data = await bd.query("select t.platform_bank as bank, c.name as name, i.id as invoices_paying from transactions t join clients c on t.client_id = c.id join invoices i on i.id = t.invoice_id where t.platform_bank = 'Nequi';");
    res.status(200).json(data.rows);

  } catch(er) {
    console.log(er);
    res.status(500).send("error");
  }
})

app.get("/transactionsDaviplata", async (req, res) => {
  try {
    const data = await bd.query("select t.platform_bank as bank, c.name as name, i.id as invoices_paying from transactions t join clients c on t.client_id = c.id join invoices i on i.id = t.invoice_id where t.platform_bank = 'Daviplata';");
    res.status(200).json(data.rows);

  } catch(er) {
    console.log(er);
    res.status(500).send("error");
  }
})

//Configure the server in a port server
app.listen(env.PORT, async (err) => {
  if (err) {
    console.error("Error in the port\n", err)
  } else {
    console.log(`Local server started in\nhttps://localhost:3000`);
  }
});


