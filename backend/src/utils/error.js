export class APIError extends Error {
  constructor(message = "Internal Server Error", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends APIError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class DatabaseError extends APIError {
  constructor(message = "Database Error") {
    super(message, 500);
  }
}
