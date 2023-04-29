import { Event } from "../types";
import ready from "./ready";
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";
const events: Event<any>[] = [...interactionCreate, ready, messageCreate];

export default events;
