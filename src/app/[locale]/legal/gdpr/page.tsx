"use client";

import LegalLayout from "@/components/layouts/LegalLayout";
import { useTranslations } from "@/hooks/useTranslations";

export default function GDPRPage() {
  const { t } = useTranslations();

  return (
    <LegalLayout title={t("footer.gdpr")} lastUpdated="March 18, 2025">
      <h2>1. Introduction</h2>
      <p>
        At OlleMi, we are committed to protecting your personal data and
        complying with the General Data Protection Regulation (GDPR). This GDPR
        compliance statement explains how we process personal data in accordance
        with GDPR principles and outlines your rights under this regulation.
      </p>

      <h2>2. Data Controller</h2>
      <p>
        OlleMi is the data controller for personal data collected through our
        website, mobile application, and services. This means we determine the
        purposes and means of processing your personal data.
      </p>
      <p>Our contact details are:</p>
      <p>
        OlleMi
        <br />
        123 Beauty Street
        <br />
        75001 Paris, France
        <br />
        Email: privacy@ollemi.com
      </p>

      <h2>3. Data Protection Officer</h2>
      <p>
        We have appointed a Data Protection Officer (DPO) who is responsible for
        overseeing questions in relation to this GDPR statement and our privacy
        practices. If you have any questions about this statement or how we
        handle your personal data, please contact our DPO at:
      </p>
      <p>
        Email: dpo@ollemi.com
        <br />
        Address: 123 Beauty Street, 75001 Paris, France
      </p>

      <h2>4. GDPR Principles</h2>
      <p>
        We adhere to the principles set out in the GDPR, which require that
        personal data be:
      </p>
      <ul>
        <li>Processed lawfully, fairly, and transparently</li>
        <li>Collected for specified, explicit, and legitimate purposes</li>
        <li>Adequate, relevant, and limited to what is necessary</li>
        <li>Accurate and kept up to date</li>
        <li>Kept for no longer than necessary</li>
        <li>
          Processed securely and protected against unauthorized or unlawful
          processing, accidental loss, destruction, or damage
        </li>
      </ul>

      <h2>5. Lawful Basis for Processing</h2>
      <p>We process personal data on the following lawful bases:</p>
      <ul>
        <li>
          <strong>Consent:</strong> Where you have given clear consent for us to
          process your personal data for a specific purpose.
        </li>
        <li>
          <strong>Contract:</strong> Where processing is necessary for the
          performance of a contract with you or to take steps at your request
          before entering into a contract.
        </li>
        <li>
          <strong>Legal Obligation:</strong> Where processing is necessary for
          compliance with a legal obligation.
        </li>
        <li>
          <strong>Legitimate Interests:</strong> Where processing is necessary
          for our legitimate interests or the legitimate interests of a third
          party, except where such interests are overridden by your interests or
          fundamental rights and freedoms.
        </li>
      </ul>

      <h2>6. Your Rights Under GDPR</h2>
      <p>Under the GDPR, you have the following rights:</p>
      <ul>
        <li>
          <strong>Right to be informed:</strong> You have the right to be
          informed about the collection and use of your personal data.
        </li>
        <li>
          <strong>Right of access:</strong> You have the right to request a copy
          of the personal data we hold about you.
        </li>
        <li>
          <strong>Right to rectification:</strong> You have the right to request
          that we correct any inaccurate or incomplete personal data we hold
          about you.
        </li>
        <li>
          <strong>Right to erasure (right to be forgotten):</strong> You have
          the right to request that we delete your personal data in certain
          circumstances.
        </li>
        <li>
          <strong>Right to restrict processing:</strong> You have the right to
          request that we restrict the processing of your personal data in
          certain circumstances.
        </li>
        <li>
          <strong>Right to data portability:</strong> You have the right to
          request that we transfer your personal data to you or to a third party
          in a structured, commonly used, machine-readable format.
        </li>
        <li>
          <strong>Right to object:</strong> You have the right to object to the
          processing of your personal data in certain circumstances, including
          processing for direct marketing.
        </li>
        <li>
          <strong>
            Rights related to automated decision-making and profiling:
          </strong>{" "}
          You have the right not to be subject to a decision based solely on
          automated processing, including profiling, which produces legal
          effects concerning you or similarly significantly affects you.
        </li>
      </ul>

      <h2>7. How to Exercise Your Rights</h2>
      <p>
        To exercise any of these rights, please contact our Data Protection
        Officer using the contact details provided above. We will respond to
        your request within one month. There is no fee for making a request, but
        we may charge a reasonable fee or refuse to act on the request if it is
        manifestly unfounded or excessive.
      </p>

      <h2>8. Data Breach Notification</h2>
      <p>
        In the event of a personal data breach that is likely to result in a
        risk to your rights and freedoms, we will notify the relevant
        supervisory authority without undue delay and, where feasible, within 72
        hours after becoming aware of the breach. If the breach is likely to
        result in a high risk to your rights and freedoms, we will also notify
        you directly.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        We may transfer your personal data to countries outside the European
        Economic Area (EEA). When we do so, we ensure that appropriate
        safeguards are in place to protect your data, such as Standard
        Contractual Clauses approved by the European Commission or other
        appropriate safeguards as required by the GDPR.
      </p>

      <h2>10. Data Retention</h2>
      <p>
        We will only retain your personal data for as long as necessary to
        fulfill the purposes we collected it for, including for the purposes of
        satisfying any legal, accounting, or reporting requirements. To
        determine the appropriate retention period for personal data, we
        consider the amount, nature, and sensitivity of the personal data, the
        potential risk of harm from unauthorized use or disclosure, the purposes
        for which we process the data, and whether we can achieve those purposes
        through other means.
      </p>

      <h2>11. Changes to This GDPR Statement</h2>
      <p>
        We may update our GDPR statement from time to time. We will notify you
        of any changes by posting the new statement on this page and updating
        the "Last updated" date. You are advised to review this statement
        periodically for any changes.
      </p>

      <h2>12. Complaints</h2>
      <p>
        If you have a complaint about our use of your personal data or response
        to your requests regarding your personal data, you have the right to
        lodge a complaint with a supervisory authority. In France, this is the
        Commission Nationale de l'Informatique et des Libertés (CNIL).
      </p>
    </LegalLayout>
  );
}
