import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Bloggo Terms of Service — the rules for using our platform.",
};

const LAST_UPDATED = "February 24, 2026";

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
          Bloggo is a travel blogging platform that allows users to create,
          edit, publish, and share blog posts from both the Bloggo iOS mobile
          app and the Bloggo web platform. Our service includes:
        </p>
        <ul>
          <li>
            AI-powered blog generation: automatically create blog posts from
            your travel photos using on-device or cloud-based AI
          </li>
          <li>
            Cloud upload and sync: upload and store your locally created blogs
            to the cloud so they are accessible from any device
          </li>
          <li>
            Web blog editor: edit, format, and publish your blog posts directly
            from a web browser at bloggo.linkedspaces.com
          </li>
          <li>
            Public sharing: share your published blogs via a unique public link
          </li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue any aspect of
          the service at any time.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities that occur under your
          account. You must notify us immediately of any unauthorized use of
          your account.
        </p>
        <ul>
          <li>You must be at least 4 years old to use Bloggo</li>
          <li>You may not create more than one account per email</li>
          <li>You must provide accurate and complete information</li>
          <li>You are responsible for all content posted from your account</li>
        </ul>

        <h2>4. Cloud Storage &amp; Uploads</h2>
        <p>
          Bloggo offers the ability to upload locally created blogs and their
          associated photos to our cloud infrastructure. By using the cloud
          upload feature, you acknowledge and agree that:
        </p>
        <ul>
          <li>
            Uploaded content (including blog text and photos) will be stored on
            Bloggo&apos;s servers and may be accessible from any device where
            you are signed in
          </li>
          <li>
            You are solely responsible for ensuring you have the right to upload
            any photos or content you submit
          </li>
          <li>
            We may compress or optimize photos during the upload process to
            ensure optimal performance
          </li>
          <li>
            Bloggo is not responsible for data loss due to user-initiated
            deletion, account termination for Terms violations, or unforeseen
            technical failures, though we take reasonable precautions to protect
            your data
          </li>
        </ul>

        <h2>5. Web Blog Editor</h2>
        <p>
          The Bloggo web platform provides a full-featured blog editor
          accessible at bloggo.linkedspaces.com. By using the web editor, you
          agree that:
        </p>
        <ul>
          <li>
            Edits made in the web editor are saved to your cloud blog and will
            be reflected across all platforms where your blog is published
          </li>
          <li>
            You are responsible for all content you create or modify using the
            web editor
          </li>
          <li>
            The web editor is provided as-is and may be updated or modified at
            any time; we will make reasonable efforts to preserve your content
            during such updates
          </li>
          <li>
            Auto-save functionality may be available; however, you should
            manually save your work regularly to avoid data loss in the event of
            a connectivity interruption
          </li>
        </ul>

        <h2>6. Content Policy</h2>
        <p>
          You retain ownership of the content you create on Bloggo. By posting
          content or uploading it to the cloud, you grant us a non-exclusive,
          worldwide license to store, display, distribute, and promote your
          content on our platform.
        </p>
        <p>You agree not to post or upload content that:</p>
        <ul>
          <li>Is illegal, harmful, or violates others&apos; rights</li>
          <li>Contains spam, malware, or deceptive information</li>
          <li>Infringes on intellectual property or privacy rights</li>
          <li>Harasses, threatens, or intimidates others</li>
          <li>Contains adult content without proper age-gating</li>
          <li>
            Includes photos of individuals without their consent, especially
            minors
          </li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          Bloggo and its original content, features, and functionality are owned
          by Bloggo and are protected by international copyright, trademark, and
          other intellectual property laws.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may terminate or suspend your account at our sole discretion,
          without notice, for conduct that we believe violates these Terms or is
          harmful to other users, us, or third parties. Upon termination, your
          cloud-stored content may be deleted after a reasonable grace period.
        </p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>
          Bloggo is provided &quot;as is&quot; without warranties of any kind.
          We do not warrant that the service will be uninterrupted, error-free,
          or free of viruses or other harmful components. Cloud storage
          availability is subject to our infrastructure uptime and is not
          guaranteed to be 100% available at all times.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Bloggo shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages
          resulting from your use of or inability to use the service, including
          any loss of cloud-stored data.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the State of California,
          without regard to its conflict of law provisions.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these Terms, contact us at{" "}
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
