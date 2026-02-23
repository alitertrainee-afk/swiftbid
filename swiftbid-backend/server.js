// express app
import app from "./src/app.js";

// libs import
import dotenv from "dotenv";

// configs import
import connectDB from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
