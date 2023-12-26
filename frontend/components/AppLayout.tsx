import { Container } from "@mui/material";

import Header from "./Header";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      <Header></Header>
      <Container>{children}</Container>
    </div>
  );
}
