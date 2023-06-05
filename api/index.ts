import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import appRouter from './app';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', appRouter);
app.get('/', (req, res) => {
  res.send('Welcome to viater API');
});

app.listen(process.env.PORT, () => {
  console.log('App listening on port 3000!');
});