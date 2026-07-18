import type { Metadata } from "next"
import { LegalPageShell } from "@/components/shared/legal-page-shell"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms that govern your use of CORE IT's websites, products, and services.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="July 7, 2026">
      <section>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of Core IT&apos;s websites, products, and services (the
          &quot;Services&quot;), including any software, dashboards, or
          client portals we make available to you. By creating an account or
          otherwise using the Services, you agree to be bound by these Terms.
        </p>
      </section>

      <section>
        <h2>1. Who we are</h2>
        <p>
          Core IT is a software development agency that designs, builds, and
          maintains digital products for our clients, and also operates our
          own software products. References to &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot; refer to Core IT; references to
          &quot;you&quot; refer to the individual or organization using the
          Services.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <p>
          You&apos;re responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You must provide accurate information when creating an
          account and keep it up to date. Notify us promptly if you suspect
          any unauthorized use of your account.
        </p>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <p>You agree not to use the Services to:</p>
        <ul>
          <li>Violate any applicable law or regulation.</li>
          <li>Infringe on the intellectual property rights of others.</li>
          <li>
            Upload malicious code, attempt to gain unauthorized access to our
            systems, or interfere with the normal operation of the Services.
          </li>
          <li>Harass, abuse, or harm another person or organization.</li>
        </ul>
      </section>

      <section>
        <h2>4. Client work and deliverables</h2>
        <p>
          Where Core IT is engaged to design, develop, or otherwise deliver a
          product or service for a client under a separate written agreement
          or statement of work, the terms of that agreement govern the scope,
          deliverables, payment, and intellectual property ownership for that
          engagement. These Terms apply to your general use of our websites
          and any self-service software products we offer in addition to,
          and not in place of, any such agreement.
        </p>
      </section>

      <section>
        <h2>5. Intellectual property</h2>
        <p>
          Unless otherwise agreed in writing, all rights, title, and interest
          in the Services — including our software, branding, and content —
          remain the property of Core IT or our licensors. You may not copy,
          modify, distribute, or reverse-engineer any part of the Services
          except as expressly permitted.
        </p>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          We may suspend or terminate your access to the Services at any time
          if we believe you&apos;ve violated these Terms. You may stop using
          the Services, or request deletion of your account, at any time.
        </p>
      </section>

      <section>
        <h2>7. Disclaimers and limitation of liability</h2>
        <p>
          The Services are provided &quot;as is&quot; without warranties of
          any kind, express or implied. To the maximum extent permitted by
          law, Core IT will not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Services.
        </p>
      </section>

      <section>
        <h2>8. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material
          changes, we&apos;ll notify you by posting the updated Terms with a
          new &quot;Last updated&quot; date. Continued use of the Services
          after changes take effect constitutes acceptance of the revised
          Terms.
        </p>
      </section>

      <section>
        <h2>9. Contact us</h2>
        <p>
          If you have any questions about these Terms, contact us at{" "}
          <a
            href="mailto:legal@coreitbd.com"
            className="underline underline-offset-4"
          >
            legal@coreitbd.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}
