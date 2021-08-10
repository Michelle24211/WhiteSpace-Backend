const mongoose = require('mongoose');
//Dotenv is a zero-dependency module that loads environment npm variables from a .env file into process.env
//const dotenv = require('dotenv');

//Global handled synchronous uncaught exception, unclean state
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🤯 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

//dotenv.config({ path: './config.env' });
const app = require('./src/app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB = `mongodb+srv://michelle-mongodb:${process.env.DATABASE_PASSWORD}@cluster0.le3nd.mongodb.net/whitespace?retryWrites=true&w=majority`;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//Global handled asynchronous unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 🤯 Shutting down...');
  console.log(err.name, err.message);
  // Server finishes all pending/current requests, then shut down server.
  server.close(() => {
    process.exit(1);
  });
});
