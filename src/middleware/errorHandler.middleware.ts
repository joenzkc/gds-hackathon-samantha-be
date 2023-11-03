import { Context, Next } from "koa";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next(); // Execute the downstream middleware first
  } catch (error) {
    // Handle the error here
    console.error("Error:", error);

    // Set the status code based on the error type
    ctx.status = error.status || 500;

    // Set the response body with the error message
    ctx.body = {
      error: {
        message: error.message || "An error occurred",
      },
    };
  }
}
