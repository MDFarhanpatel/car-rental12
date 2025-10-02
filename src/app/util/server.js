import express from "express";
import { handler } from "../api/v1/upload/get-signed-url/route.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Route for generating signed upload URL
app.post("/api/v1/upload/get-signed-url", handler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
