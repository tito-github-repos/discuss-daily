"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { startPayment } from "@/lib/pay-client";

type Consultant = {
  id: number;
  name: string;
  field: string;
  phone: string;
  email: string | null;
  feeNote: string | null;
};

export type MembershipViewProps = {
  name: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
  startDate: string | null;
  expiryDate: string | null;
  daysLeft: number | null;
  canPay: boolean;
  payLabel: string;
  consultants: Consultant[];
};

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "—";

const cardSx = {
  bgcolor: "var(--white)",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  boxShadow: "0 10px 30px rgba(22, 163, 74, 0.08)",
  p: { xs: 2.5, md: 3.5 },
};

const statusUi = {
  ACTIVE: { label: "Active", color: "#16a34a", bg: "rgba(22, 163, 74, 0.12)" },
  PENDING: {
    label: "Not activated",
    color: "#b45309",
    bg: "rgba(245, 158, 11, 0.15)",
  },
  EXPIRED: { label: "Expired", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
};

export default function MembershipView(props: MembershipViewProps) {
  const {
    name,
    status,
    startDate,
    expiryDate,
    daysLeft,
    canPay,
    payLabel,
    consultants,
  } = props;
  const router = useRouter();

  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const firstName = name.split(" ")[0];
  const ui = statusUi[status];

  const handlePay = () => {
    setPaying(true);
    setNotice(null);
    startPayment({
      onSuccess: (expiry) => {
        setNotice({
          type: "success",
          text: expiry
            ? `Payment successful. Your membership is active until ${formatDate(expiry)}.`
            : "Payment successful. Your membership is now active.",
        });
        router.refresh(); // reload the page data from the server
      },
      onFailed: (text) => setNotice({ type: "error", text }),
      onDone: () => setPaying(false),
    });
  };

  const payButton = (
    <Button
      variant="contained"
      size="large"
      disabled={paying}
      onClick={handlePay}
      sx={{
        background: "linear-gradient(90deg, var(--primary), #22c55e)",
        borderRadius: "14px",
        px: 4,
        py: 1.3,
        fontWeight: 600,
        boxShadow: "0 8px 20px rgba(22, 163, 74, 0.35)",
        "&.Mui-disabled": { color: "var(--white)", opacity: 0.7 },
      }}
    >
      {paying ? <CircularProgress size={24} color="inherit" /> : payLabel}
    </Button>
  );

  return (
    <Box
      component="main"
      sx={{
        background:
          "linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: "1.8rem", md: "2.3rem" }, fontWeight: 700 }}
        >
          Welcome,{" "}
          <Box component="span" sx={{ color: "var(--primary)" }}>
            {firstName}
          </Box>
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
          Your Discuss Daily membership details are below.
        </Typography>

        {notice && (
          <Alert
            severity={notice.type}
            onClose={() => setNotice(null)}
            sx={{ mt: 3, borderRadius: "12px" }}
          >
            {notice.text}
          </Alert>
        )}

        <Stack spacing={3} sx={{ mt: 4 }}>
          {/* Membership card */}
          <Box sx={cardSx}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                component="h2"
                sx={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Membership
              </Typography>
              <Chip
                label={ui.label}
                sx={{
                  bgcolor: ui.bg,
                  color: ui.color,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              />
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <Info label="Plan" value="1 year · ₹365" />
              <Info label="Start date" value={formatDate(startDate)} />
              <Info label="Expiry date" value={formatDate(expiryDate)} />
              <Info
                label="Days left"
                value={status === "PENDING" ? "—" : String(daysLeft ?? 0)}
              />
            </Box>

            {status === "ACTIVE" && daysLeft !== null && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (daysLeft / 365) * 100)}
                sx={{
                  mt: 2.5,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(22, 163, 74, 0.12)",
                }}
              />
            )}

            {status === "PENDING" && (
              <Typography sx={{ mt: 2.5, color: "text.secondary" }}>
                Pay ₹365 to activate your 1-year membership and see the
                consultant details.
              </Typography>
            )}
            {status === "EXPIRED" && (
              <Typography sx={{ mt: 2.5, color: "text.secondary" }}>
                Your membership has expired. Renew for ₹365 to get 1 more year
                of access.
              </Typography>
            )}

            {canPay && (
              <Box sx={{ mt: 2.5 }}>
                {payButton}
                <Typography
                  sx={{ mt: 1, fontSize: "0.78rem", color: "text.secondary" }}
                >
                  The membership fee is non-refundable.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Consultants */}
          <Box sx={cardSx}>
            <Typography
              component="h2"
              sx={{ fontSize: "1.2rem", fontWeight: 700 }}
            >
              Your consultants
            </Typography>

            {status === "ACTIVE" ? (
              <>
                <Typography
                  sx={{
                    mt: 0.5,
                    mb: 2.5,
                    color: "text.secondary",
                    fontSize: "0.92rem",
                  }}
                >
                  Contact a consultant directly. Consultation fees are paid
                  directly to the consultant.
                </Typography>

                {consultants.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>
                    Consultant details will be available here soon.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {consultants.map((c) => (
                      <ConsultantCard key={c.id} c={c} />
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Stack
                spacing={1}
                sx={{
                  mt: 2,
                  alignItems: "center",
                  textAlign: "center",
                  py: 3,
                  color: "text.secondary",
                }}
              >
                <LockOutlinedIcon
                  sx={{ fontSize: 40, color: "var(--primary)" }}
                />
                <Typography>
                  {status === "EXPIRED"
                    ? "Renew your membership to see the consultant details."
                    : "Activate your membership to see the consultant details."}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

function ConsultantCard({ c }: { c: Consultant }) {
  const digits = c.phone.replace(/\D/g, "");
  const linkSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    color: "text.primary",
    textDecoration: "none",
    "&:hover": { color: "var(--primary)" },
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "rgba(22, 163, 74, 0.25)",
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
        {c.name}
      </Typography>
      <Typography sx={{ color: "var(--primary)", fontWeight: 500, mb: 1.5 }}>
        {c.field}
      </Typography>

      <Stack spacing={1}>
        <Box
          component="a"
          href={`tel:${c.phone.replace(/\s/g, "")}`}
          sx={linkSx}
        >
          <PhoneOutlinedIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
          {c.phone}
        </Box>
        {digits && (
          <Box
            component="a"
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={linkSx}
          >
            <WhatsAppIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
            WhatsApp
          </Box>
        )}
        {c.email && (
          <Box
            component="a"
            href={`mailto:${c.email}`}
            sx={{ ...linkSx, wordBreak: "break-all" }}
          >
            <EmailOutlinedIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
            {c.email}
          </Box>
        )}
      </Stack>

      {c.feeNote && (
        <Typography
          sx={{ mt: 1.5, fontSize: "0.85rem", color: "text.secondary" }}
        >
          {c.feeNote}
        </Typography>
      )}
    </Box>
  );
}