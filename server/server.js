const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Configurazione delle route statiche per servire i file HTML, CSS e JS
app.use(express.static(path.join(__dirname, '../client/home')));
app.use(express.static(path.join(__dirname, '../client/channel')));
app.use(express.static(path.join(__dirname, '../client/video')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/home', 'home.html'));
});

app.get('/channel', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/channel', 'channel.html'));
});

app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/video', 'video.html'));
});

const apiKey = 'AIzaSyC3MeleVVPXGUhZUL6OrI7H34nH0Bga3qA'; // Sostituisci con la tua API Key di YouTube


// Gestione della richiesta GET a '/api/channel'
app.get('/api/channel', async (req, res) => {
  try {

    const channel = req.query.channel;
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,status&forUsername=${channel}&key=${apiKey}`;
    const response = await axios.get(apiUrl);

    const data = response.data;

    if (data.items.length === 0) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    const statistics = data.items[0].statistics;
    const snippet = data.items[0].snippet;
    const status = data.items[0].status;

    const channelData = {
      subscriberCount: statistics.subscriberCount,
      viewCount: statistics.viewCount,
      videoCount: statistics.videoCount,
      hiddenSubscriberCount: statistics.hiddenSubscriberCount,
      country: snippet.country,
      madeForKids: status.madeForKids
    };

    res.json(channelData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/video', async (req, res) => {
  try {

    const url = req.query.url;
    const videoId = extractVideoId(url);

    // Funzione per estrarre l'ID del video YouTube dalla URL
    function extractVideoId(url) {
      // Controlla se l'URL contiene il parametro 'v'
      const urlParams = new URLSearchParams(new URL(url).search);
      if (urlParams.has('v')) {
        return urlParams.get('v');
      }
    
      // Controlla se l'URL contiene l'ID nel formato /watch?v=xxxxx
      const match = url.match(/\/watch\?v=(\w+)/);
      if (match) {
        return match[1];
      }
    
      // Controlla se l'URL contiene l'ID nel formato /embed/xxxxx
      const embedMatch = url.match(/\/embed\/(\w+)/);
      if (embedMatch) {
        return embedMatch[1];
      }
    
      // Restituisci null se l'ID del video non può essere trovato
      return null;
    }


    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`;
    const response = await axios.get(apiUrl);

    const data = response.data;

    if (data.items.length === 0) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const statistics = data.items[0].statistics;

    const videoData = {
      viewCount: statistics.viewCount,
      likeCount: statistics.likeCount,
      commentCount: statistics.commentCount
    };

    res.json(videoData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/popularVideos', async (req, res) => {
  try {
    const channel = req.query.channel;

    const apiURLChannelID = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forUsername=${channel}&part=id`;
    const responseChannelID = await axios.get(apiURLChannelID);
    const dataChannelID = responseChannelID.data;
    const channelID = dataChannelID.items[0].id;

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelID}&key=${apiKey}&maxResults=5&order=viewcount`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    const videos = [];

    if (data.items.length === 0) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    for (const item of data.items) {
      const videoID = item.id.videoId;
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${apiKey}&part=snippet,contentDetails,statistics,status`;
      const videoResponse = await axios.get(videoUrl);
      const videoData = videoResponse.data;
      const statistics = videoData.items[0].statistics;
      const video = {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        viewCount: statistics.viewCount,
      };
      videos.push(video);
    }
    res.json({ videos });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Avvio del server sulla porta 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
