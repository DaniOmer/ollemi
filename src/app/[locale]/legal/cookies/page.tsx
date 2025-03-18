"use client";

import LegalLayout from "@/components/layouts/LegalLayout";
import { useTranslations } from "@/hooks/useTranslations";

export default function CookiePolicyPage() {
  const { t } = useTranslations();

  return (
    <LegalLayout title={t("footer.cookiesPolicy")} lastUpdated="March 18, 2025">
      <h2>1. Introduction</h2>
      <p>
        This Cookie Policy explains how OlleMi ("we", "us", or "our") uses
        cookies and similar technologies on our website and mobile application.
        This policy provides you with information about how we use cookies, what
        types of cookies we use, and how you can control them.
      </p>
      <p>
        By using our website or mobile application, you consent to the use of
        cookies in accordance with this Cookie Policy. If you do not accept the
        use of cookies, please disable them as explained below or refrain from
        using our services.
      </p>

      <h2>2. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are stored on your device (computer,
        tablet, or mobile) when you visit a website. They are widely used to
        make websites work more efficiently, provide a better user experience,
        and give website owners information about how their site is being used.
      </p>
      <p>
        Cookies are not harmful and do not contain any information that directly
        identifies you as a person. They cannot be used to spread viruses or
        access your hard drive.
      </p>

      <h2>3. Types of Cookies We Use</h2>
      <p>We use different types of cookies for various purposes:</p>

      <h3>3.1 Essential Cookies</h3>
      <p>
        These cookies are necessary for the website to function properly. They
        enable basic functions like page navigation, secure areas access, and
        enable us to recognize you when you return to our website. These cookies
        do not gather any information about you that could be used for marketing
        or remembering where you've been on the internet.
      </p>

      <h3>3.2 Functional Cookies</h3>
      <p>
        These cookies enable us to personalize your experience on our site,
        remember your preferences (such as your language or region), and provide
        enhanced features. They may be set by us or by third-party providers
        whose services we have added to our pages.
      </p>

      <h3>3.3 Analytical/Performance Cookies</h3>
      <p>
        These cookies allow us to count visits and traffic sources so we can
        measure and improve the performance of our site. They help us to know
        which pages are the most and least popular and see how visitors move
        around the site. All information these cookies collect is aggregated and
        therefore anonymous.
      </p>

      <h3>3.4 Targeting/Advertising Cookies</h3>
      <p>
        These cookies may be set through our site by our advertising partners.
        They may be used by those companies to build a profile of your interests
        and show you relevant advertisements on other sites. They do not
        directly store personal information but are based on uniquely
        identifying your browser and internet device.
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third parties on our website. These third
        parties may include:
      </p>
      <ul>
        <li>Analytics providers (such as Google Analytics)</li>
        <li>Advertising networks</li>
        <li>Social media platforms</li>
        <li>Payment processors</li>
      </ul>
      <p>
        These third parties may use cookies, web beacons, and similar
        technologies to collect or receive information from our website and
        elsewhere on the internet and use that information to provide
        measurement services and target ads.
      </p>

      <h2>5. Cookie Management</h2>
      <p>
        Most web browsers allow you to manage your cookie preferences. You can:
      </p>
      <ul>
        <li>Delete cookies from your device</li>
        <li>
          Block cookies by activating the setting on your browser that allows
          you to refuse all or some cookies
        </li>
        <li>Set your browser to notify you when you receive a cookie</li>
      </ul>
      <p>
        Please note that if you choose to block or delete cookies, you may not
        be able to access certain areas or features of our website, and some
        services may not function properly.
      </p>

      <h3>5.1 How to Manage Cookies in Different Browsers</h3>
      <p>
        You can find information on how to manage cookies in your browser at the
        following links:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>6. Do Not Track Signals</h2>
      <p>
        Some browsers have a "Do Not Track" feature that lets you tell websites
        that you do not want to have your online activities tracked. Currently,
        our systems do not recognize browser "Do Not Track" requests. However,
        you can disable certain tracking as discussed in this Cookie Policy.
      </p>

      <h2>7. Changes to This Cookie Policy</h2>
      <p>
        We may update our Cookie Policy from time to time. We will notify you of
        any changes by posting the new Cookie Policy on this page and updating
        the "Last updated" date. You are advised to review this Cookie Policy
        periodically for any changes.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions about our Cookie Policy, please contact us at:
      </p>
      <p>
        Email: privacy@ollemi.com
        <br />
        Address: 123 Beauty Street, 75001 Paris, France
      </p>
    </LegalLayout>
  );
}
