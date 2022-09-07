import config from "config";
import mongoose from "mongoose";

export async function conectToMongo() {
  try {
    await mongoose.connect(config.get("dbUri"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
