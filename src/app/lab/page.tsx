import { notFound } from "next/navigation";
import { LabClient } from "./LabClient";

export const metadata = { title: "VOLTA lab" };

export default function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabClient />;
}
