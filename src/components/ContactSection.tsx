"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import NextLink from "next/link";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

type ContactItem = {
  label: string;
  lines: string[];
  href?: string;
  Icon: ElementType;
};

const phoneAndEmail: ContactItem[] = [
  {
    label: "Phone",
    lines: ["+91 94999 53257"],
    href: "tel:+919499953257",
    Icon: PhoneIcon,
  },
  {
    label: "Email",
    lines: ["discussdailyusers@gmail.com"],
    href: "mailto:discussdailyusers@gmail.com",
    Icon: EmailIcon,
  },
];

const address: ContactItem = {
  label: "Address",
  lines: [
    "B4, Luminers Enclave, #5/1092, Giri Nagar, Main Road, Ramapuram, Chennai - 600089",
  ],
  Icon: LocationOnIcon,
};

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function IconCircle({ Icon, size = 44 }: { Icon: ElementType; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: "var(--primary)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: size * 0.5, color: "var(--white)" }} />
    </Box>
  );
}

function ContactRow({ label, lines, href, Icon }: ContactItem) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <IconCircle Icon={Icon} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
          {label}
        </Typography>
        {lines.map((line) =>
          href ? (
            <Link
              key={line}
              href={href}
              underline="hover"
              sx={{
                display: "block",
                color: "text.primary",
                fontSize: "0.95rem",
                wordBreak: "break-word",
              }}
            >
              {line}
            </Link>
          ) : (
            <Typography
              key={line}
              sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}
            >
              {line}
            </Typography>
          ),
        )}
      </Box>
    </Stack>
  );
}

export default function ContactSection() {
  // Read the year after the page loads (not during prerender)
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box
      component="section"
      id="contact"
      sx={{ bgcolor: "var(--white)", scrollMarginTop: { xs: 64, md: 72 } }}
    >
      {/* Content */}
      <Box sx={{ bgcolor: "var(--primary-light)" }}>
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 3, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1.1fr" },
            alignItems: "center",
          }}
        >
          {/* Column 1: heading */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-start",
              pb: { xs: 3, md: 0 },
              pr: { md: 3 },
            }}
          >
            <IconCircle Icon={ChatBubbleIcon} size={56} />
            <Box>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "1.6rem", md: "1.9rem" },
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                Contact Us
              </Typography>
              <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                We are here to help you.
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 3,
                  bgcolor: "var(--primary)",
                  borderRadius: 2,
                  mt: 1.5,
                }}
              />
            </Box>
          </Stack>

          {/* Column 2: phone and email stacked */}
          <Stack
            spacing={2.5}
            sx={{
              py: { xs: 2.5, md: 1 },
              px: { xs: 0, md: 4 },
              borderTop: { xs: "1px solid", md: "none" },
              borderLeft: { xs: "none", md: "1px solid" },
              borderColor: "divider",
            }}
          >
            {phoneAndEmail.map((item) => (
              <ContactRow key={item.label} {...item} />
            ))}
          </Stack>

          {/* Column 3: address */}
          <Box
            sx={{
              py: { xs: 2.5, md: 1 },
              px: { xs: 0, md: 4 },
              borderTop: { xs: "1px solid", md: "none" },
              borderLeft: { xs: "none", md: "1px solid" },
              borderColor: "divider",
            }}
          >
            <ContactRow {...address} />
          </Box>
        </Container>
      </Box>

      {/* Footer bar */}
      <Box sx={{ bgcolor: "var(--primary)", py: 2 }}>
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row-reverse" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
            {legalLinks.map(({ label, href }) => (
              <Link
                key={href}
                component={NextLink}
                href={href}
                underline="hover"
                sx={{ color: "var(--white)", fontSize: "0.85rem" }}
              >
                {label}
              </Link>
            ))}
          </Stack>

          <Typography sx={{ color: "var(--white)", fontSize: "0.85rem" }}>
            © {year} Discuss Daily. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
