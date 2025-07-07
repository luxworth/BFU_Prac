import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardMedia from '@mui/material/CardMedia';
import { fetchNews } from '../api';

export default function NewsList() {
  const [news, setNews] = React.useState(null);

  React.useEffect(() => {
    fetchNews().then(setNews).catch(() => setNews([]));
  }, []);

  if (!news) {
    return (
      <Box textAlign="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // helper to get first image and clean summary
  const parseSummary = (html) => {
    const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    const img = imgMatch ? imgMatch[1] : null;
    const clean = html.replace(/<img[^>]*>/gi, '');
    return { img, clean };
  };

  return (
    <Grid container spacing={2}>
      {news.map((item, idx) => {
        const { img, clean } = parseSummary(item.summary);
        return (
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              {img && (
                <CardMedia
                  component="img"
                  image={img}
                  alt={item.title}
                  sx={{ width: { xs: '40%', sm: 200, md: 220 }, objectFit: 'cover' }}
                />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                <CardContent sx={{ flex: '1 0 auto', pt: 1, pb: 1.5, pr: 2, minWidth: 0 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.published}
                  </Typography>
                  <Box
                    sx={{ typography: 'body2', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: clean }}
                  />
                </CardContent>
                <CardActions sx={{ pl: 2, pt: 0 }}>
                  <Button size="small" href={item.link} target="_blank">
                    Читать
                  </Button>
                </CardActions>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
} 