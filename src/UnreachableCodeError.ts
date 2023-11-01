class UnreachableCodeError extends Error {
  constructor(details: unknown) {
    super("Unreachable code reached with these details: " + JSON.stringify(details))

    this.name = UnreachableCodeError.name
  }
}

export default UnreachableCodeError
