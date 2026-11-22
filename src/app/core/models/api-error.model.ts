export interface ErrorResponse {
  readonly message: string;
}

export interface ValidationFieldError {
  readonly field: string;
  readonly messages: string[];
}

export interface ValidationErrorResponse {
  readonly message: string;
  readonly errors: ValidationFieldError[];
}
