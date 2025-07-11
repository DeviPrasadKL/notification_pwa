import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Paper, Stack, Typography } from '@mui/material';
import { green, red } from '@mui/material/colors';

export default function PieClock({ effectiveLoginTime, loginTime, loginHours, displayText }) {
    const theme = useTheme();

    // Helper to parse effective login time string ("00h 00m 00s") into seconds
    const getEffectiveSeconds = (timeStr) => {
        const match = timeStr.match(/(\d+)h\s+(\d+)m\s+(\d+)s/);
        if (!match) return 0;
        // match is [full, h, m, s] but as strings, convert to number
        const [, h, m, s] = match;
        return Number(h) * 3600 + Number(m) * 60 + Number(s);
    };

    // Helper to get max seconds based on loginTime date and loginHours config
    const getMaxSeconds = (loginTimeDate, loginHoursObj) => {
        if (!loginTimeDate) return 1;
        const isSaturday = loginTimeDate.getDay() === 6;
        const hours = isSaturday ? loginHoursObj.saturday : loginHoursObj.weekday;
        return hours * 3600;
    };

    const effectiveSeconds = getEffectiveSeconds(effectiveLoginTime);
    const maxSeconds = getMaxSeconds(loginTime, loginHours);

    const radius = 40;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const percent = Math.min(effectiveSeconds / maxSeconds);
    const strokeDashoffset = circumference * (1 - percent);
    const overallPercentage = Math.floor(percent * 100);

    const secondsInMinute = effectiveSeconds % 60;
    const secondsAngle = (secondsInMinute / 60) * 360;

    const backgroundFill = theme.palette.background.paper || '#f5f5f5';
    const trackStroke = overallPercentage >= 100 ? red[400] : theme.palette.action.disabledBackground || '#e0e0e0';
    const progressStroke = overallPercentage >= 100 ? green[400] : theme.palette.primary.main;
    const secondsHandColor = theme.palette.secondary.main || '#f50057';

    const secondsHandLength = radius * 0.75;

    return (
        <Paper sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: "1rem", padding: "0.5rem" }} >
            <Stack>
                {/* Label above */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ userSelect: 'none' }}
                >
                    Effective login hours
                </Typography>

                {/* Fixed width + monospace for stable layout */}
                <Typography
                    variant="body1"
                    sx={{
                        userSelect: 'none',
                    }}
                >
                    {displayText}
                </Typography>

                {/* Percentage */}
                <Typography
                    variant="body2"
                    sx={{
                        userSelect: 'none',
                    }}
                >
                    {overallPercentage}%
                </Typography>
            </Stack>

            {/* SVG clock */}
            <svg width={radius * 2} height={radius * 2} style={{ overflow: 'visible' }}>
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill={backgroundFill}
                    stroke={trackStroke}
                    strokeWidth={stroke}
                />
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke={progressStroke}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${radius} ${radius})`}
                />
                <line
                    x1={radius}
                    y1={radius}
                    x2={radius + secondsHandLength * Math.cos((secondsAngle - 90) * (Math.PI / 180))}
                    y2={radius + secondsHandLength * Math.sin((secondsAngle - 90) * (Math.PI / 180))}
                    stroke={secondsHandColor}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
                <circle cx={radius} cy={radius} r={stroke / 3} fill={secondsHandColor} />
            </svg>
        </Paper>
    );
}
