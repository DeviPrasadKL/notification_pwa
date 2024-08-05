import { Button, Container, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import useTime from '../Customhooks/useTime';

export default function Logout() {

    const [login, setLogin] = useState("");

    const time = useTime();

    const handleLogin = () => {
        const formattedDate = `${time.split("T")[0]} - ${(time.split("T")[1]).split(".")[0]}`
        setLogin(formattedDate);
    }

    return (
        <Container>
            <Stack justifyContent='center' alignItems='center' pt={2} gap={2}>
                <Button variant='outlined' onClick={handleLogin}>Login in</Button>
                <Typography variant='p'>{login}</Typography>
            </Stack>
        </Container>
    )
}
