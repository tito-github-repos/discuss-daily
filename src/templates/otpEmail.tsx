import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { CONTACT_EMAIL, CONTACT_PHONE, SITE_LABEL, SITE_URL } from "@/lib/site";

interface OtpEmailProps {
  name: string;
  code: string;
}

export default function OtpEmail({ name, code }: OtpEmailProps) {
  const first = name.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>{`${code} is your Discuss Daily login code`}</Preview>

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
            Your Login Code 🔐
          </Heading>

          <Text>
            Dear <strong>{first}</strong>,
          </Text>

          <Text>Use this code to log in to your Discuss Daily account:</Text>

          <Section style={{ textAlign: "center", margin: "22px 0" }}>
            <Text
              style={{
                display: "inline-block",
                margin: 0,
                padding: "14px 26px",
                backgroundColor: "#f0fdf4",
                border: "1px dashed #16a34a",
                borderRadius: "12px",
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "8px",
                color: "#16a34a",
              }}
            >
              {code}
            </Text>
          </Section>

          <Text>
            This code is valid for <strong>10 minutes</strong> and can be used
            only once.
          </Text>

          <Text style={{ fontSize: "13px", color: "#9ca3af" }}>
            If you did not ask for this code, you can safely ignore this email.
            Never share this code with anyone.
          </Text>

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
              <Link href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#64748b" }}>
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