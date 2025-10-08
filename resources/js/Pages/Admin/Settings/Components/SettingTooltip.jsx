import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * SettingTooltip Component
 * 
 * Displays an information icon with a tooltip containing the setting description
 * and optional examples of valid values.
 */
const SettingTooltip = ({ description, examples = [] }) => {
    const tooltipContent = (
        <div style={{ maxWidth: 300 }}>
            <div style={{ marginBottom: examples.length > 0 ? 8 : 0 }}>
                {description}
            </div>
            {examples.length > 0 && (
                <div style={{ fontSize: '0.85em', opacity: 0.9, marginTop: 8 }}>
                    <strong>Ejemplos:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                        {examples.map((example, index) => (
                            <li key={index}>{example}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <Tooltip 
            title={tooltipContent} 
            arrow 
            placement="right"
            enterDelay={300}
        >
            <IconButton 
                size="small" 
                sx={{ 
                    ml: 0.5,
                    opacity: 0.6,
                    '&:hover': { opacity: 1 }
                }}
            >
                <InfoOutlinedIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default SettingTooltip;

