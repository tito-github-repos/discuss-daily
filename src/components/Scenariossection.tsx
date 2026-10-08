"use client";

import Image from "next/image";
import type { ElementType } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import Diversity3Icon from "@mui/icons-material/Diversity3";

type Scenario = {
  title: string;
  text: string;
  image: string;
  alt: string;
  Icon: ElementType;
};

// Add these four photos in /public/scenarios/
const scenarios: Scenario[] = [
  {
    title: "If you are a student",
    text: "Have an academic problem, which is functional, it will be addressed by a passionate teacher and subject matter expert; if it is non-functional problem, it will be addressed by a counselling psychologist and a humanist.",
    image: "/img/student.png",
    alt: "A student studying at a desk",
    Icon: SchoolIcon,
  },
  {
    title: "If you have a financial goal/problem",
    text: "You can discuss with a financial consultant.",
    image: "/img/finance.png",
    alt: "A plant growing from stacks of coins",
    Icon: CurrencyRupeeIcon,
  },
  {
    title: "If you have a problem in your working premises",
    text: "You can discuss with a HR consultant.",
    image: "/img/workplace.png",
    alt: "A professional working on a laptop",
    Icon: BusinessCenterIcon,
  },
  {
    title: "If you have a problem with your family members",
    text: "You can discuss with a 70 plus retired successful and happy people to guide you and support you and gives you solutions.",
    image: "/img/people.png",
    alt: "A happy elderly couple smiling together",
    Icon: Diversity3Icon,
  },
];

const BADGE_SIZE = 56;

export default function ScenariosSection() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "var(--white)",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        {/* Heading */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1.5,
            alignItems: "center",
            mb: { xs: 4, md: 5 },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.6rem", md: "2rem" },
              fontWeight: 700,
              color: "var(--black)",
            }}
          >
            Our Scenarios
          </Typography>
        </Box>

        {/* Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {scenarios.map(({ title, text, image, alt, Icon }) => (
            <Box
              key={title}
              component="article"
              sx={{
                bgcolor: "var(--white)",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Photo */}
              <Box
                sx={{
                  position: "relative",
                  height: 170,
                  bgcolor: "var(--primary-light)",
                }}
              >
                <Image
                  src={image}
                  alt={alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </Box>

              {/* Content with overlapping icon badge */}
              <Box sx={{ position: "relative", px: 2.5, pt: 5, pb: 3 }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -BADGE_SIZE / 2,
                    left: 20,
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: "50%",
                    bgcolor: "#e3f4ea",
                    border: "4px solid #fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: "var(--primary)" }} />
                </Box>

                <Typography
                  component="h3"
                  sx={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: "0.95rem",
                    color: "text.secondary",
                    lineHeight: 1.65,
                  }}
                >
                  {text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
