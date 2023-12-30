import { Typography, Link } from "@mui/material";

export default function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="">
                SapiensLink
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}