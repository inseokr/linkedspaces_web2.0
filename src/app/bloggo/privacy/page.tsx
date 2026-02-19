import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "BlogGo Privacy Policy — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "February 1, 2026";

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
          At BlogGo, we take your privacy seriously. This policy explains what
          data we collect, how we use it, and your rights regarding your
          personal information.
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
          helps us improve BlogGo and diagnose technical issues.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze usage patterns to improve the platform</li>
          <li>Detect and prevent fraudulent or illegal activity</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information with trusted service providers
          who assist us in operating our platform, provided they agree to keep
          this information confidential.
        </p>
        <p>
          We may disclose your information if required by law or if we believe
          disclosure is necessary to protect our rights or the safety of others.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is
          active or as needed to provide services. You may request deletion of
          your account and associated data at any time by contacting our support
          team.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on
          our service and hold certain information. You can instruct your
          browser to refuse all cookies or to indicate when a cookie is being
          sent.
        </p>

        <h2>6. Security</h2>
        <p>
          We implement industry-standard security measures to protect your
          personal information. However, no method of transmission over the
          internet is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct,
          or delete your personal data. You may also have the right to object to
          or restrict certain processing of your data. To exercise these rights,
          please contact us at{" "}
          <a
            href="mailto:contactbloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            contactbloggo@linkedspaces.com
          </a>
          .
        </p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          BlogGo is not directed to children under 13. We do not knowingly
          collect personal information from children under 13. If you become
          aware that a child has provided us with personal information, please
          contact us immediately.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the &quot;Last updated&quot; date above.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at{" "}
          <a
            href="mailto:contactbloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            contactbloggo@linkedspaces.com
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
