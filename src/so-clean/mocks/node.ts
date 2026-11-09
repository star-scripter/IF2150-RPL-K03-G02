/** Server MSW untuk test Vitest (Node.js). */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
