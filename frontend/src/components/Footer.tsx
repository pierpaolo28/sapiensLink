import { Text } from "@mantine/core";
import Container from "./shared/Container";

const footerLinks = [
  { id: 0, name: "SapiensLink", url: "" },
  { id: 1, name: "About Us", url: "" },
  { id: 2, name: "Contact Us", url: "" },
];

export default function Footer() {
  return (
    <div className="bg-[#DEE2E6]">
      <Container className="flex flex-col items-center lg:flex-row lg:justify-around lg:h-[60px]">
        {footerLinks.map((link) => (
          <Text key={link.id} size="xl" c="gray.6">
            {link.name}
          </Text>
        ))}
      </Container>
    </div>
  );
}
