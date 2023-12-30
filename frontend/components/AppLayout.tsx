import Container from "@mui/material/Container";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      <Header></Header>
      <Container>{children}</Container>
      {/* <Footer></Footer> */}
    </div>
  );
}
