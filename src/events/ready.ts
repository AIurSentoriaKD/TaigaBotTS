import { event } from "../utils";
export default event("ready", ({ log }, client) => {
  client.user.setActivity('with Minori');
  log(`Logged in as ${client.user.tag}`);
});
