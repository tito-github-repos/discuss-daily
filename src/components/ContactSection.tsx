'use client';

import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

type ContactItem = {
  label: string;
  lines: string[];
  note?: string;
  href?: string;
  Icon: ElementType;
};

// Replace these with your real contact details
const contactItems: ContactItem[] = [
  {
    label: 'Phone',
    lines: ['+91 94999 53256'],
    // note: '(Mon – Sat, 9 AM – 6 PM)',
    href: 'tel:+919499953256',
    Icon: PhoneIcon,
  },
  {
    label: 'Email',
    lines: ['discussdaily@gmail.com'],
    // note: "We'll get back to you soon.",
    href: 'mailto:discussdaily@gmail.com',
    Icon: EmailIcon,
  },
  {
    label: 'Address',
    lines: ['B4, Luminers Enclave, #5/1092, Giri Nagar, Main Road, Ramapuram, Chennai - 600089'],
    Icon: LocationOnIcon,
  },
];

function IconCircle({ Icon, size = 44 }: { Icon: ElementType; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: 'var(--primary)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: size * 0.5, color: 'var(--white)' }} />
    </Box>
  );
}

export default function ContactSection() {
  // Read the year after the page loads (not during prerender)
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box component="section" id="contact" sx={{ bgcolor: 'var(--white)', scrollMarginTop: { xs: 64, md: 72 } }}>
      {/* Wavy top edge */}
      <Box sx={{ lineHeight: 0 }}>
        <Box
          component="svg"
          viewBox="0 0 1440 70"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{ display: 'block', width: '100%', height: { xs: 36, md: 70 } }}
        >
          <path
            d="M0 45 C240 0 480 70 720 35 C960 0 1200 55 1440 20 V70 H0 Z"
            style={{ fill: 'var(--primary-light)' }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: 'var(--primary-light)' }}>
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 3, md: 4 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr 1.2fr' },
            alignItems: 'center',
          }}
        >
          {/* Heading block */}
          <Stack direction="row" spacing={2}  sx={{ alignItems:"flex-start", pb: { xs: 3, md: 0 }, pr: { md: 3 } }}>
            <IconCircle Icon={ChatBubbleIcon} size={56} />
            <Box>
              <Typography
                component="h2"
                sx={{ fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 700, color: 'var(--primary)' }}
              >
                Contact Us
              </Typography>
              <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>We are here to help you.</Typography>
              <Box sx={{ width: 48, height: 3, bgcolor: 'var(--primary)', borderRadius: 2, mt: 1.5 }} />
            </Box>
          </Stack>

          {/* Contact details */}
          {contactItems.map(({ label, lines, note, href, Icon }) => (
            <Stack
              key={label}
              direction="row"
              spacing={1.5}
             
              sx={{
                 alignItems:"flex-start",
                py: { xs: 2.5, md: 1 },
                px: { xs: 0, md: 3 },
                borderTop: { xs: '1px solid', md: 'none' },
                borderLeft: { xs: 'none', md: '1px solid' },
                borderColor: 'divider',
              }}
            >
              <IconCircle Icon={Icon} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</Typography>
                {lines.map((line) =>
                  href ? (
                    <Link
                      key={line}
                      href={href}
                      underline="hover"
                      sx={{ display: 'block', color: 'text.primary', fontSize: '0.95rem', wordBreak: 'break-word' }}
                    >
                      {line}
                    </Link>
                  ) : (
                    <Typography key={line} sx={{ fontSize: '0.95rem' }}>
                      {line}
                    </Typography>
                  )
                )}
                {note && (
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.25 }}>{note}</Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Container>
      </Box>

      {/* Green wave and footer bar */}
      <Box sx={{ bgcolor: 'var(--primary-light)', lineHeight: 0 }}>
        <Box
          component="svg"
          viewBox="0 0 1440 70"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{ display: 'block', width: '100%', height: { xs: 36, md: 60 } }}
        >
          <path
            d="M0 30 C240 70 480 0 720 35 C960 70 1200 10 1440 40 V70 H0 Z"
            style={{ fill: 'var(--primary)' }}
          />
        </Box>
      </Box>
      <Box sx={{ bgcolor: 'var(--primary)', py: 2, textAlign: 'center' }}>
        <Typography sx={{ color: 'var(--white)', fontSize: '0.85rem' }}>
          © {year} Discuss Daily. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}