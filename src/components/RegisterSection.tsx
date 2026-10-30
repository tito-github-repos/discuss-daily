'use client';

import type { ElementType } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import RegisterForm from '@/components/RegisterForm';

const points: { title: string; text: string; Icon: ElementType }[] = [
  {
    title: 'Talk to the right people',
    text: 'Qualified, practicing professionals matched to your problem.',
    Icon: ForumOutlinedIcon,
  },
  {
    title: 'More than one solution',
    text: 'Every problem has options. We help you find the best one.',
    Icon: LightbulbOutlinedIcon,
  },
  {
    title: 'Your details stay private',
    text: 'We only use them to get in touch about Discuss Daily.',
    Icon: VerifiedUserOutlinedIcon,
  },
];

export default function RegisterSection() {
  return (
    <Box
      component="section"
      id="register"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)',
        scrollMarginTop: { xs: 64, md: 72 },
      }}
    >
      {/* Soft decorative circles */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 380,
          height: 380,
          borderRadius: '50%',
          bgcolor: 'var(--primary)',
          opacity: 0.08,
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: -140,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          bgcolor: 'var(--primary)',
          opacity: 0.06,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 5, md: 8 },
          alignItems: 'center',
        }}
      >
        {/* Left: message */}
        <Box>
          <Box
            sx={{
              display: 'inline-block',
              px: 1.75,
              py: 0.5,
              mb: 2.5,
              borderRadius: 999,
              bgcolor: 'rgba(22, 163, 74, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Join Discuss Daily
          </Box>

          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Let’s find the right person{' '}
            <Box component="span" sx={{ color: 'var(--primary)' }}>
              for your problem.
            </Box>
          </Typography>

          <Typography sx={{ mt: 2.5, color: 'text.secondary', maxWidth: 460, lineHeight: 1.7 }}>
            Register in less than a minute. Tell us who you are and we will connect you to the
            right people at the right time.
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 4 }}>
            {points.map(({ title, text, Icon }) => (
              <Stack key={title} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'var(--white)',
                    border: '1px solid',
                    borderColor: 'rgba(22, 163, 74, 0.25)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)',
                  }}
                >
                  <Icon sx={{ fontSize: 22, color: 'var(--primary)' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
                  <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    {text}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Right: form card */}
        <Box
          sx={{
            bgcolor: 'var(--white)',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 50px rgba(22, 163, 74, 0.15)',
            maxWidth: 480,
            width: '100%',
            justifySelf: { xs: 'center', md: 'end' },
          }}
        >
          {/* Accent bar */}
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, var(--primary), #4ade80)' }} />

          <Box sx={{ p: { xs: 3, md: 4.5 } }}>
            <Typography component="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Register now
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 3, color: 'text.secondary', fontSize: '0.95rem' }}>
              Just three details, that’s all.
            </Typography>

            <RegisterForm />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}