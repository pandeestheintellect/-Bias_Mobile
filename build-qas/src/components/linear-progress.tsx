import { Typography } from '@material-ui/core';
import { LinearProgressProps, Box, LinearProgress } from '@material-ui/core';
import React from 'react';

export  function LinearProgressWithLabel (props: LinearProgressProps & { value: number }) {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }
  