"use client";

import LegalLayout from "@/components/layouts/LegalLayout";
import { useTranslations } from "@/hooks/useTranslations";

export default function PrivacyPolicyPage() {
  const { t } = useTranslations();

  return (
    <LegalLayout title={t("footer.privacyPolicy")} lastUpdated="March 18, 2025">
      <h2>1. Introduction</h2>
      <p>
        At OlleMi, we respect your privacy and are committed to protecting your
        personal data. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you use our website,
        mobile application, and services.
      </p>
      <p>
        Please read this Privacy Policy carefully. If you do not agree with the
        terms of this Privacy Policy, please do not access our services.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Personal Data</h3>
      <p>
        We may collect personal information that you voluntarily provide to us
        when you register for an account, express interest in obtaining
        information about us or our products and services, or otherwise contact
        us. The personal information we collect may include:
      </p>
      <ul>
        <li>Name, email address, phone number, and other contact details</li>
        <li>Login credentials</li>
        <li>
          Profile information (for Professionals: services offered, pricing,
          availability, etc.)
        </li>
        <li>
          Payment information (processed securely through our payment
          processors)
        </li>
        <li>Booking history and preferences</li>
        <li>Communications with us or other users of our platform</li>
      </ul>

      <h3>2.2 Automatically Collected Data</h3>
      <p>
        When you access our services, we may automatically collect certain
        information about your device and usage, including:
      </p>
      <ul>
        <li>
          Device information (type of device, operating system, browser type)
        </li>
        <li>IP address and location data</li>
        <li>Usage data (pages visited, time spent, clicks, etc.)</li>
        <li>Cookies and similar tracking technologies</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect for various purposes, including:</p>
      <ul>
        <li>Providing, maintaining, and improving our services</li>
        <li>Processing transactions and managing bookings</li>
        <li>Creating and managing your account</li>
        <li>
          Communicating with you about our services, updates, and promotions
        </li>
        <li>Responding to your inquiries and providing customer support</li>
        <li>Analyzing usage patterns to enhance user experience</li>
        <li>Protecting our services and preventing fraud</li>
        <li>Complying with legal obligations</li>
      </ul>

      <h2>4. Sharing Your Information</h2>
      <p>We may share your information in the following situations:</p>
      <ul>
        <li>
          <strong>Between Users:</strong> When a Client books an appointment
          with a Professional, necessary information is shared to facilitate the
          service.
        </li>
        <li>
          <strong>Service Providers:</strong> We may share your information with
          third-party vendors, service providers, and other business partners
          who perform services on our behalf.
        </li>
        <li>
          <strong>Business Transfers:</strong> If we are involved in a merger,
          acquisition, or sale of all or a portion of our assets, your
          information may be transferred as part of that transaction.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose your information
          if required to do so by law or in response to valid requests by public
          authorities.
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect the security of your personal information. However, please be
        aware that no method of transmission over the internet or electronic
        storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>6. Your Data Protection Rights</h2>
      <p>
        Depending on your location, you may have certain rights regarding your
        personal information, including:
      </p>
      <ul>
        <li>The right to access your personal data</li>
        <li>The right to rectify inaccurate or incomplete data</li>
        <li>The right to erasure (the "right to be forgotten")</li>
        <li>The right to restrict processing</li>
        <li>The right to data portability</li>
        <li>The right to object to processing</li>
        <li>Rights related to automated decision-making and profiling</li>
      </ul>
      <p>
        To exercise these rights, please contact us using the information
        provided in the "Contact Us" section.
      </p>

      <h2>7. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar tracking technologies to collect and store
        information about your interactions with our services. You can set your
        browser to refuse all or some browser cookies, or to alert you when
        cookies are being sent. However, some parts of our services may not
        function properly without cookies.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under the age of 18. We do
        not knowingly collect personal information from children. If you are a
        parent or guardian and believe your child has provided us with personal
        information, please contact us.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to, and maintained on, computers
        located outside of your state, province, country, or other governmental
        jurisdiction where the data protection laws may differ from those in
        your jurisdiction. If you are located outside France and choose to
        provide information to us, please note that we transfer the data to
        France and process it there.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the "Last updated" date. You are advised to review this Privacy
        Policy periodically for any changes.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at:
      </p>
      <p>
        Email: privacy@ollemi.com
        <br />
        Address: 123 Beauty Street, 75001 Paris, France
      </p>
    </LegalLayout>
  );
}
