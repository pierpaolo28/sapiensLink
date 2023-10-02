import {
  Group,
  Button,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const navigate = useNavigate();

  const onSignup = (isUser: boolean) => {
    console.log("isUser", isUser);

    navigate(isUser ? "/login" : "/signup");
  };

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          LOGO
          <Group h="100%" gap={0} visibleFrom="sm">
            <a href="/" className={classes.link}>
              SapiensLink
            </a>
          </Group>
          <Group visibleFrom="sm">
            <Button variant="default" onClick={() => onSignup(true)}>
              Log in
            </Button>
            <Button onClick={() => onSignup(false)}>Sign up</Button>
          </Group>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default" onClick={() => onSignup(true)}>
              Log in
            </Button>
            <Button onClick={() => onSignup(false)}>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
