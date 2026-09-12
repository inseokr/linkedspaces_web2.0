import type { Metadata } from "next";
import Container from "@/bloggo/components/ui/Container";
import Badge from "@/bloggo/components/ui/Badge";
import { getLegalDocLastUpdated } from "@/bloggo/lib/legalDocLastUpdated";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Bloggo Privacy Policy — how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
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
        <h2>1. Overview</h2>
        <p>
          Bloggo is a travel journaling app operated by LinkedSpaces LLC. By
          default, your blogs and photos are created and kept on your device.
          Some information is processed on our servers so we can operate your
          account and, when you choose to publish a blog, host it for people you
          share the link with. This policy explains what we collect, what stays
          on your device, and what happens when you publish.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          Account information you provide, such as when you create an account or
          contact support: your username, name where applicable, and email
          address. If you sign in with Apple or Google, we receive the account
          identifier and email that sign-in method returns.
        </p>
        <p>
          Technical and usage data to operate and improve the app: an anonymous
          identifier stored on your device, app version, timezone, session
          information, and contextual fields such as feature or screen names.
          Analytics events never include the text of your blogs, your search
          queries, or the contents of your photo library. Crash or diagnostic
          data may be included depending on your device settings.
        </p>
        <p>
          Content you choose to publish to the cloud, described in Section 5.
        </p>
        <p>
          Your device&apos;s push notification token, if you enable
          notifications, so we can deliver reminders and notices.
        </p>

        <h2>3. What Stays on Your Device</h2>
        <p>
          Your blogs, drafts, and the photos you add to them are stored and
          processed on your device. In-app camera captures—including optional
          short Reel clips and Vibe audio—are also stored locally with your
          blog. Content you do not publish is not uploaded to our servers.
        </p>
        <ul>
          <li>
            All AI features run entirely on your device using Apple&apos;s
            built-in frameworks: blog and caption generation, photo image tags,
            Travel DNA, Blog Highlights, Smart Search, and the place-guessing
            game. Your photos and text are not sent to us or to any third-party
            AI service for this processing.
          </li>
          <li>
            EXIF metadata embedded in your photos (such as GPS coordinates and
            capture time) may be read on your device to build your blog. This
            metadata is included with photos in blogs you choose to publish
            (Section 5).
          </li>
        </ul>

        <h2>4. Smart Photo Cleanup</h2>
        <p>
          Smart Cleanup reads your photo library and analyzes photos on your
          device to suggest duplicates and low-quality shots. This analysis
          stays on your device and is not uploaded.
        </p>
        <p>
          If you confirm a cleanup, the app asks iOS to delete the selected
          photos from your system photo library through the standard iOS delete
          confirmation. Deleted photos move to your &quot;Recently Deleted&quot;
          album per iOS behavior. We do not receive, copy, or store the photos
          you delete this way.
        </p>

        <h2>5. Publishing a Blog to the Cloud</h2>
        <p>
          Publishing is optional and started by you. When you publish a blog, we
          upload and store on our servers (including cloud storage and
          content-delivery providers we use to operate the service):
        </p>
        <ul>
          <li>
            The photos you included in that blog, and, if selected, in-app
            camera captures used as cover or content.
          </li>
          <li>
            Text you wrote or generated: the blog title, place names, notes, and
            day and trip narratives and captions.
          </li>
          <li>
            Metadata about the included photos and places: GPS coordinates,
            capture time and timezone, place categories and addresses, and photo
            quality scores.
          </li>
          <li>
            A trip highlights summary. Step and distance totals derived from
            Apple Health are included only if you turn on Include my step
            activity when publishing. See Section 7.
          </li>
        </ul>
        <p>
          Published photos are stored in private cloud storage and are served
          only through short-lived signed links. A published blog is hosted on
          our servers and can be viewed by anyone who has its link. The link
          contains an encrypted token, is not listed in any public directory,
          and is not indexed by us for search—but it is not password-protected.
          Share it only with people you want to have access. People you share it
          with can view the blog without a Bloggo account.
        </p>
        <p>
          Depending on your plan, you may be limited to one live published blog
          at a time and to a storage limit. Publishing again may replace your
          existing published blog and delete its photos from our servers. Your
          plan status and storage usage are stored on our servers.
        </p>
        <p>
          You can unpublish a blog at any time from the app. When you unpublish,
          replace, or delete your account, we delete the published copy and its
          photos from our systems as described in Section 10.
        </p>

        <h2>6. Exports and Personal Backup</h2>
        <p>
          Separately from cloud publishing, you can export a blog yourself.
          These are generated on your device; once a file leaves your device,
          the service you send it through applies its own terms.
        </p>
        <ul>
          <li>
            PDF / storybook export: generated on-device and shared via Mail,
            AirDrop, Files, or other apps you choose.
          </li>
          <li>
            Video export: rendered locally; you choose whether to save to Photos
            or hand off via the share sheet.
          </li>
          <li>
            Carousel Studio and similar tooling: helps build image sets for
            TikTok, Facebook, Messages, and other apps. Once you invoke an
            external app&apos;s share flow, that app&apos;s notices apply.
          </li>
          <li>
            ZIP or comparable archive: packaged backups you save yourself, for
            example via the Files app.
          </li>
          <li>
            QR code (&quot;Share with Bloggo&quot;): encodes a handshake so a
            nearby Bloggo user can open the blog in the app. Treat the QR code
            like a link to your content.
          </li>
        </ul>

        <h2>7. Apple Health Data</h2>
        <p>
          If you turn on step tracking, Bloggo requests read-only access to step
          count, walking and running distance, and flights climbed from Apple
          Health. Bloggo never writes to Apple Health.
        </p>
        <ul>
          <li>
            This data is used on your device to show activity stats in Blog
            Highlights and Travel features.
          </li>
          <li>
            Step and distance totals for a trip&apos;s dates are included in the
            trip highlights summary that is uploaded when you publish that blog
            (Section 5) only if you turn on Include my step activity when
            publishing. Those totals are then visible to anyone you share the
            published link with. If you do not want this, leave that option off,
            or unpublish the blog.
          </li>
          <li>
            We do not use Apple Health data for advertising or marketing, and we
            do not share it with third parties except the infrastructure
            providers that store published blog content on our behalf. Apple
            Health data is never stored in iCloud by Bloggo.
          </li>
        </ul>

        <h2>8. Third-Party Services Contacted From Your Device</h2>
        <p>
          Some features send limited data directly from your device to third
          parties, each governed by its own privacy policy:
        </p>
        <ul>
          <li>
            Weather (Open-Meteo): trip coordinates and dates, to retrieve
            historical weather for your blog.
          </li>
          <li>
            Place search (Kakao): your search text and map coordinates, for
            places in regions served by Kakao.
          </li>
          <li>
            Apple services: Maps and geocoding; Siri and Shortcuts, for which a
            trip and place index is provided to Siri on your device; and Apple
            Health as described in Section 7.
          </li>
          <li>
            Apple Push Notification service, used to deliver notifications if
            you enable them.
          </li>
        </ul>

        <h2>9. How We Use Information, and Sharing</h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          the app; authenticate your account and keep it secure; host and serve
          blogs you choose to publish; send important notices, updates, and
          support communications; respond to your requests; and detect and
          prevent fraud or abuse.
        </p>
        <p>
          We do not sell, trade, or rent your personal information. We share
          data with service providers who operate our infrastructure—such as
          authentication, cloud hosting and storage, content delivery, and push
          notification delivery—who are bound by confidentiality obligations and
          act only on our instructions. We may disclose information if required
          by law or if we believe disclosure is necessary to protect our rights
          or the safety of our users.
        </p>

        <h2>10. Registered Accounts and Age</h2>
        <p>
          Bloggo requires an account. Account creation requires a valid email
          address or a supported sign-in method. Bloggo is listed on the Apple
          App Store with a 4+ age rating, which describes the app&apos;s general
          content suitability. Creating an account is separate and involves
          personal information we process on our systems.
        </p>
        <ul>
          <li>
            You must be at least 13 years old to create an account, or the
            minimum age required in your jurisdiction to consent to the
            collection of your personal information online, whichever is higher.
            By creating an account, you represent that you meet this
            requirement.
          </li>
          <li>Only one account may be created per email address.</li>
        </ul>

        <h2>11. Data Retention</h2>
        <p>
          Blogs and drafts you keep on your device live on your device; deleting
          the app removes that local data unless you exported copies yourself.
        </p>
        <p>
          Blogs you publish, and their uploaded photos and highlights, are
          stored on our servers until you unpublish them, replace them, or
          delete your account. After you unpublish or delete, we process
          deletion of that content from our systems, typically within 30 days,
          subject to legal or security retention needs.
        </p>
        <p>
          Account information such as your name and email, and your plan and
          storage records, are kept while your account is active. When signed
          in, you can delete your account at any time: open Settings, tap Delete
          Account, and confirm. We then process deletion of your account and
          your published content from our systems, typically within 30 days. You
          can also email{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>{" "}
          for help with your account or data.
        </p>

        <h2>12. Data Security</h2>
        <p>
          We implement security measures consistent with industry practice. Data
          sent between the app and our servers is encrypted in transit
          (HTTPS/TLS). Published photos are held in private storage and served
          only through short-lived signed links, and published blog links use
          encrypted tokens. No method of storage or transmission is perfectly
          secure. We encourage you to use a strong, unique password and to keep
          your device and Apple ID secure.
        </p>

        <h2>13. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct,
          export, or delete personal data we hold about you. To delete your
          account and your published content, use Delete Account in Settings
          while signed in. To unpublish a specific blog, use the unpublish
          option in the app. You can manage, export, or delete blog content
          stored on your device directly in the app at any time. For other
          requests, contact us at{" "}
          <a
            href="mailto:bloggo@linkedspaces.com"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            bloggo@linkedspaces.com
          </a>
          .
        </p>

        <h2>14. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify
          you of any material changes by posting the new policy within the app
          and, where appropriate, by sending a notification to your registered
          email address.
        </p>

        <h2>15. Contact Us</h2>
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
