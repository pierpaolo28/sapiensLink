import { Text } from "@mantine/core";
import Container from "./shared/Container";

export default function Footer() {
  return (
    <div className="relative bg-[#DEE2E6] h-[100px] lg:h-[144px] flex items-center">
      <Container className="toggle-row-column toggle-p-font-size ">
        <Text c="gray.6">
          Contact:
          <a href="mailto:contact@aiseowriter.co">contact@sapiens.co</a>
        </Text>
        <Text c="gray.6">
          Copyright © {new Date().getFullYear()}. Made with ♥ by Human Sapiens.
        </Text>
      </Container>
    </div>
  );
}
