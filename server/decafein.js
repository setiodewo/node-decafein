// Author : Emanuel Setio Dewo
// Started : 04/09/2024

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 4000;

// Static
app.use('/decafein', express.static('../client'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var corsOptions = {
    credential: true,
    origin: '*'
}

app.use(cors(corsOptions));

// Application level middleware
app.use((req, res, next) => {
    const d = new Date(Date.now());
    var b = '';
    if (req.method == 'POST') b = JSON.stringify(req.body);
    console.log(`${d.toISOString()} ${req.ip} ${req.path} ${b}`);
    next();
});

// routers
import login from "./router/login.js";
import menu from "./router/menu.js";
import user from "./router/user.js";
import cafe from "./router/cafe.js";

app.use("/login", login);
app.use("/menu", menu);
app.use("/user", user);
app.use("/cafe", cafe);

app.get('/', (req, res) => {
    res.redirect('../client/index.html');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});