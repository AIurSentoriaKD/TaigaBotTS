import { ClientEvents, Awaitable } from "discord.js";
import { Taiga } from "./taiga";
import Pixiv from "pixiv.ts";

type LoggerFunction = (...args: unknown[]) => void;

export interface EventProps {
  client: Taiga;
  log: LoggerFunction;
}

export type EventKeys = keyof ClientEvents;

export type EventExec<T extends EventKeys> = (
  props: EventProps,
  ...args: ClientEvents[T]
) => Awaitable<unknown>;

export interface Event<T extends EventKeys> {
  id: T;
  exec: EventExec<T>;
}
