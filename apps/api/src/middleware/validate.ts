import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validates req.body / req.query / req.params against a Zod schema.
 * Throws ZodError on failure, caught centrally by errorHandler.
 */
export function validate(schema: Schema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    req[source] = schema.parse(req[source]);
    next();
  };
}
