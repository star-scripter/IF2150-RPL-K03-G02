/** Worker MSW untuk browser; dinyalakan oleh `components/MswProvider.tsx`. */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
