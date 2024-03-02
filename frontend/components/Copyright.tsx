import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link
        color="textSecondary"
        href="/"
        sx={(theme) => ({
          transition: ".2s",
          "&:hover": {
            color: theme.palette.mode === "dark" ? "#fff" : "#101828",
          },
        })}
      >
        SapiensLink
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
