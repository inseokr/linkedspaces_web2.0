import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Bloggo Privacy Policy — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "February 24, 2026";

export default function BloggoPrivacyPage() {
  return (
    <Container size="md" className="py-16">
      <div className="flex flex-col gap-6 mb-12">
        <Badge variant="default">Legal</Badge>
        <h1 className="text-4xl font-black text-[var(--bloggo-text-primary)]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--bloggo-text-muted)]">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
          At Bloggo, we take your privacy seriously. This policy explains what
          data we collect, how we use it, and your rights regarding your
          personal information — including data related to our cloud upload and
          web blog editing features.
        </p>
      </div>

      <div className="prose-bloggo flex flex-col gap-2">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account, publish a blog post, or contact support. This
          includes your name, email address, and any content you create on our
          platform.
        </p>
        <p>
          We also collect usage data automatically, including your IP address,
          browser type, pages visited, and time spent on the platform. This
          helps us improve Bloggo and diagnose technical issues.
        </p>

        <h2>2. Photos &amp; Cloud-Uploaded Content</h2>
        <p>
          Bloggo allows you to upload photos and blog content from the iOS app
          or web editor to our cloud servers. Regarding this content:
        </p>
        <ul>
          <li>
            <strong>Photos you upload</strong> are stored securely on our cloud
            infrastructure and are used solely to display your blog posts and
            generate AI-assisted travel blogs on your behalf
          </li>
          <li>
            <strong>Photos are not shared</strong> with third parties for
            advertising, training data sets, or any purpose other than operating
            and improving the Bloggo service
          </li>
          <li>
            <strong>AI blog generation</strong> may process your photos using
            on-device or cloud-based AI models to identify scenes and generate
            descriptive text; this processing is done solely to create your blog
            content
          </li>
          <li>
            <strong>EXIF metadata</strong> (such as GPS location embedded in
            photo files) may be read by our service to enrich your blog with
            location data if you choose to enable this feature; you can disable
            location enrichment in your app settings
          </li>
          <li>
            You may delete your uploaded photos and blogs at any time from
            within the app or web editor; deletions are processed within 30 days
            from our backup systems
          </li>
        </ul>

        <h2>3. Web Blog Editor Usage</h2>
        <p>
          When you use the Bloggo web editor at bloggo.linkedspaces.com, we
          collect:
        </p>
        <ul>
          <li>
            <strong>Session data</strong> — authentication tokens to verify your
            identity and keep you securely signed in
          </li>
          <li>
            <strong>Edit history</strong> — changes you make to blog posts are
            logged temporarily to support auto-save and conflict resolution
            across devices
          </li>
          <li>
            <strong>Browser &amp; device information</strong> — browser type,
            operating system, and screen resolution to ensure the editor renders
            correctly for you
          </li>
        </ul>
        <p>
          Content you write or edit in the web editor is saved to your cloud
          account and is subject to the same privacy protections as all other
          user content described in this policy.
        </p>

        <h2>4. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>
            Store and sync your blogs and photos across the iOS app and web
            platform
          </li>
          <li>
            Generate AI-powered blog posts from your uploaded travel photos
          </li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze usage patterns to improve the platform</li>
          <li>Detect and prevent fraudulent or illegal activity</li>
        </ul>

        <h2>5. Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information or uploaded
          content to third parties. We may share your information with trusted
          service providers who assist us in operating our platform (such as
          cloud hosting providers), provided they agree to keep this information
          confidential and use it only for the purposes we specify.
        </p>
        <p>
          We may disclose your information if required by law or if we believe
          disclosure is necessary to protect our rights or the safety of others.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain your personal information and cloud-stored content for as
          long as your account is active or as needed to provide services. You
          may request deletion of your account and all associated data —
          including uploaded photos and blog posts — at any time by contacting
          our support team. Data is removed from active systems promptly and
          from backups within 30 days.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your
          personal information and uploaded content, including encrypted
          transmission (HTTPS/TLS) and encrypted storage for sensitive account
          data. However, no method of transmission over the internet is 100%
          secure, and we cannot guarantee absolute security. We encourage you to
          use a strong, unique password for your Bloggo account.
        </p>

        <h2>8. Cookies &amp; Local Storage</h2>
        <p>
          We use cookies and similar tracking technologies to keep you signed in
          across sessions and to track activity on our web platform. The web
          blog editor may use browser local storage to preserve draft content
          temporarily. You can instruct your browser to refuse all cookies or to
          indicate when a cookie is being sent, though doing so may affect
          certain features such as staying signed in.
        </p>

        <h2>9. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct,
          export, or delete your personal data and uploaded content. You may
          also have the right to object to or restrict certain processing of
          your data. To exercise these rights, please contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>
          .
        </p>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          Bloggo is not directed to children under 13. We do not knowingly
          collect personal information or photos from children under 13. If you
          become aware that a child has provided us with personal information,
          please contact us immediately so we can delete it.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any material changes by posting the new policy on this page,
          updating the &quot;Last updated&quot; date above, and, where
          appropriate, sending a notification via email or within the app.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>{" "}
          or through our{" "}
          <a
            href="/bloggo/support"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            support page
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
