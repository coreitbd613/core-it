import type { Metadata } from "next"
import { LegalPageShell } from "@/components/shared/legal-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how CORE IT collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="July 7, 2026">
      <section>
        <p>
          This Privacy Policy explains how Core IT (&quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
          information when you use our websites, products, and services (the
          &quot;Services&quot;).
        </p>
      </section>

      <section>
        <h2>1. Information we collect</h2>
        <p>We collect information you provide directly to us, such as:</p>
        <ul>
          <li>
            Account information — name, email address, and password (stored
            as a secure hash, never in plain text) when you sign up.
          </li>
          <li>
            Profile and account details you add after signing in.
          </li>
          <li>
            Communications you send us, such as support requests or inquiries.
          </li>
        </ul>
        <p>We also collect some information automatically, including:</p>
        <ul>
          <li>
            Usage data — pages visited, actions taken, and general analytics
            events, collected via Google Tag Manager and related analytics
            tools.
          </li>
          <li>
            Device and log data — IP address, browser type, and similar
            technical information.
          </li>
          <li>Cookies used to keep you signed in and remember preferences.</li>
        </ul>
      </section>

      <section>
        <h2>2. Signing in with Google</h2>
        <p>
          If you choose to sign in with Google, we receive basic profile
          information from Google (such as your name and email address) to
          create and authenticate your account. We don&apos;t receive your
          Google password, and you can review or revoke this access at any
          time from your Google account settings.
        </p>
      </section>

      <section>
        <h2>3. How we use your information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Services.</li>
          <li>Authenticate you and keep your account secure.</li>
          <li>
            Understand how the Services are used, through analytics, so we
            can improve them.
          </li>
          <li>Communicate with you about your account or our Services.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cookies and tracking</h2>
        <p>
          We use cookies and similar technologies for authentication (keeping
          you signed in) and analytics (understanding how visitors use our
          site, via tools such as Google Tag Manager). You can control
          cookies through your browser settings, though disabling them may
          affect parts of the Services that require you to be signed in.
        </p>
      </section>

      <section>
        <h2>5. How we share information</h2>
        <p>
          We don&apos;t sell your personal information. We may share it
          with:
        </p>
        <ul>
          <li>
            Service providers who help us operate the Services (e.g.
            hosting, analytics, email delivery), under obligations to
            protect your data.
          </li>
          <li>Authorities, where required by law or to protect our rights.</li>
          <li>
            Another party in connection with a merger, acquisition, or sale
            of assets, subject to this Policy.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We retain your information for as long as your account is active
          or as needed to provide the Services, comply with our legal
          obligations, resolve disputes, and enforce our agreements.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access,
          correct, or delete your personal information, or to object to or
          restrict certain processing. To exercise these rights, contact us
          using the details below.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use reasonable technical and organizational measures to protect
          your information, including encrypted storage of credentials and
          secure transmission over HTTPS. No method of transmission or
          storage is 100% secure, and we can&apos;t guarantee absolute
          security.
        </p>
      </section>

      <section>
        <h2>9. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we&apos;ll notify you by posting the updated
          Policy with a new &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2>10. Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we
          handle your information, contact us at{" "}
          <a
            href="mailto:privacy@coreitbd.com"
            className="underline underline-offset-4"
          >
            privacy@coreitbd.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}
