export class NotInsideProjectError extends Error {
  name = "NotInsideProjectError";
  message = "You are not inside a Templs project";
}
