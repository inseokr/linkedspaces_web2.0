import type { Metadata } from "next";
import LegalPage from "@/hyodo/components/LegalPage";
import { SUPPORT_EMAIL } from "@/hyodo/lib/site";

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "How to delete your HomeWatch account and data, in the app or by email.",
  alternates: { canonical: "/delete-account" },
};

const DELETED = [
  "Your name",
  "Your home location",
  "Your family link",
  "Your push token",
  "Your status (home / away, last phone use, phone health, knocks)",
];

const MAIL_SUBJECT = encodeURIComponent("Delete my HomeWatch data");
const MAIL_BODY = encodeURIComponent(
  "Please delete my HomeWatch data.\n\nFamily code: \nMy name in the app: \n",
);

// Required by Google Play: a web page explaining how to request deletion.
export default function HyodoDeleteAccountPage() {
  return (
    <LegalPage
      eyebrow="Your data"
      title="Delete your account"
      intro="You can delete your HomeWatch account and data at any time."
    >
      <h2>In the app</h2>
      <ol>
        <li>Open HomeWatch.</li>
        <li>
          Go to <strong>Settings</strong>.
        </li>
        <li>
          Tap <strong>Delete my data</strong> and confirm.
        </li>
      </ol>
      <p>
        Your account and data are removed from our server and your phone right
        away.
      </p>

      <h2>No longer have the app?</h2>
      <p>
        Email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`}
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        with your <strong>family code</strong> (the 6-character code you used to
        connect). We&rsquo;ll delete your data within <strong>30 days</strong>.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        {DELETED.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <p>
        We keep only the latest status, never a history, so nothing else is left
        behind. When everyone leaves a family, the family itself is deleted.
      </p>
    </LegalPage>
  );
}
