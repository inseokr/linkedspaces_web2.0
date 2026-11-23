import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";
import { getLegalDocLastUpdated } from "@/bloggo/lib/legalDocLastUpdated";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Bloggo Terms of Service — the rules for using our platform.",
  alternates: { canonical: "/terms" },
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
          &quot;Terms&quot;). By downloading, accessing, or using the App, you
          agree to follow and be bound by the Terms. We may update the Terms
          from time to time. The current Terms are available within the App. We
          and our third party service providers may change features and services
          related to the App without notice.
        </p>
        <p>
          Bloggo is a travel journaling app. By default your blogs and photos
          are created and kept on your device. Some information is processed on
          our servers to operate your account, and, when you choose to publish a
          blog, to host it for people you share the link with, as described in
          the Privacy Policy and in Section 6 below.
        </p>
        <p>
          Bloggo is offered on the Apple App Store with a 4+ age rating. That
          rating describes the general suitability of the App&apos;s content.
          Registering for a Bloggo account is separate: it involves providing
          personal information and using our authentication and account
          services. You must be at least 13 years old to create an account (or
          the minimum age required in your jurisdiction for you to consent to
          our collection and use of your personal information online, if that
          age is higher). If you do not meet the age requirement, or if you do
          not agree with the Terms, do not use the App.
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
          Bloggo helps you create, edit, and share formatted blog posts from
          your travel photos. The Services include:
        </p>
        <ul>
          <li>
            On-device AI: blog and caption generation, photo tags, Travel DNA,
            Blog Highlights, Smart Search, and the place-guessing game all run
            on your device using Apple frameworks.
          </li>
          <li>
            Blog drafts: create and manage multiple drafts on your device.
          </li>
          <li>
            In-app camera: capture stills, short Reel clips, and Vibe audio and
            attach them to blog stops.
          </li>
          <li>
            Smart Photo Cleanup: on-device analysis that suggests duplicate and
            low-quality photos and, with your confirmation, deletes them from
            your system photo library through iOS&apos;s standard delete
            confirmation.
          </li>
          <li>
            Cloud publishing: optionally upload a blog to our servers and share
            it through a link, subject to Section 6.
          </li>
          <li>
            Exports and handoffs: PDF and storybook export, video export, ZIP or
            archive backup, Carousel Studio and similar social tooling, and QR
            code sharing to another Bloggo user. Once a file leaves your device,
            the receiving service&apos;s terms apply.
          </li>
        </ul>

        <h2>3. Registered Accounts</h2>
        <p>
          An account is required to use the App and to publish blogs. Accounts
          require a valid email address or a supported sign-in method, and that
          you meet the age requirement in Section 4.
        </p>
        <ul>
          <li>Only one account may be created per email address.</li>
        </ul>

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
          warrant that you satisfy this requirement. If you do not meet this
          requirement, you must not use the app.
        </p>
        <ul>
          <li>Only one account may be created per email address.</li>
          <li>
            You must provide accurate and complete information during
            registration.
          </li>
          <li>
            You are responsible for all content created, published, or exported
            from your account.
          </li>
        </ul>

        <h2>5. Sharing and Exports</h2>
        <p>
          Apart from cloud publishing (Section 6), you can share a blog yourself
          using on-device exports and handoffs—Mail, AirDrop, Files, social
          apps, or other channels your device supports. Once a file or asset
          leaves your device, its handling is governed by the service you send
          it through. Carousel Studio and similar tools compose assets for
          third-party networks such as TikTok or Facebook; publishing there is
          always through the apps you authorize. A &quot;Share with Bloggo&quot;
          QR code lets a nearby Bloggo user open the blog in the app—treat it
          like a link to your content. Stay within these Terms and applicable
          platform rules when sharing.
        </p>

        <h2>6. Cloud Publishing and Storage</h2>
        <p>
          Publishing is optional and initiated by you. When you publish a blog,
          you upload to our servers the photos, text, place and photo metadata
          (including GPS coordinates and capture times), and a trip highlights
          summary for that blog, as detailed in the Privacy Policy. Step and
          distance totals derived from Apple Health are included only if you
          turn on Include my step activity when publishing.
        </p>
        <ul>
          <li>
            A published blog is hosted on our servers and can be viewed by
            anyone who has its link, without a Bloggo account. The link uses an
            encrypted token and is not listed in a public directory, but it is
            not password-protected. You are responsible for who you share it
            with.
          </li>
          <li>
            You grant LinkedSpaces a non-exclusive, worldwide, royalty-free
            license to host, store, reproduce, and transmit the content of a
            blog you publish, solely to operate the publishing feature and serve
            that blog to people you share it with. This license ends when you
            unpublish the blog or delete your account, except for backups
            pending deletion in the ordinary course. You retain ownership of
            your content.
          </li>
          <li>
            You are responsible for having the rights to publish everything in a
            blog, including the likeness and personal information of other
            people who appear in it. Do not publish images or details of other
            people—especially minors—without their consent.
          </li>
          <li>
            Your plan may limit you to one live published blog and to a storage
            quota. Publishing again may replace your existing published blog and
            delete its photos from our servers.
          </li>
          <li>
            You can unpublish a blog at any time from the app. We may remove or
            disable access to published content that we believe violates these
            Terms, and we do not guarantee that published content or links will
            remain available.
          </li>
        </ul>

        <h2>7. Content Policy</h2>
        <p>
          You retain ownership of the content you create in Bloggo. Whether
          content stays on your device, is exported, or is published, you agree
          not to create, publish, or distribute content that:
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
        <p>
          To report content published through Bloggo that you believe violates
          these Terms, contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>
          . We review reports and may remove content or suspend accounts.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          Bloggo and its original content, features, and functionality are owned
          by LinkedSpaces LLC and are protected by applicable copyright,
          trademark, and other intellectual property laws. You may not
          reproduce, modify, or distribute any part of the Bloggo app or its
          interface without our express written permission.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend your account at our sole discretion,
          without prior notice, for conduct that we believe violates these Terms
          or is harmful to other users, us, or third parties. On termination or
          account deletion, we delete blogs you have published and their
          uploaded media from our systems as described in the Privacy Policy.
          Content stored only on your device is not affected by account
          termination.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          Bloggo is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, express or implied. We do not warrant
          that the service will be uninterrupted, free of errors, or free from
          bugs or other issues, or that published content or links will remain
          available. We are not responsible for any loss of locally stored
          content resulting from device failure, operating system changes, or
          deletion that you initiate, including deletions made through Smart
          Photo Cleanup.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, LinkedSpaces LLC,
          the Bloggo app, and our affiliates shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of or inability to use the service, including
          any loss of locally stored content, published content, or exported
          files.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the State of California,
          without regard to its conflict of law provisions.
        </p>

        <h2>13. Contact</h2>
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
