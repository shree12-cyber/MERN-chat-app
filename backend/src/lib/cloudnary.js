import { v2 as cloudnary } from "cloudinary";
import { config } from "dotenv";

config();

cloudnary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_SECRET_KEY,
});

export default cloudnary;
