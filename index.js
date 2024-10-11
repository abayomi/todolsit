import express from "express";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;

console.log("info log: setting up program to read env file.");
env.config();
console.log("info log: new pg client creating.");

/* ssl: true needs to be there to prevent the error below which showed up on the console:
"connection error Error: read ECONNRESET at TCP.onStreamRead (node:internal/stream_base_commons:218:20) "*/
const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
});
console.log("info log: db.on.");
db.on("error", (err) => {
  console.error(
    "error log: something has gone wrong with db connection!",
    err.stack
  );
});
await db
  .connect()
  .then(() => {
    console.log(
      "info log: db connected, now action dependent on DB can be performed"
    );
    performActionsOnceDBConntcted();
  })
  .catch((err) => {
    console.error("info error: DB connection error", err.stack);
  });

//username is postgrespermalist in render
console.log("info log: middleware starting");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
console.log("info log: midleware ending");

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

function performActionsOnceDBConntcted() {}

async function getItems() {
  //console.log("in getItems");
  let response = await db.query("select * from items");
  //console.log("end getItems");
  return response.rows;
}

app.get("/", async (req, res) => {
  //console.log("in /");
  items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  //items.push({ title: item });
  let response = await db.query("insert into items (title) values($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  let updatedItemTitle = req.body.updatedItemTitle;
  let updatedItemId = req.body.updatedItemId;
  console.log(req.body);
  let response = db.query("update items set title=$1 where id=$2", [
    updatedItemTitle,
    updatedItemId,
  ]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  let deleteItemId = req.body.deleteItemId;
  let respinse = db.query("delete from items where id=$1", [deleteItemId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
