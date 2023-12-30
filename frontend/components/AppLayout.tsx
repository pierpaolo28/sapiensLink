import { Container } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      <Header></Header>
      <Container>{children}</Container>
      <Footer></Footer>
    </div>
  );
}
