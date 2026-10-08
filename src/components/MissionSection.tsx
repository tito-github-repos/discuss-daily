'use client';

import { Box, Container, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import type { ElementType } from 'react';

type Item = {
  title: string;
  text: string;
  Icon?: ElementType; // MUI icon
  iconSrc?: string; // SVG file in /public
};

const items: Item[] = [
  {
    title: 'Our Mission',
    text: 'Discuss Daily wants to increase happiness quotient of everyone.',
    iconSrc: '/icons/target-icon.svg',
  },
  {
    title: 'How it is being achieved?',
    text: 'We connect you to right people at the right time.',
    Icon: GroupsIcon,
  },
];

// Draws an SVG file in the theme green (works for single-colour line icons)
function SvgMaskIcon({ src }: { src: string }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: { xs: 48, md: 60 },
        height: { xs: 48, md: 60 },
        flexShrink: 0,
        bgcolor: 'var(--primary)',
        maskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

export default function MissionSection() {
  return (
    <Box component="section" sx={{ bgcolor: 'var(--white)' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          {items.map(({ title, text, Icon, iconSrc }, index) => (
            <Stack
              key={title}
              direction="row"
              spacing={{ xs: 2, md: 3 }}
              sx={{
                alignItems: 'flex-start',
                py: { xs: 3, md: 1 },
                px: { xs: 0, md: 4 },
                // Divider: horizontal on mobile, vertical on desktop
                borderTop: { xs: index === 1 ? '1px solid' : 'none', md: 'none' },
                borderLeft: { xs: 'none', md: index === 1 ? '1px solid' : 'none' },
                borderColor: 'divider',
              }}
            >
              {iconSrc ? (
                <SvgMaskIcon src={iconSrc} />
              ) : (
                Icon && (
                  <Icon sx={{ fontSize: { xs: 48, md: 60 }, color: 'var(--primary)', flexShrink: 0 }} />
                )
              )}
              <Box>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.35rem', md: '1.6rem' },
                    fontWeight: 600,
                    color: 'var(--primary)',
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: 360 }}>
                  {text}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  );
}