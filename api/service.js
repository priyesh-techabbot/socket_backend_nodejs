import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";

const SECRET_KEY = "your_secret_key"; // Use environment variable in production

router.post("/login", async (request, response, next) => {
  try {
    const { username } = request.body;

    if (!username) {
      return response.status(parseInt(process.env.ERROR_API_STATUS)).json({
        error: "username is required",
      });
    }

    // Generate a JWT token (In real-world applications, verify user credentials from DB)
    const token = jwt.sign({ username: username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return response.status(parseInt(process.env.GET_API_STATUS)).json({
      message: "Login successfully",
      data: {
        access_token: token,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(parseInt(process.env.ERROR_API_STATUS)).json({
      error: error.toString(),
    });
  }
});

export default router;
