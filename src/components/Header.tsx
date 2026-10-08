'use client';

import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'Contact', id: 'contact' },
];

function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="18" cy="19" r="12" fill="var(--primary)" />
      <path d="M9 28 L7 37 L16 31 Z" fill="var(--primary)" />
      <circle cx="31" cy="27" r="12" fill="var(--primary)" stroke="#fff" strokeWidth="2" />
      <path d="M39 36 L42 44 L32 38 Z" fill="var(--primary)" />
      <circle cx="26" cy="27" r="1.8" fill="#fff" />
      <circle cx="31" cy="27" r="1.8" fill="#fff" />
      <circle cx="36" cy="27" r="1.8" fill="#fff" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <path d="M6 6 L18 18 M18 6 L6 18" />
      ) : (
        <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
      )}
    </svg>
  );
}

export default function Header() {
  const [active, setActive] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Highlight the nav link of the section currently in view
  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'var(--white)',
        color: 'var(--foreground)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Logo */}
          <Box
            component="a"
            href="#home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            <LogoIcon />
            <Typography
              component="span"
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700, lineHeight: 1 }}
            >
              Discuss{' '}
              <Box component="span" sx={{ color: 'var(--primary)' }}>
                Daily
              </Box>
            </Typography>
          </Box>

          {/* Desktop menu */}
          <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <Button
                  key={item.id}
                  component="a"
                  href={`#${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    position: 'relative',
                    px: 2.5,
                    py: 1,
                    fontSize: '1rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    // Curved border: transparent normally, green on hover
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
                    // Active underline (drawn separately so the curved border stays clean)
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 20,
                      right: 20,
                      bottom: 4,
                      height: 2,
                      borderRadius: 2,
                      bgcolor: isActive ? 'var(--primary)' : 'transparent',
                    },
                    '&:hover': {
                      bgcolor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Mobile menu button */}
          <IconButton
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'var(--foreground)' }}
          >
            <MenuIcon open={drawerOpen} />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 240 } } }}
      >
        {/* Close button at the top right of the sidebar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.5, pt: 1.5, pb: 0.5 }}>
          <IconButton
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: 'var(--foreground)',
              '&:hover': { bgcolor: 'var(--primary-light)', color: 'var(--primary)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List component="nav" aria-label="Mobile">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <ListItemButton
                key={item.id}
                component="a"
                href={`#${item.id}`}
                onClick={() => setDrawerOpen(false)}
                selected={isActive}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderLeft: '3px solid',
                  borderColor: isActive ? 'var(--primary)' : 'transparent',
                  '&.Mui-selected': { bgcolor: 'var(--primary-light)' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--primary)' : 'var(--foreground)',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </AppBar>
  );
}