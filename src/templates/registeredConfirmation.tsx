import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { MEMBERSHIP_AMOUNT_PAISE } from "@/lib/razorpay";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_LABEL,
  SITE_URL,
} from "@/lib/site";

interface RegisteredConfirmationProps {
  name: string;
}

// The price comes from the payment settings, so the email never goes out of date
const rupees = (paise: number) => `₹${paise / 100}`;

export default function RegisteredConfirmation({
  name,
}: RegisteredConfirmationProps) {
  const first = name.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>
        You are registered. Activate your Discuss Daily membership
      </Preview>

      <Body
        style={{
          backgroundColor: "#f5f7fa",
          fontFamily: "Arial, sans-serif",
          padding: "30px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "30px",
          }}
        >
          <Heading
            style={{
              color: "#16a34a",
              fontSize: "26px",
              marginBottom: "20px",
            }}
          >
            Registration Confirmed 🎉
          </Heading>

          <Text>
            Dear <strong>{first}</strong>,
          </Text>

          <Text>
            Thank you for registering with Discuss Daily. Your membership is{" "}
            <strong>not active yet</strong>. Activate it to talk to qualified
            professionals directly.
          </Text>

          <Section
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              padding: "12px 18px",
              margin: "20px 0",
            }}
          >
            <Text
              style={{ margin: "4px 0", fontWeight: "bold", color: "#0f172a" }}
            >
              Annual Membership{" "}
              <span style={{ color: "#16a34a" }}>
                - {rupees(MEMBERSHIP_AMOUNT_PAISE)} per year
              </span>
            </Text>
            <Text
              style={{
                margin: "4px 0",
                color: "#0f172a",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Validity: 1 year
            </Text>
            <Text
              style={{
                margin: "4px 0",
                color: "#334155",
                fontSize: "14px",
              }}
            >
              Contact details of consultants, to call or message directly.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button
              href={SITE_URL}
              style={{
                backgroundColor: "#16a34a",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "15px",
                padding: "13px 28px",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Activate my membership
            </Button>
          </Section>

          <Text style={{ fontSize: "13px", color: "#4b5563" }}>
            Consultation fees are not included in the membership, and are paid
            directly to the consultant. The membership fee is non-refundable.
          </Text>

          <Text>If you have any questions, feel free to contact us.</Text>

          <Section
            style={{
              marginTop: "30px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#0f172a" }}>
              Discuss Daily Team
            </Text>

            <Text style={{ fontSize: "13px", color: "#64748b" }}>
              <Link
                href={SITE_URL}
                style={{ color: "#16a34a", textDecoration: "underline" }}
              >
                {SITE_LABEL}
              </Link>
              {" · "}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ color: "#64748b" }}
              >
                {CONTACT_EMAIL}
              </Link>
              {" · "}
              <Link
                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                style={{ color: "#64748b" }}
              >
                {CONTACT_PHONE}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}