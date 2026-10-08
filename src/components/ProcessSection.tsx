'use client';

import { Fragment } from 'react';
import type { ElementType } from 'react';
import { Box, Container, SvgIcon, Typography } from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import ChatIcon from '@mui/icons-material/Chat';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

type Step = {
  text: string;
  Icon: ElementType;
};

const steps: Step[] = [
  {
    text: 'By asking everyone to discuss your problems to a qualified practicing professional.',
    Icon: ChatIcon,
  },
  {
    text: 'For every problem there are multiple solutions.',
    Icon: LightbulbIcon,
  },
  {
    text: 'Life is challenging; but interesting.',
    Icon: FavoriteIcon,
  },
  {
    text: 'By discussing it with a right resource at the right time, we can solve our problems.',
    Icon: HandshakeIcon,
  },
];

const CIRCLE_SIZE = 80;

function ChatBubbleOutlineIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    </SvgIcon>
  );
}

export default function ProcessSection() {
  return (
    <Box
      component="section"
      sx={{ bgcolor: 'var(--white)', borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        {/* Heading with green underline */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 700 }}
          >
            Our Process
          </Typography>
          <Box
            sx={{
              width: 64,
              height: 3,
              bgcolor: 'var(--primary)',
              borderRadius: 2,
              mx: 'auto',
              mt: 1.5,
            }}
          />
        </Box>

        {/* Steps with arrows between them */}
        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: { xs: 2, md: 1 },
          }}
        >
          {steps.map(({ text, Icon }, index) => (
            <Fragment key={text}>
              <Box
                component="li"
                sx={{
                  flex: { md: 1 },
                  maxWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderRadius: '50%',
                    bgcolor: 'rgba(22, 163, 74, 0.14)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 38, color: 'var(--primary)' }} />
                </Box>
                <Typography sx={{ fontSize: '1rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  {text}
                </Typography>
              </Box>

              {index < steps.length - 1 && (
                <ArrowForwardIcon
                  aria-hidden="true"
                  sx={{
                    color: 'var(--primary)',
                    flexShrink: 0,
                    // Align with the centre of the icon circles on desktop
                    mt: { xs: 0, md: `${CIRCLE_SIZE / 2 - 12}px` },
                    transform: { xs: 'rotate(90deg)', md: 'none' },
                  }}
                />
              )}
            </Fragment>
          ))}
        </Box>
      </Container>
    </Box>
  );
}