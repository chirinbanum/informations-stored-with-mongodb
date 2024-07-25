
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const app = express();
const port = 3002;


app.use(bodyParser.urlencoded({ extended: true })); 



const mongoUrl = "mongodb://localhost:27017";
const dbName = "myweb";
let db; 


MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    });


app.get("/", (req, res) => {                              
    res.sendFile(__dirname + "/index.html");
});

const loginRoutes = require('./insertRouter');



const updateRoutes = require('./updateRouter');
const deleteRoutes = require('./deleteRouter');


app.use(express.static(__dirname)); 
app.use('/', loginRoutes); 




app.use('/',  updateRoutes);
app.use('/',deleteRoutes)

app.post("/insert", async (req, res) => {
    const { name, mailid } = req.body;
    console.log("Received data for insertion:", name, mailid); 
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        const result = await db.collection("items").insertOne({ name, mailid });
        console.log("Number of documents inserted:", result.insertedCount); 
        res.redirect("/insert"); 
    } catch (err) {
        console.error("Error inserting data:", err); 
        res.status(500).send("Failed to insert data");
    }
});

app.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find({ name: { $in: ["deva", "devasri"] } }).toArray();

        let tableContent = `
            <h1>Report</h1>
            <table class="report-table">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>`;

        tableContent += items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.mailid}</td>
            </tr>`
        ).join("");

      
        tableContent += `</table>`;

        
        tableContent += `<a href='/insert'>Back to form</a>`;

        
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Report</title>
                <style>
                background-image: url('https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.alamy.com%2Fvintage-vignette-with-blank-paper-and-floral-corners-gray-retro-background-with-abstract-pattern-the-basis-for-design-or-text-image241620318.html&psig=AOvVaw0Sz01E-NxN9HJB6Ebzy3aj&ust=1717219627934000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJirx-GTt4YDFQAAAAAdAAAAABAE');
                
                    table.report-table {
                        width: 100%;
                        border-collapse: collapse;
                        background-image: url('https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.alamy.com%2Fvintage-vignette-with-blank-paper-and-floral-corners-gray-retro-background-with-abstract-pattern-the-basis-for-design-or-text-image241620318.html&psig=AOvVaw0Sz01E-NxN9HJB6Ebzy3aj&ust=1717219627934000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJirx-GTt4YDFQAAAAAdAAAAABAE');
                        background-size: cover; 
                        
                    }
                    table.report-table th, table.report-table td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    table.report-table th {
                        background-color: #f2f2f2;
                    }
                    table.report-table tr:hover {
                        background-color: #f5f5f5;
                    }
                    a {
                        display: block;
                        margin-top: 10px;
                        text-decoration: none;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                ${tableContent}
            </body>
            </html>`;

        
        res.send(htmlContent); 
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});


app.post("/update", async (req, res) => {
    const { name, mailid } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        const result = await db.collection("items").updateOne(
            { name: name },
            { $set: { mailid: mailid } }
        );
        if (result.modifiedCount === 1) {
            console.log("Document updated successfully");
            res.redirect("/report");
        } else {
            console.log("Document not found for update");
            res.status(404).send("Document not found for update");
        }
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }

});

app.post("/delete", async (req, res) => {
    const { name } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        const result = await db.collection("items").deleteMany({ name: name });
        if (result.deletedCount === 1) {
            console.log("Document deleted successfully");
            res.redirect("/report"); 
        } else {
            console.log("Document not found for deletion");
            res.status(404).send("Document not found for deletion");
        }
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})
