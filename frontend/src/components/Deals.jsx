import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { fetchDeals } from '../api';
import { useTheme } from '@mui/material/styles';

export default function Deals() {
  const [data, setData] = React.useState(null);
  const theme = useTheme();
  const freeBg = theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark;
  const freeColor = theme.palette.getContrastText(freeBg);

  React.useEffect(() => {
    fetchDeals().then(setData).catch(() => setData({ deals: [], freebies: [] }));
  }, []);

  if (!data) {
    return (
      <Box textAlign="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  const { deals, freebies } = data;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Скидки
        </Typography>
        {deals.map((d) => (
          <Card key={d.dealID} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{d.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Цена: ${d.salePrice} {d.normalPrice ? `(обычно $${d.normalPrice})` : ''} — Экономия {parseFloat(d.savings).toFixed(1)}%
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href={d.link} target="_blank">
                Перейти
              </Button>
            </CardActions>
          </Card>
        ))}
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Бесплатные раздачи
        </Typography>
        {freebies.map((f) => (
          <Card key={f.dealID} sx={{ mb: 2, backgroundColor: freeBg, color: freeColor }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: freeColor }}>
                {f.title}
              </Typography>
              <Typography variant="body2" sx={{ color: freeColor }}>
                Сейчас бесплатно
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href={f.link} target="_blank" sx={{ color: freeColor, borderColor: freeColor }}>
                Получить
              </Button>
            </CardActions>
          </Card>
        ))}
      </Grid>
    </Grid>
  );
} 