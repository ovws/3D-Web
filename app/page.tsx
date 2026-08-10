import { redirect } from "next/navigation";

export default function Home() {
  // The rewrite below keeps the preferred root URL. This is a top-level
  // navigation fallback for runtimes that do not apply Next's static rewrite.
  redirect("/game/index.html");
}
