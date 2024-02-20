import { event } from "../utils";
export default event("ready", ({ log }, client) => {
  client.user.setActivity("with minori");
  log(`Logged in as ${client.user.tag}`);
});
