import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Bloggo Terms of Service — the rules for using our platform.",
};

const LAST_UPDATED = "February 1, 2026";

export default function TermsPage() {
  return (
    <Container size="md" className="py-16">
      <div className="flex flex-col gap-6 mb-12">
        <Badge variant="default">Legal</Badge>
        <h1 className="text-4xl font-black text-[var(--bloggo-text-primary)]">
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--bloggo-text-muted)]">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
          Please read these Terms of Service carefully before using Bloggo. By
          accessing or using our service, you agree to be bound by these terms.
        </p>
      </div>

      <div className="prose-bloggo flex flex-col gap-2">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using Bloggo, you agree to these Terms of
          Service and our Privacy Policy. If you do not agree, please do not use
          our service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Bloggo provides a blogging platform that allows users to create,
          publish, and share written content. We reserve the right to modify,
          suspend, or discontinue any aspect of the service at any time.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities that occur under your
          account. You must notify us immediately of any unauthorized use of
          your account.
        </p>
        <ul>
          <li>You must be at least 13 years old to use Bloggo</li>
          <li>You may not create more than one account per person</li>
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for all content posted from your account</li>
        </ul>

        <h2>4. Content Policy</h2>
        <p>
          You retain ownership of the content you create on Bloggo. By posting
          content, you grant us a non-exclusive, worldwide license to display,
          distribute, and promote your content on our platform.
        </p>
        <p>You agree not to post content that:</p>
        <ul>
          <li>Is illegal, harmful, or violates others&apos; rights</li>
          <li>Contains spam, malware, or deceptive information</li>
          <li>Infringes on intellectual property rights</li>
          <li>Harasses, threatens, or intimidates others</li>
          <li>Contains adult content without proper age-gating</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          Bloggo and its original content, features, and functionality are owned
          by Bloggo and are protected by international copyright, trademark, and
          other intellectual property laws.
        </p>

        <h2>6. Subscription and Billing</h2>
        <p>
          Paid plans are billed in advance on a monthly or annual basis. All
          fees are non-refundable except as required by law. We reserve the
          right to change pricing with 30 days notice.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account at our sole discretion,
          without notice, for conduct that we believe violates these Terms or is
          harmful to other users, us, or third parties.
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          Bloggo is provided &quot;as is&quot; without warranties of any kind.
          We do not warrant that the service will be uninterrupted, error-free,
          or free of viruses or other harmful components.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Bloggo shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages
          resulting from your use of or inability to use the service.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the State of California,
          without regard to its conflict of law provisions.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms, contact us at{" "}
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
