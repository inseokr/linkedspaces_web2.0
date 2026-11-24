import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/hyodo/components/LegalPage";
import { COMPANY, SUPPORT_EMAIL } from "@/hyodo/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Hyodo collects, why, who can see it, and how to delete it.",
  alternates: { canonical: "/privacy" },
};

// Source: iOS repo, Store/privacy-policy.md
const DATA = [
  {
    what: "Home location",
    detail: "The point you set as home and a 120 m circle around it.",
    why: "To tell whether the watched phone is home or away. Only “home” or “away” is shown to your family, never the coordinates.",
  },
  {
    what: "Home / away and arrive / leave times",
    why: "To show your family whether you're home, and to send the arrive and leave notes they turned on.",
  },
  {
    what: "Last phone use time",
    detail: "Unlock or lock, and opening the app.",
    why: "To notice a long quiet stretch at home and alert your family. We see only when, never what you did.",
  },
  {
    what: "Phone health",
    detail:
      "Battery level, charging, location and notification permission, app version.",
    why: "To tell your family when Hyodo can't do its job, for example because the phone is dead or location is off.",
  },
  {
    what: "Names you enter",
    why: "To show “Mom” or “Alex” to the other person.",
  },
  {
    what: "Knocks",
    why: "The latest knock, and whether it was seen.",
  },
  {
    what: "Device account and push token",
    why: "An anonymous account for this phone, and the token used to deliver notifications. No email, phone number, or password.",
  },
];

export default function HyodoPrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <>
          Hyodo is operated by {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
          It helps a family know that someone living alone is OK at home. It is
          built to share as little as possible.
        </>
      }
    >
      <h2>The short version</h2>
      <ul>
        <li>
          Your family sees <strong>home or away</strong>,{" "}
          <strong>when the phone was last used</strong>, and{" "}
          <strong>phone health</strong> (battery, location permission).
          That&rsquo;s it.
        </li>
        <li>
          We <strong>never</strong> share where you are, your messages, your
          calls, or anything you do in other apps.
        </li>
        <li>
          We keep only the <strong>latest</strong> status, not a history.
        </li>
        <li>
          No ads. No tracking. We don&rsquo;t sell or share data with anyone.
        </li>
        <li>
          You can delete everything from{" "}
          <strong>Settings → Delete my data</strong>.
        </li>
      </ul>

      <h2>What we collect and why</h2>
      <dl className="hw-data-list">
        {DATA.map((d) => (
          <div key={d.what}>
            <dt>
              {d.what}
              {d.detail && (
                <span className="mt-0.5 block text-sm font-normal text-[var(--hw-muted)]">
                  {d.detail}
                </span>
              )}
            </dt>
            <dd>{d.why}</dd>
          </div>
        ))}
      </dl>

      <h2>Who can see it</h2>
      <ul>
        <li>Only the people connected with your family code.</li>
        <li>Our server host (Heroku / MongoDB) stores the data for us.</li>
        <li>Apple and Google deliver notifications.</li>
        <li>
          We don&rsquo;t share data with anyone else, and we don&rsquo;t use it
          for advertising or analytics.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          We keep only the current state, and it is overwritten as things
          change.
        </li>
        <li>When everyone leaves a family, the family is deleted.</li>
        <li>
          When the watched person leaves, their home location, name and status
          are cleared right away.
        </li>
        <li>
          <strong>Settings → Delete my data</strong> removes your account, your
          family link, and your data from our server and your phone. No longer
          have the app? See <Link href="/delete-account">Delete account</Link>.
        </li>
      </ul>

      <h2>Children</h2>
      <p>Hyodo is not directed to children under 13.</p>

      <h2>Contact</h2>
      <p>
        Questions or deletion requests:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>Changes to this policy will be posted on this page.</p>
    </LegalPage>
  );
}
