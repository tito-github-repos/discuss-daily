import type { ReactNode } from "react";
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

import { SITE_LABEL, SITE_URL } from "@/lib/site";

interface AppointmentRequestProps {
  audience: "consultant" | "admin";
  consultantName: string;
  consultantHasEmail: boolean;
  scenarioLabel: string;
  problem: string | null;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  sentOn: string;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Text style={{ margin: "6px 0", fontSize: "14px", color: "#0f172a" }}>
      <span style={{ color: "#64748b" }}>{label}: </span>
      <strong>{children}</strong>
    </Text>
  );
}

export default function AppointmentRequest({
  audience,
  consultantName,
  consultantHasEmail,
  scenarioLabel,
  problem,
  memberName,
  memberEmail,
  memberMobile,
  sentOn,
}: AppointmentRequestProps) {
  const isConsultant = audience === "consultant";

  return (
    <Html>
      <Head />
      <Preview>
        New consultation request from {memberName} on Discuss Daily
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
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            New Consultation Request
          </Heading>

          {isConsultant ? (
            <>
              <Text>
                Dear <strong>{consultantName}</strong>,
              </Text>
              <Text>
                A Discuss Daily member has requested a consultation with you.
                Please contact the member to fix a <strong>1-hour</strong> time
                that suits you both. You can reply to this email to reach the
                member.
              </Text>
            </>
          ) : (
            <Text>
              A Discuss Daily member has sent a consultation request to{" "}
              <strong>{consultantName}</strong>. The consultant has been asked
              to contact the member to fix a 1-hour time.
            </Text>
          )}

          <Section
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              padding: "12px 18px",
              margin: "20px 0",
            }}
          >
            <Row label="Scenario">{scenarioLabel}</Row>
            <Row label="Consultant">{consultantName}</Row>
            <Row label="Member">{memberName}</Row>
            <Row label="Email">
              <Link
                href={`mailto:${memberEmail}`}
                style={{ color: "#16a34a", textDecoration: "underline" }}
              >
                {memberEmail}
              </Link>
            </Row>
            <Row label="Mobile">
              <Link
                href={`tel:${memberMobile.replace(/\s/g, "")}`}
                style={{ color: "#16a34a", textDecoration: "underline" }}
              >
                {memberMobile}
              </Link>
            </Row>
            <Row label="Sent on">{sentOn}</Row>
          </Section>

          <Section
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px 18px",
              margin: "20px 0",
            }}
          >
            <Text
              style={{ margin: "0 0 6px", fontSize: "13px", color: "#64748b" }}
            >
              Problem statement
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: "14px",
                color: problem ? "#0f172a" : "#64748b",
                whiteSpace: "pre-wrap",
              }}
            >
              {problem ?? "Not provided"}
            </Text>
          </Section>

          {!isConsultant && !consultantHasEmail && (
            <Section
              style={{
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                padding: "4px 18px",
                margin: "20px 0",
              }}
            >
              <Text style={{ fontSize: "14px", color: "#92400e" }}>
                This consultant has no email saved, so only you received this
                request. Please pass it on to {consultantName}.
              </Text>
            </Section>
          )}

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
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}