"use client";

import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "@/components/AuthProvider";

const benefits = [
  {
    icon: PhoneInTalkIcon,
    text: "Contact details of qualified consultants, and talk to them directly",
  },
  {
    icon: CalendarMonthIcon,
    text: "Valid for ONE year",
  },
  {
    icon: CurrencyRupeeIcon,
    text: "Consultation fees are paid directly to the consultant",
  },
];

export default function MembershipPlanSection() {
  const { membership } = useAuth();
  const isActive = membership?.status === "ACTIVE";

  const buttonSx = {
    mt: 3,
    py: 1.4,
    borderRadius: "14px",
    fontWeight: 600,
    textTransform: "none",
    background: "linear-gradient(90deg, var(--primary), #22c55e)",
    boxShadow: "0 8px 20px rgba(22, 163, 74, 0.3)",
  } as const;

  return (
    <Box
      component="section"
      id="plans"
      sx={{
        bgcolor: "var(--primary-light)",
        scrollMarginTop: { xs: 64, md: 72 },
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {/* Heading */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" }, fontWeight: 700 }}
          >
            Membership Plan
          </Typography>
          <Box
            sx={{
              width: 56,
              height: 3,
              bgcolor: "var(--primary)",
              borderRadius: 2,
              mx: "auto",
              mt: 1.5,
            }}
          />
        </Box>

        {/* Two sections, no card: points left, amount right */}
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
            alignItems: "center",
            columnGap: { md: 6 },
            rowGap: { xs: 4, md: 0 },
          }}
        >
          {/* Left: points with icons */}
          <Stack spacing={2.5} sx={{ order: { xs: 2, md: 1 } }}>
            {benefits.map(({ icon: Icon, text }) => (
              <Stack
                key={text}
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: "rgba(22, 163, 74, 0.12)",
                    border: "1.5px solid #86efac",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography sx={{ lineHeight: 1.6, fontSize: "1.05rem" }}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Right: badge, amount, button */}
          <Box
            sx={{
              order: { xs: 1, md: 2 },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
              pl: { md: 6 },
              borderLeft: { xs: "none", md: "1px solid rgba(22, 163, 74, 0.3)" },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 999,
                border: "1.5px solid #86efac",
                color: "var(--primary)",
                bgcolor: "transparent",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Annual Member
            </Box>

            <Stack direction="row" sx={{ alignItems: "flex-start", mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "1.7rem",
                  fontWeight: 600,
                  mt: 1,
                  color: "var(--primary)",
                }}
              >
                ₹
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "4.2rem", md: "5rem" },
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                365
              </Typography>
              <Typography
                sx={{
                  alignSelf: "flex-end",
                  ml: 1,
                  mb: { xs: 0.8, md: 1 },
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "text.secondary",
                }}
              >
                per year
              </Typography>
            </Stack>

            {isActive ? (
              <Button
                component={Link}
                href="/membership"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                fullWidth
                sx={buttonSx}
              >
                Go to My Membership
              </Button>
            ) : (
              <Button
                component="a"
                href="#register"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                fullWidth
                sx={buttonSx}
              >
                Register & Pay ₹365
              </Button>
            )}

            <Typography
              sx={{
                mt: 1.5,
                fontSize: "0.8rem",
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              The membership fee is non-refundable.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}