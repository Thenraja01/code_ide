import express from "express";

const Route = express.Router();
Route.get("/", (req, res) => {
  res.send( "API is working ");
});
export default Route