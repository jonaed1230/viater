import app from "./index";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('App listening on port 3000!');
});