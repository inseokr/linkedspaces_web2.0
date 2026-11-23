import { notFound } from "next/navigation";

// Unknown paths on hyodo.linkedspaces.com render hyodo/not-found.tsx inside
// the HomeWatch layout instead of the main site's default 404.
export default function HyodoCatchAll() {
  notFound();
}
