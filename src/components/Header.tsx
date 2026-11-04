'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/components/AuthProvider';

const baseItems = [
  { label: 'Home', id: 'home', href: '/#home' },
  { label: 'Contact', id: 'contact', href: '/#contact' },
];
const memberItem = { label: 'My Membership', id: 'membership', href: '/membership' };
const profileItem = { label: 'Profile', id: 'profile', href: '/profile' };

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
      {open ? <path d="M6 6 L18 18 M18 6 L6 18" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
    </svg>
  );
}

export default function Header() {
  const { user, loading, logout, openLogin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sectionActive, setSectionActive] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Main menu: Home, Contact, and My Membership after login
  const items = user ? [...baseItems, memberItem] : baseItems;
  // Mobile drawer also lists Profile, because it has no dropdown
  const mobileItems = user ? [...items, profileItem] : items;
  const firstName = user?.name.split(' ')[0] ?? '';

  // On the home page the active link follows the section in view; elsewhere it follows the route
  const active =
    pathname === '/'
      ? sectionActive
      : pathname.startsWith('/membership')
        ? 'membership'
        : pathname.startsWith('/profile')
          ? 'profile'
          : '';

  useEffect(() => {
    const sections = baseItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSectionActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const handleLogout = async () => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  };

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
            component={Link}
            href="/#home"
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
          <Box
            component="nav"
            aria-label="Main"
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}
          >
            {items.map((item) => {
              const isActive = active === item.id;
              return (
                <Button
                  key={item.id}
                  component={Link}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    position: 'relative',
                    px: 2.5,
                    py: 1,
                    fontSize: '1rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
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

            {/* Login / user menu */}
            <Box sx={{ ml: 1.5, minWidth: 150, display: 'flex', justifyContent: 'flex-end' }}>
              {loading ? null : user ? (
                <>
                  <Button
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    startIcon={<PersonIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                      px: 2,
                      py: 0.9,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      bgcolor: active === 'profile' ? 'var(--primary-light)' : 'transparent',
                      '&:hover': { bgcolor: 'var(--primary-light)' },
                    }}
                  >
                    Hi, {firstName}
                  </Button>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { sx: { mt: 1, minWidth: 190, borderRadius: 2 } } }}
                  >
                    <MenuItem component={Link} href="/profile" onClick={() => setMenuAnchor(null)}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={openLogin}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, var(--primary), #22c55e)',
                    boxShadow: '0 6px 16px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  Login / Register
                </Button>
              )}
            </Box>
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
        slotProps={{ paper: { sx: { width: 260 } } }}
      >
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

        {user && <Typography sx={{ px: 3, pb: 1.5, fontWeight: 600 }}>Hi, {firstName}</Typography>}

        <List component="nav" aria-label="Mobile">
          {mobileItems.map((item) => {
            const isActive = active === item.id;
            return (
              <ListItemButton
                key={item.id}
                component={Link}
                href={item.href}
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

        <Box sx={{ px: 3, pt: 2 }}>
          {loading ? null : user ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: '12px', py: 1.1 }}
            >
              Logout
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setDrawerOpen(false);
                openLogin();
              }}
              sx={{
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 600,
                background: 'linear-gradient(90deg, var(--primary), #22c55e)',
              }}
            >
              Login / Register
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}