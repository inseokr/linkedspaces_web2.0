import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";
import { getLegalDocLastUpdated } from "@/bloggo/lib/legalDocLastUpdated";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Bloggo Privacy Policy — how we collect, use, and protect your data.",
};

export default function BloggoPrivacyPage() {
  const lastUpdated = getLegalDocLastUpdated("src/app/bloggo/privacy/page.tsx");

  return (
    <Container size="md" className="py-16">
      <div className="flex flex-col gap-6 mb-12">
        <Badge variant="default">Legal</Badge>
        <h1 className="text-4xl font-black text-[var(--bloggo-text-primary)]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--bloggo-text-muted)]">
          Last updated: {lastUpdated}
        </p>
        <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
          This policy describes how LinkedSpaces LLC (&quot;LinkedSpaces,&quot;
          &quot;we,&quot; &quot;us&quot;) handles information when you use the
          Bloggo mobile application.
        </p>
      </div>

      <div className="prose-bloggo flex flex-col gap-2">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account or contact support. This includes your username,
          name where applicable, and email address.
        </p>
        <p>
          We also collect limited technical and usage data to improve the app
          and diagnose issues. For example, the app may send product analytics
          events to our servers (including an anonymous identifier stored on
          your device, app version, timezone, and contextual fields such as
          feature or screen names that do not include the text of your blogs or
          your photo library). Crash or diagnostic data may be included
          depending on your device settings. This category of data is not a full
          copy of your blog text or photo library.
        </p>

        <h2>2. Your Blog Content Stays on Your Device</h2>
        <p>
          Your blogs, drafts, and the photos you include in them are stored and
          processed on your device. Bloggo does not upload your blog content or
          your photos to our servers for backup, sync, hosting, or publishing.
        </p>
        <p>
          Whether you use Bloggo as a guest or with an account, your blog
          material stays on your device unless you export it yourself (for
          example, as a PDF or zip file). If you create an account, we store the
          information needed to sign you in and operate your account on our
          systems, such as username and email. That account information is
          separate from your blog files, which remain on your device.
        </p>
        <ul>
          <li>
            Blog generation uses AI that runs entirely on your device. Your
            photos are not sent to external AI services for that processing.
          </li>
        </ul>

        <h2>3. Photos &amp; Location Metadata</h2>
        <p>
          Photos you add are read from your device&apos;s photo library and stay
          under your control on your device.
        </p>
        <ul>
          <li>
            EXIF metadata (such as GPS coordinates embedded in photo files) may
            be read on your device to help build your blog. You can limit or
            disable related behavior in your app and system settings where
            applicable.
          </li>
        </ul>

        <h2>4. Sharing and Personal Backup</h2>
        <p>
          Sharing in Bloggo is something you start from the app; we do not put
          your blog on a public website. Typical options include:
        </p>
        <ul>
          <li>
            PDF: The app can create a PDF on your device. You can save or
            download it and share it manually using Mail, AirDrop, Files, or any
            other app you choose. Those services have their own privacy
            practices.
          </li>
          <li>
            QR code: You can use a QR code to hand off a blog to another Bloggo
            user in person (for example, so they can open it in Bloggo on their
            device), or for your own convenience. That flow is designed for
            direct, user initiated sharing; it is not for us to host or publish
            your blog online.
          </li>
          <li>
            Zip export: You can export your blog as a zip file for your own
            backup or to move it between your devices. Those files stay under
            your control unless you choose to send them somewhere else.
          </li>
        </ul>

        <h2>5. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Bloggo app.</li>
          <li>Authenticate your account and keep it secure.</li>
          <li>Send important notices, updates, and support communications.</li>
          <li>Respond to your questions and support requests.</li>
          <li>Detect and prevent fraudulent or unauthorized activity.</li>
        </ul>

        <h2>6. Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share limited account information with trusted service
          providers who assist in operating our service (such as authentication
          infrastructure), provided they are bound by confidentiality
          obligations and use the information only as we direct.
        </p>
        <p>
          We may disclose information if required by law or if we believe
          disclosure is necessary to protect our rights or the safety of our
          users.
        </p>

        <h2>7. Guest and Registered User Access</h2>
        <p>Bloggo offers two tiers of access:</p>
        <ul>
          <li>
            Guest users (no account): Guests may create and export a limited
            number of blogs, as shown in the app. To save additional blogs or
            use features that require an account, you can create one.
          </li>
          <li>
            Registered users: Users with a Bloggo account can save and export
            blogs without limits on how many they create or export. Account
            creation requires a valid email address.
          </li>
        </ul>
        <p>
          Age and accounts. Bloggo is listed on the Apple App Store with a 4+
          age rating. That rating reflects the general suitability of the app
          for download and everyday use, including when you use Bloggo without
          registering. Creating a Bloggo account is different: it requires you
          to provide personal information (such as an email address) that we
          process on our systems. For that reason, you must be at least 13 years
          old to create an account. If you are not yet 13, you may not register;
          you may still use Bloggo as a guest within the limits shown in the
          app, without submitting the information we collect for registered
          users.
        </p>
        <ul>
          <li>
            By creating an account, you represent that you are at least 13 years
            of age, or the minimum age required in your jurisdiction to consent
            to the collection of your personal information online, whichever is
            higher.
          </li>
          <li>Only one account may be created per email address.</li>
        </ul>
        <p>
          An account does not move your blog content to our servers; it is still
          stored on your device as described in Section 2, while we store the
          account details needed to sign you in.
        </p>

        <h2>8. Data Retention</h2>
        <p>
          Your blogs and drafts live on your device. Deleting the app removes
          that local data unless you have exported copies (PDF, zip, etc.)
          elsewhere yourself.
        </p>
        <p>
          Information tied to your account (such as your name and email) is kept
          on our systems while your account is active. When you are signed in,
          you can delete your account at any time from the Bloggo app: open
          Settings, then tap Delete Account and confirm. We then process
          deletion of your account from our systems; this typically completes
          within 30 days, subject to legal or security retention needs. You can
          also email{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>{" "}
          if you need help with your account or data.
        </p>

        <h2>9. Data Security</h2>
        <p>
          We implement security measures consistent with industry practice. Data
          sent between the app and our servers for account sign in and related
          services is encrypted in transit (HTTPS/TLS). Your blog content itself
          is not uploaded to our servers under this policy. No method of storage
          or transmission is perfectly secure; we encourage you to use a strong,
          unique password for your Bloggo account and to keep your device and
          Apple ID secure.
        </p>

        <h2>10. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct,
          export, or delete personal data we hold about you. To delete your
          Bloggo account, use Delete Account in Settings while signed in. For
          other requests about account data, contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>
          . You can manage, export, or delete blog content stored on your device
          directly in the app at any time.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any material changes by posting the new policy within the app
          and, where appropriate, by sending a notification to your registered
          email address.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions or concerns about this privacy policy, please
          contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
