"use client";

import React from "react";

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
    </svg>
  );
}

import Link from "next/link";

type SmartLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean; // 강제로 외부 처리하고 싶을 때
};

export function SmartLink({
  href,
  children,
  className = "",
  external,
}: SmartLinkProps) {
  const isMail = href.startsWith("mailto:");
  const isHttp = /^https?:\/\//i.test(href);
  const isExternal = external ?? isMail ?? isHttp;

  const baseClass =
    "font-semibold text-black/80 underline underline-offset-4 hover:text-black " +
    "focus:outline-none focus:ring-2 focus:ring-blue-400/40 rounded-sm";

  // 외부/메일 링크
  if (isExternal) {
    return (
      <a
        href={href}
        className={[baseClass, className].join(" ")}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noopener noreferrer"}
      >
        {children}
      </a>
    );
  }

  // 내부 라우트
  return (
    <Link href={href} className={[baseClass, className].join(" ")}>
      {children}
    </Link>
  );
}

export function buildMailto(
  email: string,
  opts?: { subject?: string; body?: string },
) {
  const params = new URLSearchParams();
  if (opts?.subject) params.set("subject", opts.subject);
  if (opts?.body) params.set("body", opts.body);

  return `mailto:${email}${params.toString() ? `?${params.toString()}` : ""}`;
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={["my-6 border-t border-black/20", className].join(" ")} />
  );
}

function Section({
  number,
  title,
  children,
}: {
  number?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[36px] font-extrabold tracking-[-0.02em] text-black/85">
        {typeof number === "number" ? `${number}. ` : ""}
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[16px] leading-7 text-black/70">{children}</p>;
}

function BulletList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-[16px] leading-7 text-black/80">
      {children}
    </ul>
  );
}

function NumberedList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal space-y-2 pl-6 text-[16px] leading-7 text-black/80">
      {children}
    </ol>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <p className="text-[16px] leading-7 text-black/75">
        <span className="font-semibold italic text-black/80">Important:</span>{" "}
        <span className="italic">{children}</span>
      </p>
    </div>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-1 text-[18px] font-bold tracking-[-0.01em] text-black/80">
      {children}
    </h3>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="relative bg-white">
      <button
        type="button"
        className={[
          "fixed right-6 top-1/2 z-50 -translate-y-1/2",
          "inline-flex h-12 w-12 items-center justify-center rounded-full",
          "border border-black/10 bg-white shadow-md",
          "hover:bg-black/[0.02] active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
        ].join(" ")}
        aria-label="Feedback"
        onClick={() => console.log("feedback")}
      >
        <ChatIcon className="h-6 w-6 text-black/70" />
      </button>

      <div className="mx-auto max-w-[1080px] px-6 py-14">
        <h1 className="text-[44px] font-extrabold tracking-[-0.02em] text-black/75">
          Information <span className="text-black/60">We Collect</span>
        </h1>

        <Section number={1} title="Photo Library Access">
          <P>
            We access your photo library to provide our core services.
            Specifically, we access:
          </P>

          <BulletList>
            <li>
              <span className="font-semibold text-black/80">
                Photo Metadata:
              </span>{" "}
              Creation date, location data (if available in photo EXIF data),
              file size, and file format
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Photo Content:
              </span>{" "}
              Only when you explicitly choose to share or upload a photo to our
              servers
            </li>
          </BulletList>

          <Callout>
            We do NOT automatically upload your photos to the cloud. All photo
            analysis and organization happens locally on your device unless you
            explicitly choose to share photos.
          </Callout>
        </Section>

        <Section number={2} title="Location Information">
          <P>We collect location information in the following ways:</P>

          <P>
            <span className="font-semibold text-black/80">
              Device Location:
            </span>{" "}
            When you enable location services, we collect your current location
            to:
          </P>

          <BulletList>
            <li>Organize your photos by location</li>
            <li>Suggest place names for your photos</li>
            <li>Create personalized travel recaps</li>
            <li>Show location-based features and nearby events</li>
          </BulletList>

          <P>
            <span className="font-semibold text-black/80">
              Photo Location Data:
            </span>{" "}
            We access location data embedded in your photos (EXIF data) to
            organize them geographically.
          </P>
        </Section>

        <Section number={3} title="Account Information">
          <P>When you create an account, we collect:</P>
          <BulletList>
            <li>Email address (if provided)</li>
            <li>Profile information you choose to provide</li>
            <li>Authentication tokens for account security</li>
          </BulletList>
        </Section>

        <Section number={4} title="Usage Data">
          <P>
            We may collect information about how you use the App, including:
          </P>
          <BulletList>
            <li>Features you use</li>
            <li>Interactions with the App</li>
            <li>Diagnostic and performance data</li>
          </BulletList>
        </Section>

        {/* Usage 아래: 기존 선과 동일한 스타일이되 조금 더 진하게 */}
        <Divider className="mt-10" />

        <Section title="How We Use Your Information">
          <P>We use the information we collect to:</P>

          <NumberedList>
            <li>
              <span className="font-semibold text-black/80">
                Organize Your Photos:
              </span>{" "}
              Group photos by location and date to create organized memories
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Identify Trips:
              </span>{" "}
              Analyze photo metadata to identify travel patterns and suggest
              trip groupings
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Create Travel Recaps:
              </span>{" "}
              Generate personalized blog posts and summaries of your trips
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Provide Location Services:
              </span>{" "}
              Show nearby events and location-based features
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Improve Our Services:
              </span>{" "}
              Analyze usage patterns to enhance app functionality
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Customer Support:
              </span>{" "}
              Respond to your inquiries and provide assistance
            </li>
          </NumberedList>
        </Section>

        <Divider />

        <Section title="Data Storage and Processing">
          <Subheading>Local Processing</Subheading>
          <BulletList>
            <li>
              All photo analysis and organization happen locally on your device.
            </li>
            <li>
              We do not upload your photos to our servers unless you explicitly
              choose to share them.
            </li>
          </BulletList>

          <Subheading>Cloud Storage</Subheading>
          <P>Photos are only uploaded to our cloud servers when you:</P>
          <BulletList>
            <li>Explicitly choose to share a photo</li>
            <li>Create a travel recap that includes photos</li>
            <li>Upload photos as part of sharing features</li>
          </BulletList>

          <Subheading>Data Retention</Subheading>
          <BulletList>
            <li>
              <span className="font-semibold text-black/80">Local Data:</span>{" "}
              Stored on your device until you delete the App or clear its data
            </li>
            <li>
              <span className="font-semibold text-black/80">Cloud Data:</span>{" "}
              Retained as long as your account is active or as needed to provide
              our services
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Account Deletion:
              </span>{" "}
              You can request deletion of your account and associated data at
              any time
            </li>
          </BulletList>
        </Section>

        {/*Data Sharing and Disclosure 위에 선 */}
        <Divider />

        <Section title="Data Sharing and Disclosure">
          <P>
            We do NOT sell, trade, or rent your personal information to third
            parties. We may share information only in the following
            circumstances:
          </P>
          <BulletList>
            <li>
              <span className="font-semibold text-black/80">
                With Your Consent:
              </span>{" "}
              When you explicitly choose to share content
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Service Providers:
              </span>{" "}
              With trusted third-party providers who assist in operating our App
              (e.g., cloud storage, analytics)
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Legal Requirements:
              </span>{" "}
              When required by law or to protect our rights
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Business Transfers:
              </span>{" "}
              In connection with a merger, acquisition, or sale of assets
            </li>
          </BulletList>
        </Section>

        {/* ✅ Your Privacy Rights 위에 선 */}
        <Divider />

        <Section title="Your Privacy Rights">
          <Subheading>GDPR Rights (European Users)</Subheading>
          <BulletList>
            <li>
              <span className="font-semibold text-black/80">
                Right to Access:
              </span>{" "}
              Request a copy of your personal data
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Rectification:
              </span>{" "}
              Request correction of inaccurate data
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Erasure:
              </span>{" "}
              Request deletion of your data
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Restrict Processing:
              </span>{" "}
              Limit how your data is used
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Data Portability:
              </span>{" "}
              Request a copy in a machine-readable format
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Object:
              </span>{" "}
              Object to certain types of data processing
            </li>
          </BulletList>

          <Subheading>CCPA Rights (California Users)</Subheading>
          <BulletList>
            <li>
              <span className="font-semibold text-black/80">
                Right to Know:
              </span>{" "}
              Understand what personal data is collected
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Delete:
              </span>{" "}
              Request deletion of your personal data
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Right to Opt-Out:
              </span>{" "}
              Decline sale of your personal data (we do not sell your data)
            </li>
            <li>
              <span className="font-semibold text-black/80">
                Non-Discrimination:
              </span>{" "}
              We will not discriminate against users exercising their rights
            </li>
          </BulletList>

          <Subheading>How to Exercise Your Rights</Subheading>
          <P>
            To exercise any of these rights, contact us at:{" "}
            <span className="font-semibold text-black/80">
              contact@linkedspaces.com
            </span>
          </P>
        </Section>

        {/* ✅ Children's Privacy 위에 선 */}
        <Divider />

        <Section title="Children’s Privacy">
          <BulletList>
            <li>Our App is not intended for children under 13 years of age.</li>
            <li>
              We do not knowingly collect personal information from children
              under 13.
            </li>
            <li>
              If you believe we have collected such information, please contact
              us immediately.
            </li>
          </BulletList>
        </Section>

        <Divider />

        <Section title="Security">
          <P>
            We implement technical and organizational measures to protect your
            information:
          </P>
          <BulletList>
            <li>Encryption of data in transit</li>
            <li>Secure authentication methods</li>
            <li>Regular security assessments</li>
            <li>Local-first architecture for sensitive data</li>
          </BulletList>
          <P>
            However, no method of electronic transmission or storage is 100%
            secure.
          </P>
        </Section>

        <Divider />

        <Section title="Third-Party Services">
          <BulletList>
            <li>
              Our App may contain links to third-party websites or services.
            </li>
            <li>
              We are not responsible for their privacy practices and encourage
              you to review their privacy policies.
            </li>
          </BulletList>
        </Section>

        <Divider />

        <Section title="International Data Transfers">
          <P>
            Your data may be transferred to and processed in countries other
            than your own. We ensure adequate safeguards are in place for such
            transfers.
          </P>
        </Section>

        <Divider />

        <Section title="Changes to This Privacy Policy">
          <P>
            We may update this Privacy Policy from time to time. You will be
            notified by:
          </P>
          <BulletList>
            <li>A new Privacy Policy posted in the App</li>
            <li>An updated “Last Updated” date</li>
            <li>A consent prompt if significant changes occur</li>
          </BulletList>
        </Section>

        <Divider />

        <Section title="Contact Us">
          <P>If you have any questions, contact us at:</P>
          <BulletList>
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-black/80">Email:</span>
              <SmartLink
                href={buildMailto("contact@linkedspaces.com", {
                  subject: "LinkedSpaces Support",
                })}
              >
                contact@linkedspaces.com
              </SmartLink>
            </li>

            <li className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-black/80">Website:</span>
              <SmartLink href="https://linkedspaces.com/">
                linkedspaces.com
              </SmartLink>
            </li>
          </BulletList>
        </Section>

        <Divider />

        <Section title="Consent">
          <P>
            By using our App, you consent to the collection and use of
            information in accordance with this Privacy Policy. If you do not
            agree with these terms, please do not use the App.
          </P>
        </Section>
      </div>
    </main>
  );
}
