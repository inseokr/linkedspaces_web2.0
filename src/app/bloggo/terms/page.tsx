import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";
import { getLegalDocLastUpdated } from "@/bloggo/lib/legalDocLastUpdated";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Bloggo Terms of Service — the rules for using our platform.",
};

export default function TermsPage() {
  const lastUpdated = getLegalDocLastUpdated("src/app/bloggo/terms/page.tsx");

  return (
    <Container size="md" className="py-16">
      <div className="flex flex-col gap-6 mb-12">
        <Badge variant="default">Legal</Badge>
        <h1 className="text-4xl font-black text-[var(--bloggo-text-primary)]">
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--bloggo-text-muted)]">
          Last updated: {lastUpdated}
        </p>
        <p className="text-[var(--bloggo-text-secondary)] leading-relaxed">
          These Terms of Service govern your use of the Bloggo mobile
          application and related Services provided by LinkedSpaces LLC.
        </p>
      </div>

      <div className="prose-bloggo flex flex-col gap-2 pb-10">
        <h2>1. Acceptance of Terms</h2>
        <p>
          The Bloggo mobile application and the features and services available
          through it (the &quot;App,&quot; and our &quot;Services&quot;) are
          provided to you by LinkedSpaces LLC (&quot;LinkedSpaces,&quot;
          &quot;we,&quot; &quot;us&quot;) subject to these Terms of Service,
          including the policies described in our Privacy Policy (together, the
          &quot;Terms&quot;). By downloading, accessing, or using the App,
          whether as a guest or with a registered account, you agree to follow
          and be bound by the Terms. We may update the Terms from time to time.
          The current Terms are available within the App. We and our third party
          service providers may change features, services, related to the App
          without notice. Bloggo is a travel journaling app; your blog content
          and photos are stored locally on your device and are not uploaded to
          our servers as part of normal app operation, except as described in
          our Privacy Policy (for example, account information you provide and
          limited technical or usage data). Certain parts of the Terms may be
          clarified by additional notices we show in the App.
        </p>
        <p>
          Bloggo is offered on the Apple App Store with a 4+ age rating. That
          rating describes the general suitability of the Bloggo app for a wide
          audience when used as designed. Registering for a Bloggo account is
          separate: it involves providing personal information and using our
          authentication and account services. You must be at least 13 years old
          to create an account (or the minimum age required in your jurisdiction
          for you to consent to our collection and use of your personal
          information online, if that age is higher). If you are under that age,
          you must not register; you may use Bloggo only as a guest, within the
          limits described in these Terms. Parents and guardians are responsible
          for deciding whether guest use is appropriate for minors in their
          care. If you do not agree with the Terms, do not use the App.
        </p>
        <p>
          BY CONTINUING TO USE THE APP, YOU INDICATE YOUR AGREEMENT TO THE TERMS
          AND ANY REVISIONS WE POST.
        </p>
        <p>
          We may modify or discontinue the App or any part of it, temporarily or
          permanently, with or without notice. You agree that we are not liable
          to you or to any third party for any modification, suspension, or
          discontinuance of the App or any portion of it.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Bloggo is a travel journaling app that helps you create, edit, and
          share beautifully formatted blog posts from your travel experiences.
          Our service includes:
        </p>
        <ul>
          <li>
            Blog generation with AI on your device: automatically create blog
            posts from your travel photos.
          </li>
          <li>
            Blog drafts: save and manage multiple blog drafts locally on your
            device.
          </li>
          <li>
            PDF export: export any blog as a polished PDF to share however you
            choose.
          </li>
          <li>
            QR code sharing: generate a QR code for any blog to share it in
            person with another Bloggo user.
          </li>
        </ul>

        <h2>3. Guest Users and Registered Accounts</h2>
        <p>
          Bloggo can be used with or without a registered account. The App Store
          4+ rating applies to the app overall; account registration is reserved
          for users who meet the age requirement in Section 4.
        </p>
        <ul>
          <li>
            Guest Users: Guests may create and export one (1) blog. Guest data
            is stored locally on the device and is not associated with any
            account.
          </li>
          <li>
            Registered Users: Creating a Bloggo account allows you to save and
            manage unlimited blog drafts and export as many blogs as you like.
            Registered accounts require a valid email address and that you are
            at least 13 years old (or the applicable age of digital consent in
            your jurisdiction, if higher).
          </li>
        </ul>
        <p>
          Account creation takes only a moment. Registered users enjoy the full
          Bloggo experience with no content restrictions.
        </p>

        <h2>4. User Accounts</h2>
        <p>
          If you create an account, you are responsible for maintaining the
          confidentiality of your account credentials and for all activities
          that occur under your account. Please notify us immediately of any
          unauthorized use.
        </p>
        <p>
          Eligibility. You must be at least 13 years of age to create a Bloggo
          account, or the minimum age required in your country or region for you
          to agree to our processing of your personal data without parental
          consent, whichever is greater. By registering, you represent and
          warrant that you satisfy this requirement. If you do not, you must not
          create an account and may use Bloggo only as a guest.
        </p>
        <ul>
          <li>
            Users under the applicable minimum age may use Bloggo without an
            account only, subject to guest limits described elsewhere in these
            Terms.
          </li>
          <li>Only one account may be created per email address.</li>
          <li>
            You must provide accurate and complete information during
            registration.
          </li>
          <li>
            You are responsible for all content created or exported from your
            account.
          </li>
        </ul>

        <h2>5. Sharing Features</h2>
        <p>
          Bloggo supports two sharing methods, both of which are entirely
          initiated by you:
        </p>
        <ul>
          <li>
            PDF Export: You may export any blog as a PDF and share it through
            any channel available on your device. Once the PDF leaves your
            device, it is subject to the terms of whatever platform you use to
            transmit it.
          </li>
          <li>
            QR Code Sharing: You may generate a QR code for a blog to share it
            in person with another Bloggo user. QR code sharing is intended for
            direct, local sharing and does not publish your blog to the internet
            or create a public link.
          </li>
        </ul>
        <p>
          Bloggo does not publish your blogs to a public website or make them
          accessible via a web URL. You remain in full control of your content
          and how it is shared.
        </p>

        <h2>6. Content Policy</h2>
        <p>
          You retain full ownership of the content you create in Bloggo. Your
          blogs and photos are stored locally on your device and are never
          uploaded to our servers as part of normal app operation.
        </p>
        <p>
          Regardless of how content is shared or exported, you agree not to
          create or distribute content that:
        </p>
        <ul>
          <li>Is illegal, harmful, or violates the rights of others.</li>
          <li>
            Contains spam, malware, or deliberately deceptive information.
          </li>
          <li>Infringes on intellectual property or privacy rights.</li>
          <li>Harasses, threatens, or intimidates any individual.</li>
          <li>
            Contains adult content or material inappropriate for general
            audiences.
          </li>
          <li>
            Includes photos or identifying information of individuals without
            their consent, particularly minors.
          </li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          Bloggo and its original content, features, and functionality are owned
          by LinkedSpaces LLC and are protected by applicable copyright,
          trademark, and other intellectual property laws. You may not
          reproduce, modify, or distribute any part of the Bloggo app or its
          interface without our express written permission.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may terminate or suspend your account at our sole discretion,
          without prior notice, for conduct that we believe violates these Terms
          or is harmful to other users, us, or third parties. Because your blog
          content is stored locally on your device, termination of your account
          does not affect locally saved content on your device.
        </p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>
          Bloggo is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, express or implied. We do not warrant
          that the service will be uninterrupted, free of errors, or free from
          bugs or other issues. We are not responsible for any loss of locally
          stored content resulting from device failure, operating system
          changes, or deletion that you initiate.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, LinkedSpaces LLC,
          the Bloggo app, and our affiliates shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of or inability to use the service, including
          any loss of locally stored content or exported files.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the State of California,
          without regard to its conflict of law provisions.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these Terms of Service, please contact us at{" "}
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
