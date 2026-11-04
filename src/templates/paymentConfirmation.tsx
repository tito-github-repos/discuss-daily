import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  MEMBERSHIP_BENEFITS,
  SITE_LABEL,
  SITE_URL,
} from "@/lib/site";

interface PaymentConfirmationProps {
  name: string;
  amountText: string;
  paymentId: string;
  paidOn: string;
  validTill: string;
}

const subHeadingStyle = {
  fontWeight: "bold",
  color: "#0f172a",
  margin: "16px 0 6px 0",
};

const listStyle = {
  margin: "0 0 16px 0",
  paddingLeft: "20px",
  color: "#334155",
};

export default function PaymentConfirmation({
  name,
  amountText,
  paymentId,
  paidOn,
  validTill,
}: PaymentConfirmationProps) {
  const first = name.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>Your Discuss Daily payment was successful</Preview>

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
            Payment Successful ✅
          </Heading>

          <Text>
            Dear <strong>{first}</strong>,
          </Text>

          <Text>
            Thank you! We have received your payment for the{" "}
            <strong>Discuss Daily 1 year membership</strong>. Your membership is
            now active.
          </Text>

          <Section
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <Row>
              <Column>
                <Text style={{ margin: "6px 0" }}>
                  <strong>Amount paid:</strong> {amountText}
                </Text>
                <Text style={{ margin: "6px 0" }}>
                  <strong>Payment ID:</strong> {paymentId}
                </Text>
                <Text style={{ margin: "6px 0" }}>
                  <strong>Paid on:</strong> {paidOn}
                </Text>
                <Text style={{ margin: "6px 0" }}>
                  <strong>Valid until:</strong> {validTill}
                </Text>
              </Column>
            </Row>
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
