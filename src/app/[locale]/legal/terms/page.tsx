"use client";

import LegalLayout from "@/components/layouts/LegalLayout";
import { useTranslations } from "@/hooks/useTranslations";

export default function TermsOfServicePage() {
  const { t } = useTranslations();

  return (
    <LegalLayout
      title={t("footer.termsOfService")}
      lastUpdated="March 18, 2025"
    >
      <h2>1. Introduction</h2>
      <p>
        Welcome to OlleMi. These Terms of Service govern your use of our
        website, mobile application, and services. By accessing or using OlleMi,
        you agree to be bound by these Terms. If you disagree with any part of
        the terms, you may not access our services.
      </p>

      <h2>2. Definitions</h2>
      <p>
        <strong>"Service"</strong> refers to the OlleMi platform, including our
        website, mobile application, and all related services.
        <br />
        <strong>"User"</strong> refers to individuals who register for and use
        our Service.
        <br />
        <strong>"Professional"</strong> refers to beauty professionals who
        register to offer their services through our platform.
        <br />
        <strong>"Client"</strong> refers to individuals who book appointments
        with Professionals through our platform.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To use certain features of our Service, you must register for an
        account. You agree to provide accurate, current, and complete
        information during the registration process and to update such
        information to keep it accurate, current, and complete.
      </p>
      <p>
        You are responsible for safeguarding the password that you use to access
        the Service and for any activities or actions under your password. We
        encourage you to use "strong" passwords (passwords that use a
        combination of upper and lower case letters, numbers, and symbols) with
        your account.
      </p>

      <h2>4. User Conduct</h2>
      <p>You agree not to use the Service:</p>
      <ul>
        <li>
          In any way that violates any applicable national or international law
          or regulation.
        </li>
        <li>
          To transmit, or procure the sending of, any advertising or promotional
          material, including any "junk mail", "chain letter," "spam," or any
          other similar solicitation.
        </li>
        <li>
          To impersonate or attempt to impersonate OlleMi, an OlleMi employee,
          another user, or any other person or entity.
        </li>
        <li>
          To engage in any other conduct that restricts or inhibits anyone's use
          or enjoyment of the Service, or which, as determined by us, may harm
          OlleMi or users of the Service or expose them to liability.
        </li>
      </ul>

      <h2>5. Booking and Cancellation</h2>
      <p>
        Clients may book appointments with Professionals through our platform.
        Cancellation policies are set by individual Professionals and will be
        clearly displayed before booking. Clients agree to abide by these
        cancellation policies.
      </p>

      <h2>6. Payments</h2>
      <p>
        Payments for services booked through our platform are processed
        securely. OlleMi charges Professionals a commission fee for bookings
        made through our platform. All payment terms will be clearly displayed
        before any transaction is completed.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are
        and will remain the exclusive property of OlleMi and its licensors. The
        Service is protected by copyright, trademark, and other laws of both
        France and foreign countries.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may terminate or suspend your account immediately, without prior
        notice or liability, for any reason whatsoever, including without
        limitation if you breach the Terms.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        In no event shall OlleMi, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from your access to or use of or inability
        to access or use the Service.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. If a revision is material we will try to provide at
        least 30 days' notice prior to any new terms taking effect. What
        constitutes a material change will be determined at our sole discretion.
      </p>

      <h2>11. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at:</p>
      <p>
        Email: legal@ollemi.com
        <br />
        Address: 123 Beauty Street, 75001 Paris, France
      </p>
    </LegalLayout>
  );
}
