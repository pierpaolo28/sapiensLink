import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';

export default function ListRankSwitcher(props: any) {
    return (
        <Box display="flex" justifyContent="center" mb={2}>
        <ToggleButtonGroup
            color="primary"
            exclusive
            aria-label="list type"
            sx={{ width: '100%' }}
        >
            <ToggleButton value="lists" onClick={() => window.location.href = "/list_home"} sx={{ width: '50%' }}>
                Lists
            </ToggleButton>
            <ToggleButton value="ranks" onClick={() => window.location.href = "/rank_home"} sx={{ width: '50%' }}>
                Ranks
            </ToggleButton>
        </ToggleButtonGroup>
    </Box>);
}