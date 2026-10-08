"use client";

import Image from "next/image";
import { Box, Container, Stack, Typography } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';

export default function Hero() {
  return (
    <Box
      component="section"
      id="home"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "var(--primary-light)",
        scrollMarginTop: { xs: 64, md: 72 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          minHeight: { md: 460 },
          py: { xs: 5, md: 8 },
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              width: 64,
              height: 3,
              bgcolor: "var(--primary)",
              mb: 3,
              borderRadius: 2,
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3.5rem" },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Where Focus Goes,
            <Box
              component="span"
              sx={{ display: "block", color: "var(--primary)" }}
            >
              Energy Flows.
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 3,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 440,
            }}
          >
            Discuss Daily wants to increase the happiness quotient of everyone.
          </Typography>

          <Stack
            direction="row"
            sx={{ spacing: 2, alignItems: "center", mt: 4 }}
          >
            <GroupIcon sx={{ color: "var(--primary)", fontSize: "2rem" }} />
            <Typography sx={{ fontWeight: 500, ml: 1 }}>
              We connect you to right people at the right time.
            </Typography>
          </Stack>
        </Box>
      </Container>

      {/* Image: sits on the right edge on desktop, below the text on mobile */}
      <Box
        sx={{
          position: { xs: "relative", md: "absolute" },
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: "100%", md: "48%" },
          height: { xs: 320, sm: 400, md: "auto" },
          overflow: "hidden",
          bgcolor: "var(--primary-light)",
          borderTopLeftRadius: { xs: 0, md: 320 },
          borderBottomLeftRadius: { xs: 0, md: 320 },
        }}
      >
        {/* Add your photo at /public/hero.jpg */}
        <Image
          src="/img/hero.png"
          alt="A woman smiling and thinking while she works on a laptop"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 48vw"
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />

        {/* Green swoosh along the bottom */}
        <Box
          component="svg"
          viewBox="0 0 500 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: { xs: 50, md: 90 },
          }}
        >
          <path
            d="M0 120 V70 C80 30 160 40 260 85 C340 115 420 120 500 120 Z"
            fill="var(--primary)"
          />
        </Box>
      </Box>
    </Box>
  );
}
